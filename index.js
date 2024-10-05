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
const Jimp = require('jimp');
const pdf2img = require('pdf2img');
const request = require('request');

// Google Cloud credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = './your-google-cloud-key.json'; // Replace with your Google Cloud key
const rapidapi_key = '84b4c31c99msh01ed13b98a6eaa3p125e24jsnd127670bc3d3'; // RapidAPI Key for GPT-4 API

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

const dbPath = path.join(__dirname, 'diagonalasis.db');
let db = null;
const app = express();
app.use(express.json());
app.use(cors());

// Initialize SQLite Database and Server
const initilizeDbAndServe = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log('This server is running on http://localhost:3005');
    });
  } catch (e) {
    console.log(`Error DB: ${e.message}`);
    process.exit(1);
  }
};
initilizeDbAndServe();

// Routes for user signup
app.post('/signup', async (request, response) => {
  const { username, firstname, lastname, email, phoneNumber, dateOfBirth, password } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO users (username, firstname, lastname, password, email, phone_number, date_of_birth) 
      VALUES ('${username}', '${firstname}', '${lastname}', '${hashedPassword}', '${email}', '${phoneNumber}', '${dateOfBirth}')
    `;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send({ success: 'User created', userId: newUserId });
  } else {
    response.status(400).send('User already exists');
  }
});

// Routes for user login
app.post('/login', async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    response.status(400).send('Invalid User');
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN');
      response.send({ jwt_token: jwtToken });
    } else {
      response.status(400).send('Invalid Password');
    }
  }
});

// Get all doctors
app.get('/doctors', async (request, response) => {
  const query = `SELECT * FROM doctors`;
  const doctorsResults = await db.all(query);

  if (doctorsResults) {
    response.status(200).send(doctorsResults);
  } else {
    response.status(400).send({ Failure: 'No Data Found' });
  }
});

// Function to convert PDF or Image to PNG
const convertToPng = (inputFile, callback) => {
  const outputPng = 'output.png';
  const fileExtension = inputFile.split('.').pop().toLowerCase();

  if (fileExtension === 'pdf') {
    pdf2img.setOptions({
      type: 'png',
      density: 300,
      outputdir: './',
      outputname: 'output',
      page: 1,
    });
    pdf2img.convert(inputFile, (err, info) => {
      if (err) return callback(err);
      callback(null, info[0].path); // Returns the path of the PNG
    });
  } else {
    Jimp.read(inputFile)
      .then((image) => {
        return image.write(outputPng, (err) => {
          if (err) return callback(err);
          callback(null, outputPng);
        });
      })
      .catch((err) => callback(err));
  }
};

// Function to extract text using Google Cloud Vision API
const extractTextFromImage = async (imagePath) => {
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.textDetection(imagePath);
  const detections = result.textAnnotations;
  return detections.length ? detections[0].description : '';
};

// Function to analyze extracted text using RapidAPI GPT-4 Turbo
const analyzeTextUsingRapidApi = (extractedText, callback) => {
  const url = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
  const headers = {
    'content-type': 'application/json',
    'X-RapidAPI-Key': rapidapi_key,
  };
  const payload = {
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'user',
        content: `Analyze the following text and provide the output in this format:
            1. Symptoms for disease:
            2. Why it is caused?:
            3. What it is?:
            4. The stage of the disease:
            5. What precautions we need to take?:
            Text: ${extractedText}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  };

  request.post({ url, headers, json: payload }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return callback(new Error(`Error with RapidAPI request: ${error || response.statusCode}`));
    }
    const result = body.choices[0].message.content;
    callback(null, result);
  });
};

// Function to translate text using Deep Translator
const translateText = (text, targetLanguage, callback) => {
  const translator = new deepTranslator({ target: targetLanguage });
  translator
    .translate(text)
    .then((translated) => callback(null, translated))
    .catch((err) => callback(err));
};

// Route for processing uploaded files (image or PDF)
app.post('/upload', upload.single('file'), (req, res) => {
  const inputFile = req.file.path;
  const targetLanguage = req.body.language || 'en';

  convertToPng(inputFile, (err, pngFile) => {
    if (err) return res.status(500).send('Error converting file.');

    extractTextFromImage(pngFile)
      .then((extractedText) => {
        analyzeTextUsingRapidApi(extractedText, (err, formattedOutput) => {
          if (err) return res.status(500).send('Error analyzing text.');

          translateText(formattedOutput, targetLanguage, (err, translatedOutput) => {
            if (err) return res.status(500).send('Error translating text.');

            res.status(200).send({ extractedText, formattedOutput, translatedOutput });
          });
        });
      })
      .catch((err) => res.status(500).send('Error extracting text.'));
  });
});

module.exports = app;
