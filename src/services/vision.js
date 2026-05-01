const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

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
