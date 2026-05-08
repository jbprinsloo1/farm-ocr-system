cat > ~/farm-ocr-system/src/services/parser.js <<'EOF'
module.exports = function parseVragData(rawText) {
  const text = rawText || '';
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  function clean(v) {
    return (v || '').replace(/\s+/g, ' ').trim();
  }

  function findValueAfter(labels, maxLookAhead = 5) {
    if (!Array.isArray(labels)) labels = [labels];

    for (const label of labels) {
      const labelClean = label.toLowerCase().replace(':', '').trim();

      for (let i = 0; i < lines.length; i++) {
        const lineClean = lines[i].toLowerCase().replace(':', '').trim();

        // Value on same line: "Netto massa: 15.234"
        if (lineClean.includes(labelClean)) {
          const sameLine = lines[i].replace(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '').replace(':', '').trim();
          if (sameLine) return clean(sameLine);

          // Value on following lines
          for (let j = i + 1; j < lines.length && j <= i + maxLookAhead; j++) {
            if (lines[j]) return clean(lines[j]);
          }
        }
      }
    }

    return '';
  }

  function findMass() {
    // IMPORTANT: Netto massa must win before Uitweeg massa
    const netto =
      findValueAfter(['Netto massa', 'Netto massa:', 'Netto gewig', 'Netto gewig:'], 6);

    if (netto) return netto.match(/\d+[.,]\d+|\d+/)?.[0] || netto;

    // Only fallback if netto is not found
    const uitweeg =
      findValueAfter(['Uitweeg massa', 'Uitweeg massa:'], 6);

    return uitweeg.match(/\d+[.,]\d+|\d+/)?.[0] || uitweeg || '';
  }

  function findFirst(patterns) {
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return clean(m[1] || m[0]);
    }
    return '';
  }

  const datum = findFirst([
    /\b(\d{4}[-/]\d{2}[-/]\d{2})\b/,
    /\b(\d{2}[-/]\d{2}[-/]\d{4})\b/
  ]);

  const tyd = findFirst([
    /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/
  ]);

  const produk =
    findValueAfter(['Produk', 'Produk:', 'Materiaal', 'Materiaal:'], 6);

  const vragBriefNo = findFirst([
    /\b(A\d{5,})\b/i,
    /\b(Vrag\s*brief\s*no\.?\s*[:\-]?\s*([A-Z0-9-]+))/i
  ]).replace(/^Vrag\s*brief\s*no\.?\s*[:\-]?\s*/i, '');

  const vog = findValueAfter(['Vog', 'Vog:', 'Vog %', 'Vog %:'], 4);

  const graad = findValueAfter(['Graad', 'Graad:', 'Grade', 'Grade:'], 4);

  const nettoGewig = findMass();

  const nommerPlaat = findFirst([
    /\b([A-Z]{2,3}\s?\d{3,4}\s?[A-Z]{0,3})\b/,
    /\b([A-Z]{1,3}\d{3,4}[A-Z]{1,3})\b/
  ]);

  const land = findValueAfter(['Land', 'Land:', 'Plaas', 'Plaas:', 'Field', 'Field:'], 5);

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
EOF
