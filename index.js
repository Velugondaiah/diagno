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
const vision = require('@google-cloud/vision');
const { Translate } = require('@google-cloud/translate').v2;
const axios = require('axios');
const poppler = require('pdf-poppler');

// Google Cloud credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'C:\\Users\\garla\\OneDrive\\Desktop\\Hackathon\\backend\\credentials\\tokyo-comfort-437112-m2-bbbfc5627fa6.json';

// RapidAPI Key
const rapidapiKey = '3efdacf94emshf16c671952bd548p154347jsned18c78a2091';

// Initialize the Express app
const app = express();
app.use(express.json());
app.use(cors());

// SQLite DB Path
const dbPath = path.join(__dirname, 'diagonalasis.db');
let db = null;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize SQLite Database and Server
const initializeDbAndServe = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Try different ports if 3005 is in use
    const server = app.listen(3005)
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log('Port 3005 is busy, trying 3006...');
          server.close();
          app.listen(3006, () => {
            console.log('Server is running on http://localhost:3006');
          });
        } else {
          console.error(`Server error: ${err.message}`);
        }
      })
      .on('listening', () => {
        console.log('Server is running on http://localhost:3005');
      });

  } catch (e) {
    console.error(`Error initializing DB: ${e.message}`);
    process.exit(1);
  }
};

// PDF to PNG conversion
const convertPdfToPng = async (inputFile) => {
    console.log("mama")
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

// Extract text from an image using Google Vision API
const extractTextFromImage = async (imagePath) => {
  console.log('Processing image:', imagePath);
  const client = new vision.ImageAnnotatorClient();
  
  try {
    const [result] = await client.textDetection(imagePath);
    console.log('Full Vision API result:', JSON.stringify(result, null, 2));  // Log the full result for debugging

    const extractedText = result.textAnnotations.length ? result.textAnnotations[0].description : '';
    console.log('Extracted text:', extractedText);

    if (!extractedText) throw new Error('No text detected');
    return extractedText;

  } catch (error) {
    console.error('Error in Vision API call:', error.message);
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
  
  const systemPrompt = `You are a medical expert. Analyze the medical report and provide a clear, structured response. 
  Always follow this exact format:

  1. Symptoms for disease:
  - List all symptoms mentioned
  - Be specific and clear

  2. Why it is caused?:
  - List all causes mentioned
  - Include risk factors if any

  3. What it is?:
  - Provide clear diagnosis
  - Include medical terminology with simple explanations

  4. The stage of the disease:
  - Specify current stage if mentioned
  - Include severity assessment

  5. What precautions we need to take?:
  - List all recommended precautions
  - Include lifestyle changes if applicable
  - Mention follow-up requirements

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
    temperature: 0.3, // Lower temperature for more consistent formatting
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

// Translate text using Google Translate API
const translateText = async (text, targetLanguage) => {
    const translate = new Translate();
    const languageCode = languageCodeMap[targetLanguage] || 'en';
    try {
        const [translatedText] = await translate.translate(text, languageCode);
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        throw new Error(`Translation failed: ${error.message}`);
    }
};

// User Signup route
app.post('/signup', async (request, response) => {
  const { 
    username, 
    firstname, 
    lastname, 
    email, 
    phoneNumber, 
    dateOfBirth,
    gender,
    password,
  } = request.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
  const dbUser = await db.get(selectUserQuery, [username]);

  if (!dbUser) {
    const createUserQuery = `
      INSERT INTO users (username, 
    firstname, 
    lastname, 
    email, 
    phoneNumber, 
    dateOfBirth,
    gender,
    password
  )VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const dbResponse = await db.run(createUserQuery, [
      username, firstname, lastname, 
      email, phoneNumber, dateOfBirth, 
      gender,hashedPassword
    ]);
    response.send({ success: 'User created', userId: dbResponse.lastID });
  } else {
    response.status(400).send('User already exists');
  }
});


// User Login route
app.post('/login', async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
  const dbUser = await db.get(selectUserQuery, [username]);
  const d = null;

  if (!dbUser) {
    response.status(400).send('Invalid User');
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const jwtToken = jwt.sign({ username: username }, 'MY_SECRET_TOKEN');
      response.send({ jwt_token: jwtToken });
    } else {
      response.status(400).send('Invalid Password');
    }
  }
});

/// File Upload Route
app.post('/upload', upload.single('file'), async (req, res) => {
    const inputFile = req.file.path;
    const targetLanguage = req.body.language || 'en';
  
    try {
        const imagePath = inputFile.endsWith('.pdf') ? await convertPdfToPng(inputFile) : inputFile;
        const extractedText = await extractTextFromImage(imagePath);
        
        if (!extractedText || extractedText.trim() === '') {
            return res.status(400).send('No valid text extracted from the image.');
        }
  
        // Get analysis in English first
        const analyzedText = await analyzeTextUsingRapidAPI(extractedText);
        
        if (!analyzedText || analyzedText.trim() === '') {
            return res.status(400).send('No valid analyzed text received from GPT-4 API.');
        }

        // Translate the analysis if a different language is selected
        let finalOutput = analyzedText;
        if (targetLanguage !== 'english') {
            finalOutput = await translateText(analyzedText, targetLanguage);
        }
  
        res.status(200).send({ formattedOutput: finalOutput });
  
    } catch (error) {
        console.error('Error in upload route:', error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Add language code mapping
const languageCodeMap = {
    'telugu': 'te',
    'hindi': 'hi',
    'tamil': 'ta',
    'kannada': 'kn',
    'malayalam': 'ml',
    'marathi': 'mr',
    'bengali': 'bn',
    'gujarati': 'gu',
    'punjabi': 'pa'
};

app.post('/x-ray-reports', async (req, res) => {
    console.log("mama")
})

// Add this endpoint to your backend
app.get('/user-profile', async (request, response) => {
  try {
    // Get token from authorization header
    const authHeader = request.headers.authorization;
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, 'MY_SECRET_TOKEN');
    const username = decoded.username;
    
    // Get user data from database
    const getUserQuery = `
      SELECT username, firstname, lastname, email, 
             phone_number, date_of_birth, gender, address, profile_image
      FROM users 
      WHERE username = ?`;
    
    const userData = await db.get(getUserQuery, [username]);
    
    if (!userData) {
      return response.status(404).json({ error: 'User not found' });
    }
    
    response.json(userData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    response.status(401).json({ error: 'Unauthorized' });
  }
});

initializeDbAndServe();

module.exports = app;
