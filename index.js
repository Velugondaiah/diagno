// Import required modules
const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const poppler = require('pdf-poppler');
const translate = require('translate-google');
require('dotenv').config(); // Load environment variables

// RapidAPI Key - Update this section
const rapidapiKey = '54bd8d45b5mshbda6cdbbee7fe51p1ad5bfjsn9363f2cba62e';
// Alternatively, you can use environment variable:
// const rapidapiKey = process.env.RAPIDAPI_KEY || '33169e1b0bmsh020812e008c5a72p16d18bjsn7baf170e0067';

// Initialize the Express app
const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000','https://diagno-ai-one-api-hack-kpr.vercel.app/'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// SQLite DB Path
const dbPath = path.join(__dirname, 'diagonalasis.db');
let db = null;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Add the check-availability endpoint
app.get('/api/appointments/check-availability', async (req, res) => {
    try {
        const { doctor_id, date, time } = req.query;
        
        console.log('Checking availability for:', { doctor_id, date, time }); // Debug log

        const query = `
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE doctor_id = ? 
            AND date = ? 
            AND time = ?
        `;

        const result = await db.get(query, [doctor_id, date, time]);
        
        console.log('Query result:', result); // Debug log

        // If count is 0, the slot is available
        const available = result.count === 0;

        res.json({ 
            available,
            message: available ? 'Time slot is available' : 'Time slot is already booked'
        });

    } catch (error) {
        console.error('Error checking appointment availability:', error);
        res.status(500).json({ 
            message: 'Error checking appointment availability',
            error: error.message 
        });
    }
});

// Initialize SQLite Database and Server
const initializeDbAndServe = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Create users table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                firstname TEXT NOT NULL,
                lastname TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phoneNumber TEXT NOT NULL,
                dateOfBirth TEXT NOT NULL,
                gender TEXT NOT NULL,
                password TEXT NOT NULL,
                profile_image TEXT,
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add this new table creation
        await db.exec(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doctor_id INTEGER NOT NULL,
                patient_id INTEGER NOT NULL,
                patient_name VARCHAR(50) NOT NULL,
                gender VARCHAR(10) NOT NULL,
                age INTEGER NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                phone_number VARCHAR(15) NOT NULL,
                address VARCHAR(255) NOT NULL,
                specialist VARCHAR(50) NOT NULL,
                location VARCHAR(50) NOT NULL,
                FOREIGN KEY (doctor_id) REFERENCES doctors(id),
                FOREIGN KEY (patient_id) REFERENCES users(id)
            )
        `);

        const server = app.listen(3008)
            .on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log('Port 3008 is busy, trying 3009...');
                    server.close();
                    app.listen(3007, () => {
                        console.log('Server is running on http://localhost:3008');
                    });
                } else {
                    console.error(`Server error: ${err.message}`);
                }
            })
            .on('listening', () => {
                console.log('Server is running on http://localhost:3008');
            });

    } catch (e) {
        console.error(`Error initializing DB: ${e.message}`);
        process.exit(1);
    }
};

// PDF to PNG conversion
const convertPdfToPng = async (inputFile) => {
    const outputDir = path.dirname(inputFile);
    const opts = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: path.basename(inputFile, path.extname(inputFile)),
        page: null,
    };
    try {
        await poppler.convert(inputFile, opts);
        return path.join(outputDir, `${opts.out_prefix}-1.png`); // Return first page of PDF
    } catch (error) {
        throw new Error(`Error converting PDF: ${error.message}`);
    }
};

// Extract text from an image using Tesseract
const extractTextFromImage = async (imagePath) => {
    console.log('Processing image:', imagePath);
    try {
        const worker = await Tesseract.createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(imagePath);
        await worker.terminate();
        console.log('Extracted text:', text);
        if (!text) throw new Error('No text detected');
        return text;
    } catch (error) {
        console.error('Error in Tesseract OCR:', error.message);
        throw error;
    }
};

// Analyze text using GPT-4 API (via RapidAPI)
const analyzeTextUsingRapidAPI = async (extractedText) => {
    const url = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
    const headers = {
        'content-type': 'application/json',
        'X-RapidAPI-Key': rapidapiKey,
        'X-RapidAPI-Host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com'
    };
    
    const systemPrompt = `You are a medical expert. Analyze this medical report and provide a clear, structured response. 
    Always follow this EXACT format:

    1. Symptoms:
    - List all symptoms mentioned
    - Be specific and clear

    2. Diagnosis:
    - Provide clear diagnosis
    - Include medical terminology with simple explanations

    3. Severity Level:
    - Specify severity (Mild/Moderate/Severe)
    - Explain why this level was chosen

    4. Treatment Recommendations:
    - List specific treatments needed
    - Include medications if applicable
    - Provide lifestyle recommendations

    5. Recommended Specialist:
    - Specialist: [EXACTLY ONE OF: Dermatologist/Cardiologist/Neurologist/Orthopedist/Ophthalmologist/ENT/Gastroenterologist/Pulmonologist/Endocrinologist/Oncologist]
    - Reason: [Brief explanation why this specialist is needed]

    Keep the format exactly as above with numbered points and clear line breaks.`;

    const payload = {
        model: 'gpt-4',
        messages: [
            { 
                role: 'system', 
                content: systemPrompt
            },
            {
                role: 'user',
                content: `Please analyze this medical report and provide analysis in the specified format: ${extractedText}`
            }
        ],
        temperature: 0.3,
        max_tokens: 1000
    };

    try {
        console.log('Sending request to GPT API...');
        const response = await axios.post(url, payload, { headers });
        if (response.data && response.data.choices && response.data.choices[0]) {
            const result = response.data.choices[0].message.content;
            console.log('Analysis result:', result);
            return result;
        } else {
            throw new Error('Invalid response structure from GPT API');
        }
    } catch (error) {
        console.error('GPT API Error:', error);
        throw error;
    }
};

// Language code mapping
const languageCodeMap = {
    'telugu': 'te',
    'hindi': 'hi',
    'tamil': 'ta',
    'kannada': 'kn',
    'malayalam': 'ml',
    'marathi': 'mr',
    'bengali': 'bn',
    'gujarati': 'gu',
    'punjabi': 'pa',
    'english': 'en'
};

// Translation function
const translateText = async (text, targetLanguage) => {
    const languageCode = languageCodeMap[targetLanguage.toLowerCase()] || 'en';
    console.log(`Attempting to translate to language: ${targetLanguage} (code: ${languageCode})`);
    try {
        if (targetLanguage === 'english' || languageCode === 'en') {
            return text;
        }
        const translatedText = await translate(text, { to: languageCode });
        console.log('Translation completed');
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        throw new Error(`Translation failed: ${error.message}`);
    }
};

// Analyze X-ray images
const analyzeXrayUsingRapidAPI = async (imagePath) => {
    const url = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
    
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        
        const headers = {
            'content-type': 'application/json',
            'X-RapidAPI-Key': rapidapiKey,
            'X-RapidAPI-Host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com'
        };

        const systemPrompt = `You are an experienced radiologist. Analyze this X-ray image and provide 
        a detailed interpretative report. Be specific and explain findings in both medical and simple terms. 
        Follow EXACTLY this format:
        1. X-ray Overview:
        - Describe what type of X-ray this is (e.g., chest, limb, spine)
        - Explain the quality and positioning of the image
        - Identify and describe key anatomical structures visible
        - Note any obvious abnormalities or areas of interest
        2. Fracture Status:
        - Clearly state if any fractures are present or not
        - If fractures exist, describe exact location and type
        - Explain bone alignment and any displacement
        - Describe any signs of previous fractures or healing
        3. Severity Level:
        - Provide clear assessment (Mild/Moderate/Severe)
        - Explain why this severity level was chosen
        - Describe potential impact on patient mobility/function
        - Compare to normal expected appearance
        4. Required Actions:
        - List specific immediate medical attention needed
        - Recommend types of specialists to consult
        - Suggest specific imaging or tests needed
        - Outline urgent vs non-urgent steps
        5. Care Instructions:
        - List specific activity restrictions with timeframes
        - Provide detailed pain management suggestions
        - Explain expected recovery timeline
        - Specify when to seek immediate medical attention
        - Detail follow-up care requirements`;
        
        const payload = {
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
        
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Please analyze this X-ray image following the specified format."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.2,
            max_tokens: 1000
        };

        const response = await axios.post(url, payload, { headers });
        
        if (!response.data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid response structure from API');
        }

        return response.data.choices[0].message.content
            .trim()
            .replace(/\n\n+/g, '\n\n')
            .replace(/^\s+/gm, '')
            .replace(/^(\d+)\./gm, '\n$1.');

    } catch (error) {
        console.error('X-ray Analysis Error:', error.response?.data || error.message);
        throw new Error(`X-ray analysis failed: ${error.message}`);
    }
};

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
    console.log('Upload request received:', {
        file: req?.file?.originalname,
        language: req.body?.language,
        fileType: req.body?.fileType
    });

    try {
        if (!req.file) {
            console.log('No file received');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const inputFile = req.file.path;
        const targetLanguage = (req.body.language || 'english').toLowerCase();
        const fileType = req.body.fileType || 'text';

        console.log('Processing file:', {
            path: inputFile,
            language: targetLanguage,
            type: fileType
        });

        let imagePath = inputFile;
        let analysisResult;

        try {
            if (fileType === 'xray') {
                console.log('Starting X-ray analysis...');
                analysisResult = await analyzeXrayUsingRapidAPI(imagePath);
                console.log('X-ray analysis completed');
            } else {
                const extractedText = await extractTextFromImage(imagePath);
                if (!extractedText) {
                    throw new Error('No text could be extracted from the image');
                }
                analysisResult = await analyzeTextUsingRapidAPI(extractedText);
            }

            if (!analysisResult) {
                throw new Error('Analysis failed to produce results');
            }

            let finalOutput = analysisResult;
            if (targetLanguage !== 'english') {
                console.log(`Translating to ${targetLanguage}...`);
                finalOutput = await translateText(analysisResult, targetLanguage);
            }

            // Cleanup files
            try {
                fs.unlinkSync(inputFile);
                if (imagePath !== inputFile) {
                    fs.unlinkSync(imagePath);
                }
            } catch (cleanupError) {
                console.error('File cleanup error:', cleanupError);
            }

            console.log('Processing completed successfully');
            res.status(200).json({
                formattedOutput: finalOutput,
                targetLanguage,
                translationPerformed: targetLanguage !== 'english',
                fileType
            });

        } catch (processingError) {
            console.error('Processing error:', processingError);
            res.status(400).json({
                error: 'Processing failed',
                details: processingError.message
            });
        }

    } catch (error) {
        console.error('Upload route error:', error);
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

// Test API route
app.get('/test-api', async (req, res) => {
    try {
        const response = await axios.get('https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/test', {
            headers: {
                'X-RapidAPI-Key': rapidapiKey,
                'X-RapidAPI-Host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com'
            }
        });
        res.json({ status: 'API key is valid', response: response.data });
    } catch (error) {
        res.status(400).json({ 
            error: 'API key validation failed', 
            details: error.message 
        });
    }
});

// Signup route
app.post('/signup', async (request, response) => {
    try {
        const { username, firstname, lastname, email, phoneNumber, dateOfBirth, gender, password } = request.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
        const dbUser = await db.get(selectUserQuery, [username]);
        
        if (dbUser) {
            response.status(400).json({ error: 'User already exists' });
            return;
        }

        const createUserQuery = `
            INSERT INTO users (username, firstname, lastname, email, phoneNumber, dateOfBirth, gender, password) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const dbResponse = await db.run(createUserQuery, 
            [username, firstname, lastname, email, phoneNumber, dateOfBirth, gender, hashedPassword]
        );
        
        response.status(200).json({ 
            success: true, 
            message: 'User created successfully',
            userId: dbResponse.lastID 
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        response.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

// Login route
app.post('/login', async (request, response) => {
    try {
        const { username, password } = request.body;
        
        const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
        const dbUser = await db.get(selectUserQuery, [username]);
        
        if (!dbUser) {
            response.status(400).json({ error: 'User not found' });
            return;
        }

        const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
        
        if (isPasswordMatched) {
            const jwtToken = jwt.sign({ username: username }, 'MY_SECRET_TOKEN');
            response.json({ 
                jwt_token: jwtToken,
                user: {
                    id: dbUser.id,
                    username: dbUser.username,
                    firstname: dbUser.firstname,
                    lastname: dbUser.lastname,
                    email: dbUser.email
                }
            });
        } else {
            response.status(400).json({ error: 'Invalid password' });
        }
        
    } catch (error) {
        console.error('Login error:', error);
        response.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

// Add this endpoint to fetch unique locations
app.get('/api/doctor-locations', async (req, res) => {
    
    try {
        const locations = await db.all(`
            SELECT DISTINCT location 
            FROM doctors 
            ORDER BY location
        `);
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

app.get("/api/doctor-locations/getDoctors", async (req, res) => {
    const { location, specialization } = req.query;
    console.log(location, specialization)
    const query = `SELECT * FROM doctors WHERE location = ? AND specialization = ?`;
    const doctors = await db.all(query, [location, specialization]);
    res.json(doctors);
});

// Add the appointments endpoint
app.post('/api/appointments', async (req, res) => {
    try {
        const {
            doctor_id,
            user_id,
            patient_name,
            gender,
            age,
            date,
            time,
            phone_number,
            address,
            specialist,
            location
        } = req.body;

        console.log('Received appointment data:', req.body);

        const query = `
            INSERT INTO appointments (
                doctor_id,
                user_id,
                patient_name,
                gender,
                age,
                date,
                time,
                phone_number,
                address,
                specialist,
                location
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            doctor_id,
            user_id,
            patient_name,
            gender,
            age,
            date,
            time,
            phone_number,
            address,
            specialist,
            location
        ]);

        console.log('Insert result:', result);

        res.status(201).json({
            message: 'Appointment created successfully',
            id: result.lastID
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({
            message: 'Failed to create appointment',
            error: error.message
        });
    }
});

// Add these new endpoints after other routes

// Get user profile endpoint
app.get('/api/user/:userId', async (request, response) => {
    try {
        const { userId } = request.params;
        const query = `SELECT id, username, firstname, lastname, email, phoneNumber, dateOfBirth, gender, profile_image, address 
                      FROM users 
                      WHERE id = ?`;
        
        const user = await db.get(query, [userId]);
        
        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        response.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        response.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

// Get user appointments endpoint
app.get('/api/appointments/:userId', async (request, response) => {
    try {
        const { userId } = request.params;
        
        const query = `
            SELECT a.*, d.name as doctor_name
            FROM appointments a
            LEFT JOIN doctors d ON a.doctor_id = d.id
            WHERE a.patient_id = ?
            ORDER BY a.date DESC, a.time DESC
        `;
        
        const appointments = await db.all(query, [userId]);
        
        response.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        response.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

// Add this middleware function after your imports
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, 'MY_SECRET_TOKEN', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Add this new endpoint for booking history
app.get('/booking-history', authenticateToken, async (req, res) => {
    try {
        // Get username from the verified token
        const username = req.user.username;
        
        // First get the user's ID
        const userQuery = 'SELECT id FROM users WHERE username = ?';
        const user = await db.get(userQuery, [username]);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Then get their appointments
        const query = `
            SELECT 
                a.*,
                d.name as doctor_name,
                CASE
                    WHEN a.date > date('now') THEN 'Upcoming'
                    ELSE 'Completed'
                END as status
            FROM appointments a
            LEFT JOIN doctors d ON a.doctor_id = d.id
            WHERE a.user_id = ?
            ORDER BY a.date DESC, a.time DESC
        `;
        
        const appointments = await db.all(query, [user.id]);
        res.json(appointments);
        
    } catch (error) {
        console.error('Error fetching booking history:', error);
        res.status(500).json({ 
            error: 'Failed to fetch booking history',
            details: error.message 
        });
    }
});

// Add this new endpoint for user profile
app.get('/user-profile', authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        console.log('Fetching profile for username:', username);

        // Update query to match actual table structure
        const query = `
            SELECT id, username, firstname, lastname, email, phoneNumber, 
                   dateOfBirth, gender, created_at
            FROM users 
            WHERE username = ?
        `;
        
        const user = await db.get(query, [username]);
        console.log('Query result:', user);

        if (!user) {
            console.log('No user found for username:', username);
            return res.status(404).json({ error: 'User not found' });
        }

        // Format the date
        if (user.dateOfBirth) {
            user.dateOfBirth = new Date(user.dateOfBirth).toLocaleDateString();
        }
        if (user.created_at) {
            user.created_at = new Date(user.created_at).toLocaleDateString();
        }

        res.json(user);
        
    } catch (error) {
        console.error('Error in /user-profile:', error);
        res.status(500).json({ 
            error: 'Failed to fetch user profile',
            details: error.message 
        });
    }
});

// Initialize the server
initializeDbAndServe();

module.exports = app;
