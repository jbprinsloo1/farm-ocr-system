const vision = require('@google-cloud/vision');

console.log("ENV EXISTS:", !!process.env.GOOGLE_CREDENTIALS_BASE64);

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
);

const client = new vision.ImageAnnotatorClient({
  credentials
});

module.exports = {
  async extractText(filePath) {
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;

    if (!detections || !detections.length) {
      return '';
    }

    return detections[0].description || '';
  }
};
