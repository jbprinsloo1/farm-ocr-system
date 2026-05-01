const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
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
