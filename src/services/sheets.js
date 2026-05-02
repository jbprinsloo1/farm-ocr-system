const { google } = require('googleapis');

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

module.exports = async function saveToSheet(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = '1wZeoBLAAlK9S6Dl-2PAttNfjN2IbO2jnXrKc7Q29Ycc';
  const range = "'sen wes vrag'!A:I";

  const values = [[
    data.datum || '',
    data.tyd || '',
    data.materiaal || '',
    data.afleweringNo || '',
    data.vog || '',
    data.finaleGraad || '',
    data.nettoMassa || '',
    data.voertuigReg || '',
    data.land || ''
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });

  return true;
};
