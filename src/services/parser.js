module.exports = function parseVragData(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim());

  function valueAfter(label) {
    const i = lines.findIndex(l => l.toLowerCase() === label.toLowerCase());
    if (i === -1) return '';
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j]) return lines[j];
    }
    return '';
  }

  function valuesAfter(label, count = 5) {
    const i = lines.findIndex(l => l.toLowerCase() === label.toLowerCase());
    if (i === -1) return [];
    const out = [];
    for (let j = i + 1; j < lines.length && out.length < count; j++) {
      if (lines[j]) out.push(lines[j]);
    }
    return out;
  }

  const materiaalVals = valuesAfter('Materiaal:', 4);
  const afleweringVals = valuesAfter('Aflewering No:', 5);
  const nettoVals = valuesAfter('Netto massa:', 5);

  const materiaal =
    materiaalVals.find(v => /[A-Za-z]/.test(v) && !/^(Datum:|Inweeg massa:|Bruto massa:)/i.test(v)) ||
    '';

  const afleweringNo =
    afleweringVals.find(v => /^[A-Z]\d{6,}$/i.test(v)) ||
    afleweringVals.find(v => /^[A-Z0-9]+$/i.test(v) && !/massa/i.test(v)) ||
    '';

  const nettoNumbers = nettoVals.filter(v => /^\d+\.\d+$/.test(v));
  const nettoMassa =
    nettoNumbers.length >= 2 ? nettoNumbers[1] :
    nettoNumbers.length === 1 ? nettoNumbers[0] : '';

  const voertuigRegs = lines.filter(l => /^[A-Z]{3}\d{3}[A-Z]{2}$/i.test(l));
  const voertuigReg = voertuigRegs[0] || '';

  const klantNo = valueAfter('Klant No:');
  const kommentaar = valueAfter('Kommentaar:');
  const datum = valueAfter('Datum:');
  const finaleGraad = valueAfter('Finale Graad:');
  const tyd = valueAfter('Inweeg tyd:');

  let vog = '';
  const vogIndex = lines.findIndex(l => l.toLowerCase() === 'vog');
  if (vogIndex !== -1) {
    for (let j = vogIndex + 1; j < lines.length; j++) {
      if (/^\d+\.\d+$/.test(lines[j])) {
        vog = lines[j];
        break;
      }
    }
  }

  return {
    klantNo,
    silo: kommentaar,
    materiaal,
    datum,
    tyd,
    afleweringNo,
    nettoMassa,
    vog,
    finaleGraad,
    voertuigReg,
    rawText
  };
};
