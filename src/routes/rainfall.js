const express = require('express');
const router = express.Router();
const { getSheetData } = require('../services/sheets');

router.get('/', async (req, res) => {
  try {
    const rows = await getSheetData('Reën');
    const data = rows.slice(1);

    const monthly = {};
    const farms = {};

    data.forEach(row => {
      if (!row[0] || !row[1] || !row[2]) return;

      const date = new Date(row[0]);
      if (isNaN(date)) return;

      const mm = Number(String(row[1]).replace(',', '.'));
      if (isNaN(mm)) return;

      const waar = String(row[2]).trim();

      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;

      // farming season: Sep -> Aug
      const seasonYear = monthNum >= 9 ? year : year - 1;

      const month = seasonYear + '-' + String(monthNum).padStart(2,'0');


      if (waar === 'Boomplaas') {
        monthly[month] = (monthly[month] || 0) + mm;
      }

      farms[waar] = (farms[waar] || 0) + mm;
    });

    res.json({
      monthly: Object.entries(monthly).map(([month,total]) => ({ month, total })),
      farms: Object.entries(farms).map(([farm,total]) => ({ farm, total }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load rainfall data' });
  }
});

module.exports = router;
