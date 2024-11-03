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

// RapidAPI Key
const rapidapiKey = 'c35b7b0e3emsh9af2078e66b888fp159fd1jsn8ca9eccbfa19';

// Initialize the Express app
const app = express();
app.use(express.json());
app.use(cors());

// Add these headers to your backend
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

    // Try different ports if 3005 is in use
    const server = app.listen(3006)
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log('Port 3005 is busy, trying 3006...');
          server.close();
          app.listen(3005, () => {
            console.log('Server is running on http://localhost:3006');
          });
        } else {
          console.error(`Server error: ${err.message}`);
        }
      })
      .on('listening', () => {
        console.log('Server is running on http://localhost:3006');
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
    
    // Initialize worker
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Recognize text
    const { data: { text } } = await worker.recognize(imagePath);
    
    // Terminate worker
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

// Updated translation function using translate-google
const translateText = async (text, targetLanguage) => {
    const languageCode = languageCodeMap[targetLanguage.toLowerCase()] || 'en';
    console.log(`Attempting to translate to language: ${targetLanguage} (code: ${languageCode})`);
    
    try {
        // Skip translation if target is English
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

// Add this function to analyze X-ray images
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
        
        const systemPrompt = `You are a radiologist. Examine this X-ray image and provide a simple, clear report focusing on fractures.
        
        Provide your analysis in this format:

        FRACTURE ANALYSIS REPORT

        1. X-ray Overview:
        - Which body part is shown
        - Type of X-ray view

        2. Fracture Status:
        - Is there a fracture? (Yes/No)
        - Where exactly is the fracture?
        - What type of fracture?

        3. Severity Level:
        - How serious is the condition?
        - Is immediate medical attention needed?

        4. Required Actions:
        - What should the patient do now?
        - Which specialist should they see?
        - How urgent is the treatment needed?

        5. Care Instructions:
        - What should the patient avoid doing?
        - What precautions should they take?
        - When should they seek emergency care?

        Please be direct and clear in your analysis.`;

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
                            text: "Please examine this X-ray and tell me if there's a fracture, where it is, and what needs to be done."
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
            max_tokens: 1000
        };

        const response = await axios.post(url, payload, { headers });
        
        if (response.data && response.data.choices && response.data.choices[0]) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error('Invalid response from API');
        }
    } catch (error) {
        console.error('Vision API Error:', error.response?.data || error.message);
        throw new Error(`X-ray analysis failed: ${error.message}`);
    }
};

// Updated upload route to handle X-ray analysis
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const inputFile = req.file.path;
        const targetLanguage = (req.body.language || 'english').toLowerCase();
        const fileType = req.body.fileType || 'text';

        console.log('Processing request:', {
            file: req.file.originalname,
            language: targetLanguage,
            type: fileType
        });

        let analysisResult;
        try {
            if (fileType === 'xray') {
                console.log('Starting X-ray analysis...');
                analysisResult = await analyzeXrayUsingRapidAPI(inputFile);
            } else {
                const extractedText = await extractTextFromImage(inputFile);
                analysisResult = await analyzeTextUsingRapidAPI(extractedText);
            }

            let finalOutput = analysisResult;
            if (targetLanguage !== 'english') {
                console.log(`Translating to ${targetLanguage}...`);
                finalOutput = await translateText(analysisResult, targetLanguage);
            }

            // Cleanup files
            try {
                fs.unlinkSync(inputFile);
            } catch (cleanupError) {
                console.error('File cleanup error:', cleanupError);
            }

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

// Test route for translation
app.post('/test-translation', async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;
        
        if (!text || !targetLanguage) {
            return res.status(400).json({ error: 'Missing text or target language' });
        }

        console.log('Testing translation:', { text, targetLanguage });
        const translatedText = await translateText(text, targetLanguage);
        
        res.json({
            original: text,
            translated: translatedText,
            targetLanguage: targetLanguage
        });
    } catch (error) {
        console.error('Test translation error:', error);
        res.status(500).json({
            error: 'Translation test failed',
            details: error.message
        });
    }
});

// User routes (signup, login, profile, etc.) remain the same
// ... (keep all your existing user-related routes)

initializeDbAndServe();

module.exports = app;
