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
const pdf2img = require('pdf2img');
const request = require('request');
const axios = require('axios');
const poppler = require('pdf-poppler');

// Google Cloud credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = './your-google-cloud-key.json'; // Replace with your Google Cloud key
const rapidapiKey = '84b4c31c99msh01ed13b98a6eaa3p125e24jsnd127670bc3d3'; // RapidAPI Key for GPT-4 API

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// SQLite DB Path
const dbPath = path.join(__dirname, 'diagonalasis.db');
let db = null;
const app = express();
app.use(express.json());
app.use(cors());

// Initialize SQLite Database and Server
const initializeDbAndServe = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log('Server is running on http://localhost:3005');
    });
  } catch (e) {
    console.log(`Error DB: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServe();

// Function to convert PDF to PNG using pdf-poppler
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
    return path.join(outputDir, `${opts.out_prefix}-1.png`);  // Return first page PNG
  } catch (error) {
    throw new Error(`Error converting PDF: ${error}`);
  }
};

// Function to extract text from PNG using Google Vision API
const extractTextFromImage = async (imagePath) => {
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.textDetection(imagePath);
  const extractedText = result.textAnnotations.length ? result.textAnnotations[0].description : '';
  if (!extractedText) throw new Error('No text detected');
  return extractedText;
};

// Function to analyze text using GPT-4 Turbo (via RapidAPI)
const analyzeTextUsingRapidAPI = async (extractedText) => {
  const url = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
  const headers = {
    'content-type': 'application/json',
    'X-RapidAPI-Key': rapidapiKey,
  };
  const payload = {
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'user',
        content: `Analyze the following text:
          Text: ${extractedText}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  };
  try {
    const response = await axios.post(url, payload, { headers });
    return response.data.choices[0].message.content;
  } catch (error) {
    throw new Error(`Error analyzing text: ${error}`);
  }
};

// Function to translate text using Google Translate API
const translateText = async (text, targetLanguage = 'en') => {
  const translate = new Translate();
  const [translatedText] = await translate.translate(text, targetLanguage);
  return translatedText;
};

// Route for user signup
app.post('/signup', async (request, response) => {
  const { username, firstname, lastname, email, phoneNumber, dateOfBirth, password } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  
  if (!dbUser) {
    const createUserQuery = `
      INSERT INTO users (username, firstname, lastname, password, email, phone_number, date_of_birth) 
      VALUES ('${username}', '${firstname}', '${lastname}', '${hashedPassword}', '${email}', '${phoneNumber}', '${dateOfBirth}')
    `;
    const dbResponse = await db.run(createUserQuery);
    response.send({ success: 'User created', userId: dbResponse.lastID });
  } else {
    response.status(400).send('User already exists');
  }
});

// Route for user login
app.post('/login', async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);

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

// Route for processing uploaded files (image or PDF)
app.post('/upload', upload.single('file'), async (req, res) => {
  const inputFile = req.file.path;
  const targetLanguage = req.body.language || 'en';

  try {
    // Convert file to PNG if it's a PDF
    const imagePath = inputFile.endsWith('.pdf') ? await convertPdfToPng(inputFile) : inputFile;
    
    // Extract text from the PNG
    const extractedText = await extractTextFromImage(imagePath);

    // Analyze the text using GPT-4
    const analyzedText = await analyzeTextUsingRapidAPI(extractedText);

    // Translate the analyzed text
    const translatedText = await translateText(analyzedText, targetLanguage);

    // Respond with the extracted, analyzed, and translated text
    res.status(200).send({ extractedText, analyzedText, translatedText });
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

module.exports = app;






// const fs = require('fs');
// const vision = require('@google-cloud/vision');
// const { Translate } = require('@google-cloud/translate').v2;
// const Jimp = require('jimp');
// const pdf2img = require('pdf2img');
// const multer = require('multer');
// const deepTranslator = require('deepl-translator').GoogleTranslator;
// const request = require('request');

// // Set up multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// // Google Cloud credentials
// process.env.GOOGLE_APPLICATION_CREDENTIALS = 'C:\Users\garla\OneDrive\Desktop\Hackathon\tokyo-comfort-437112-m2-bbbfc5627fa6.json';  // Replace with your key

// // RapidAPI Key for ChatGPT API
// const rapidapi_key = '84b4c31c99msh01ed13b98a6eaa3p125e24jsnd127670bc3d3';

// // Function to convert PDF or Image to PNG
// const convertToPng = (inputFile, callback) => {
//     const outputPng = 'output.png';
//     const fileExtension = inputFile.split('.').pop().toLowerCase();

//     if (fileExtension === 'pdf') {
//         pdf2img.setOptions({
//             type: 'png', density: 300, outputdir: './', outputname: 'output', page: 1
//         });
//         pdf2img.convert(inputFile, (err, info) => {
//             if (err) return callback(err);
//             callback(null, info[0].path); // Returns the path of the PNG
//         });
//     } else {
//         Jimp.read(inputFile)
//             .then(image => {
//                 return image.write(outputPng, (err) => {
//                     if (err) return callback(err);
//                     callback(null, outputPng);
//                 });
//             })
//             .catch(err => callback(err));
//     }
// };

// // Function to extract text using Google Cloud Vision API
// const extractTextFromImage = async (imagePath) => {
//     const client = new vision.ImageAnnotatorClient();
//     const [result] = await client.textDetection(imagePath);
//     const detections = result.textAnnotations;
//     return detections.length ? detections[0].description : '';
// };

// // Function to analyze extracted text using RapidAPI GPT-4 Turbo
// const analyzeTextUsingRapidApi = (extractedText, callback) => {
//     const url = "https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions";
//     const headers = {
//         'content-type': 'application/json',
//         'X-RapidAPI-Key': rapidapi_key
//     };
//     const payload = {
//         model: "gpt-4-turbo",
//         messages: [{
//             role: "user",
//             content: `Analyze the following text and provide the output in this format:
//             1. Symptoms for disease:
//             2. Why it is caused?:
//             3. What it is?:
//             4. The stage of the disease:
//             5. What precautions we need to take?:
//             Text: ${extractedText}`
//         }],
//         max_tokens: 500,
//         temperature: 0.7
//     };

//     request.post({ url, headers, json: payload }, (error, response, body) => {
//         if (error || response.statusCode !== 200) {
//             return callback(new Error('Error with RapidAPI request: ${error || response.statusCode}'));
//         }
//         const result = body.choices[0].message.content;
//         callback(null, result);
//     });
// };

// // Function to translate text using Deep Translator
// const translateText = (text, targetLanguage, callback) => {
//     const translator = new deepTranslator({ target: targetLanguage });
//     translator.translate(text)
//         .then(translated => callback(null, translated))
//         .catch(err => callback(err));
// };

// // Main function to handle the entire process
// const main = (inputFile, targetLanguage = 'en') => {
//     convertToPng(inputFile, (err, pngFile) => {
//         if (err) return console.error('Error converting file:', err);

//         extractTextFromImage(pngFile)
//             .then(extractedText => {
//                 console.log('Extracted Text:', extractedText);

//                 analyzeTextUsingRapidApi(extractedText, (err, formattedOutput) => {
//                     if (err) return console.error('Error analyzing text:', err);

//                     translateText(formattedOutput, targetLanguage, (err, translatedOutput) => {
//                         if (err) return console.error('Error translating text:', err);

//                         console.log('Translated Output:', translatedOutput);
//                     });
//                 });
//             })
//             .catch(err => console.error('Error extracting text:', err));
//     });
// };

// // Example usage: upload file and specify target language (can be 'en', 'es', etc.)
// main('./path-to-your-input-file.pdf', 'en');