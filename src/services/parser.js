module.exports = function parseVragData(rawText) {

  const text = (rawText || '')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, '\n');

  function extract(patterns) {
    for (const p of patterns) {
      const m = text.match(p);
      if (m && m[1]) {
        return m[1].trim();
      }
    }
    return '';
  }

  function cleanMass(v) {
    if (!v) return '';

    const m = v.match(/\d{1,3}[.,]\d{3}|\d+[.,]\d+/);

    return m ? m[0].replace(',', '.') : '';
  }

  const datum = extract([
    /Datum[:\s]+(\d{4}\/\d{2}\/\d{2})/i,
    /Datum[:\s]+(\d{4}-\d{2}-\d{2})/i
  ]);

  const tyd = extract([
    /Inweeg tyd[:\s]+(\d{1,2}:\d{2})/i,
    /Uitweeg tyd[:\s]+(\d{1,2}:\d{2})/i
  ]);

  const produk = extract([
    /Materiaal[:\s]+([A-Z ]{3,})/i
  ]);

  const vragBriefNo = extract([
    /Aflewering No[:\s]+([A-Z0-9]+)/i
  ]);

  const vog = extract([
    /Vog[:\s]+(\d+[.,]\d+)/i
  ]);

  const graad = extract([
    /Finale Graad[:\s]+([A-Z0-9]+)/i
  ]);

  // VERY IMPORTANT:
  // Prioritize Netto massa ONLY
  let nettoGewig = cleanMass(extract([
    /Netto massa[:\s]+(\d+[.,]\d+)/i
  ]));

  // ONLY fallback if Netto missing
  if (!nettoGewig) {
    nettoGewig = cleanMass(extract([
      /Gelewer op Kontrak[:\s]+(\d+[.,]\d+)/i,
      /Uitweeg massa[:\s]+(\d+[.,]\d+)/i
    ]));
  }

  const nommerPlaat = extract([
    /V\/Reg No[:\s]+([A-Z0-9]+)/i
  ]);

  const land = extract([
    /Kommentaar[:\s]+([A-Z0-9 \-]+)/i
  ]);

  return {
    datum,
    tyd,
    produk,
    vragBriefNo,
    vog,
    graad,
    nettoGewig,
    nommerPlaat,
    land
  };
};
