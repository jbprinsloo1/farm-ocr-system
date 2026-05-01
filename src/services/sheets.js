const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

module.exports = async function saveToSheet(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = '1wZeoBLAAlK9S6Dl-2PAttNfjN2IbO2jnXrKc7Q29Ycc';
  const range = "'sen wes vrag'!A:I";

  const values = [[
    data.datum || '',         // Datum
    data.tyd || '',           // tyd
    data.materiaal || '',     // Produk
    data.afleweringNo || '',  // Vrag brief no
    data.vog || '',           // vog
    data.finaleGraad || '',   // graad
    data.nettoMassa || '',    // netto gewig
    data.voertuigReg || '',   // Nommer plaat
    data.land || ''           // land
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });

  return true;
};
