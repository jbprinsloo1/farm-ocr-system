const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  const url = 'http://localhost:3000/api/scan';
  // Use the specific file provided by the user
  const imagePath = '/home/jbprinsloo1/20260421_122831.jpg';

  try {
    if (!fs.existsSync(imagePath)) {
      console.error(`Error: File not found at ${imagePath}`);
      return;
    }

    // Prepare Form Data
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    // Upload to our server
    console.log(`Uploading ${imagePath} to Farm OCR System...`);
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('Server Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

testUpload();
