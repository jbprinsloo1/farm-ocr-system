const { google } = require('googleapis');

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const spreadsheetId = '1wZeoBLAAlK9S6Dl-2PAttNfjN2IbO2jnXrKc7Q29Ycc';

async function saveToSheet(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

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
}

async function getSheetData(sheetName) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'`
  });

  return res.data.values || [];
}

module.exports = {
  saveToSheet,
  getSheetData
};

async function saveReen(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const values = [[
    data.date || '',
    data.hoeveel || '',
    data.waar || ''
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "'Reën'!A:C",
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });

  return true;
}

module.exports.saveReen = saveReen;


async function saveKalfMerk(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Find next empty row based on column A
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Kalf merk'!A:A"
  });

  const nextRow = (existing.data.values || []).length + 1;

  const values = [[
    data.date || '',
    data.koeiNr || '',
    data.kalfNr || '',
    data.waar || '',
    data.nr || '',
    data.size || ''
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'Kalf merk'!A${nextRow}:F${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });

  return true;
}


module.exports.saveKalfMerk = saveKalfMerk;

async function saveBeesMinus(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Bees minus'!A:A"
  });

  const nextRow = (existing.data.values || []).length + 1;

  const values = [[
    data.date || '',
    data.wat || '',
    data.beesNr || ''
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'Bees minus'!A${nextRow}:C${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });

  return true;
}

module.exports.saveBeesMinus = saveBeesMinus;

async function saveBeesPlus(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Bees plus'!A:A"
  });

  const nextRow = (existing.data.values || []).length + 1;

  const values = [[
    data.date || '',
    data.wat || '',
    data.beesNr || ''
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'Bees plus'!A${nextRow}:C${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });

  return true;
}

module.exports.saveBeesPlus = saveBeesPlus;

async function saveTrokke(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Trokke'!A:A"
  });

  const nextRow = (existing.data.values || []).length + 1;

  const values = [[
    data.date || '',
    data.trokNrPlaat || '',
    data.gewig || '',
    data.drywerId || '',
    data.waar || ''
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'Trokke'!A${nextRow}:E${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });

  return true;
}

module.exports.saveTrokke = saveTrokke;

async function saveGif(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Gif'!A:A"
  });

  const nextRow = (existing.data.values || []).length + 1;

  const values = [[
    data.date || '',
    data.wat || ''
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'Gif'!A${nextRow}:B${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });

  return true;
}

module.exports.saveGif = saveGif;

async function saveAnder(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Ander'!A:A"
  });

  const nextRow = (existing.data.values || []).length + 1;

  const values = [[
    data.date || '',
    data.wat || '',
    data.waar || '',
    data.hoe || '',
    data.wie || '',
    data.aa || '',
    data.ab || ''
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'Ander'!A${nextRow}:G${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });

  return true;
}

module.exports.saveAnder = saveAnder;

async function updateTrokkeSlip(rowNumber, delivered, buyerWeight) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'Trokke'!F${rowNumber}:G${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[delivered ? 'YES' : '', buyerWeight || '']]
    }
  });

  return true;
}

module.exports.updateTrokkeSlip = updateTrokkeSlip;

async function removeBeesFromInventory(beesNr) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const inventorySheetName = 'Bees Inventaris';

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${inventorySheetName}'!A:Z`
  });

  const rows = readRes.data.values || [];
  if (rows.length < 2) return false;

  const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
  const beesNrCol = headers.findIndex(h =>
    h === 'bees nr' || h === 'beesnr' || h === 'bees no' || h === 'bees nommer'
  );

  if (beesNrCol === -1) {
    throw new Error('Bees nr column not found in Bees Inventaris');
  }

  const wanted = String(beesNr || '').trim();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets.find(
    s => s.properties.title === inventorySheetName
  );

  if (!sheet) {
    throw new Error('Bees Inventaris sheet not found');
  }

  const sheetId = sheet.properties.sheetId;

  for (let i = 1; i < rows.length; i++) {
    const current = String(rows[i][beesNrCol] || '').trim();

    if (current === wanted) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: i,
                  endIndex: i + 1
                }
              }
            }
          ]
        }
      });

      return true;
    }
  }

  return false;
}

module.exports.removeBeesFromInventory = removeBeesFromInventory;
