const express = require('express');
const router = express.Router();
const { getSheetData, updateTrokkeSlip } = require('../services/sheets');

function num(v){
  return Number(String(v || '').replace(',', '.')) || 0;
}

function weekKey(date){
  const d = new Date(date);
  if (isNaN(d)) return 'Unknown';
  const onejan = new Date(d.getFullYear(),0,1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
  return `${d.getFullYear()} Week ${week}`;
}

router.get('/', async (req,res)=>{
  try{
    const rows = await getSheetData('Trokke');
    const data = rows.slice(1);

    const slips = data.map((r,i)=>({
      rowNumber: i + 2,
      date: r[0] || '',
      plate: r[1] || '',
      originalWeight: num(r[2]),
      driver: r[3] || '',
      field: r[4] || '',
      delivered: String(r[5] || '').toUpperCase() === 'YES',
      buyerWeight: num(r[6])
    })).filter(x => x.date || x.plate || x.originalWeight);

    const byField = {};
    const byWeek = {};

    slips.filter(x=>x.delivered && x.buyerWeight > 0).forEach(x=>{
      byField[x.field] = (byField[x.field] || 0) + x.buyerWeight;
      byWeek[weekKey(x.date)] = (byWeek[weekKey(x.date)] || 0) + x.buyerWeight;
    });

    res.json({
      slips,
      byField: Object.entries(byField).map(([name,total])=>({name,total})),
      byWeek: Object.entries(byWeek).map(([name,total])=>({name,total}))
    });
  }catch(err){
    console.error(err);
    res.status(500).json({error:'Failed to load trokke slips'});
  }
});

router.post('/update', async (req,res)=>{
  try{
    await updateTrokkeSlip(req.body.rowNumber, req.body.delivered, req.body.buyerWeight);
    res.json({success:true});
  }catch(err){
    console.error(err);
    res.status(500).json({error:'Failed to update slip'});
  }
});

module.exports = router;
