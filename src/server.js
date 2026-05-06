require('dotenv').config();

const express = require('express');
const path = require('path');
const scanRoutes = require('./routes/scan');
const dashboardRoute = require('./routes/dashboard');
const rainfallRoute = require('./routes/rainfall');
const senwesDashboardRoute = require('./routes/senwesDashboard');
const trokkeSlipsRoute = require('./routes/trokkeSlips');
const { getSheetData } = require('./services/sheets');
const { sendTelegram } = require('./services/telegram');

const app = express();
const PORT = process.env.PORT || 3001;

function monthsBetween(date1, date2) {
  const years = date2.getFullYear() - date1.getFullYear();
  const months = date2.getMonth() - date1.getMonth();
  return years * 12 + months;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', scanRoutes);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/rainfall', rainfallRoute);
app.use('/api/senwes-dashboard', senwesDashboardRoute);
app.use('/api/trokke-slips', trokkeSlipsRoute);

const { saveReen, saveKalfMerk, saveBeesMinus, removeBeesFromInventory, saveBeesPlus, saveTrokke, saveGif, saveAnder } = require('./services/sheets');







app.post('/api/ander', async (req, res) => {
  try {
    await saveAnder(req.body);

    await sendTelegram(
      `📝 Ander\nWat: ${req.body.wat}\nWaar: ${req.body.waar}\nHoe: ${req.body.hoe}\nWie: ${req.body.wie}\nAa: ${req.body.aa}\nAb: ${req.body.ab}\n${req.body.date}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save ander' });
  }
});

app.post('/api/gif', async (req, res) => {
  try {
    await saveGif(req.body);

    await sendTelegram(
      `🧪 Gif\n${req.body.wat}\n${req.body.date}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save gif' });
  }
});

app.post('/api/trokke', async (req, res) => {
  try {
    await saveTrokke(req.body);

    await sendTelegram(
      `🚚 Trokke\nPlaat: ${req.body.trokNrPlaat}\nGewig: ${req.body.gewig} kg\nDrywer: ${req.body.drywerId}\nWaar: ${req.body.waar}\n${req.body.date}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save trokke' });
  }
});

app.post('/api/bees-plus', async (req, res) => {
  try {
    await saveBeesPlus(req.body);

    await sendTelegram(
      `🐄 Bees plus\n${req.body.wat} - ${req.body.beesNr}\n${req.body.date}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save bees plus' });
  }
});

app.post('/api/bees-minus', async (req, res) => {
  try {
    await saveBeesMinus(req.body);

    let removedFromInventory = false;
    try {
      removedFromInventory = await removeBeesFromInventory(req.body.beesNr);
    } catch (removeErr) {
      console.error('Bees minus saved, but inventory removal failed:', removeErr);
    }

    await sendTelegram(
      `🐄 Bees minus\n${req.body.wat} - ${req.body.beesNr}\n${req.body.date}\nInventaris verwyder: ${removedFromInventory ? 'Ja' : 'Nee'}`
    );

    res.json({
      success: true,
      removedFromInventory,
      message: removedFromInventory
        ? 'Bees minus gestoor en bees uit inventaris verwyder.'
        : 'Bees minus gestoor, maar bees nr nie in inventaris gevind nie.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save bees minus' });
  }
});

app.post('/api/kalf-merk', async (req, res) => {
  try {
    await saveKalfMerk(req.body);

    await sendTelegram(
      `🐄 Kalf merk\nKoei: ${req.body.koeiNr}\nKalf: ${req.body.kalfNr}\nWaar: ${req.body.waar}\nNr: ${req.body.nr}\nSize: ${req.body.size}\nDate: ${req.body.date}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save kalf merk data' });
  }
});

app.post('/api/reen', async (req, res) => {
  try {
    await saveReen(req.body);

    await sendTelegram(
      `🌧️ Reën\n${req.body.waar} - ${req.body.hoeveel} mm\n${req.body.date}`
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save reen data' });
  }
});


app.get('/api/cow-productivity', async (req, res) => {
  try {
    const inventoryRows = await getSheetData('Bees Inventaris');
    const kalfRows = await getSheetData('Kalf merk');

    const inventory = inventoryRows.slice(1);
    const kalf = kalfRows.slice(1);

    const latestBirth = {};

    kalf.forEach(row => {
      if (!row[0] || !row[1]) return;

      const date = new Date(row[0]);
      if (isNaN(date)) return;

      const cow = String(row[1]).trim().padStart(3, '0');

      if (!latestBirth[cow] || date > latestBirth[cow]) {
        latestBirth[cow] = date;
      }
    });

    // REMOVE DUPLICATES
    const uniqueCows = [...new Set(inventory.map(r => String(r[0]).trim()))];

    let productive = 0;
    let moderate = 0;
    let unproductive = 0;
    const list = [];

    const today = new Date();

    uniqueCows.forEach(cowRaw => {
      if (!cowRaw) return;

      const cow = cowRaw.padStart(3, '0');
      const last = latestBirth[cow];

      if (!last) {
        unproductive++;
        list.push({
          cow,
          status: 'never',
          lastCalf: null,
          months: null
        });
        return;
      }

      const months = monthsBetween(last, today);

      if (months <= 14) {
        productive++;
      } else if (months <= 18) {
        moderate++;
      } else {
        unproductive++;
        list.push({
          cow,
          status: 'late',
          lastCalf: last.toISOString().split('T')[0],
          months
        });
      }
    });

    list.sort((a, b) => {
      if (!a.lastCalf) return -1;
      if (!b.lastCalf) return 1;
      return b.months - a.months;
    });

    res.json({
      productive,
      moderate,
      unproductive,
      list
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate productivity' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Farm OCR System listening at http://0.0.0.0:${PORT}`);
});
