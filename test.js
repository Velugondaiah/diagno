const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testServer() {
    try {
        // Test health endpoint
        const health = await axios.get('http://localhost:3008/health');
        console.log('Health check:', health.data);

        // Test file upload
        const formData = new FormData();
        formData.append('file', fs.createReadStream('./test.txt'));
        formData.append('language', 'english');

        const upload = await axios.post('http://localhost:3008/analyze-file', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        console.log('Upload response:', upload.data);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testServer(); 