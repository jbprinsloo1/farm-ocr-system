const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3001, '0.0.0.0', () => {
  console.log('Static test server running on http://0.0.0.0:3001');
});
