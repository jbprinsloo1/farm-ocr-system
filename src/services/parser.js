module.exports = function parseVragData(rawText) {
  const original = rawText || '';

  const text = original
    .replace(/\r/g, '\n')
    .replace(/[|]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();

  const lines = text
    .split(/\n/)
    .map(l => l.trim())
    .filter(Boolean);

  function norm(s) {
    return (s || '')
      .toLowerCase()
      .replace(/[^\w\s\/.%:-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function clean(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  function numberFrom(s) {
    const m = (s || '').match(/\d{1,4}[.,]\d{1,4}|\d+/);
    return m ? m[0].replace(',', '.') : '';
  }

  function valueNear(labelWords, opts = {}) {
    const maxAhead = opts.maxAhead || 4;
    const valuePattern = opts.valuePattern || /.+/;
    const skipLabels = opts.skipLabels || [];

    for (let i = 0; i < lines.length; i++) {
      const n = norm(lines[i]);

      const hasLabel = labelWords.every(w => n.includes(norm(w)));
      if (!hasLabel) continue;

      // value on same line after :
      const afterColon = lines[i].split(':').slice(1).join(':').trim();
      if (afterColon && valuePattern.test(afterColon)) return clean(afterColon);

      // value on next few lines
      for (let j = i + 1; j < lines.length && j <= i + maxAhead; j++) {
        const candidate = clean(lines[j]);
        const cn = norm(candidate);

        if (skipLabels.some(lbl => cn.includes(norm(lbl)))) continue;
        if (valuePattern.test(candidate)) return candidate;
      }
    }

    return '';
  }

  function regexFirst(patterns) {
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return clean(m[1] || m[0]);
    }
    return '';
  }

  function findNettoMassa() {
    // 1. Best case: same line
    let m = text.match(/netto\s*massa\s*:?\s*(\d{1,4}[.,]\d{1,4})/i);
    if (m) return m[1].replace(',', '.');

    // 2. Look within 6 lines after Netto massa, but ignore Uitweeg/Inweeg labels
    for (let i = 0; i < lines.length; i++) {
      const n = norm(lines[i]);

      if (n.includes('netto') && n.includes('massa')) {
        for (let j = i; j < lines.length && j <= i + 6; j++) {
          const ln = norm(lines[j]);

          if (ln.includes('uitweeg massa') || ln.includes('inweeg massa')) continue;

          const val = numberFrom(lines[j]);
          if (val) return val;
        }
      }
    }

    // 3. Last resort only
    m = text.match(/gelewer\s*op\s*kontrak\s*:?\s*(\d{1,4}[.,]\d{1,4})/i);
    if (m) return m[1].replace(',', '.');

    return '';
  }

  const datum = regexFirst([
    /\b(\d{4}[\/-]\d{2}[\/-]\d{2})\b/,
    /\b(\d{2}[\/-]\d{2}[\/-]\d{4})\b/
  ]);

  const tyd = regexFirst([
    /uitweeg\s*tyd\s*:?\s*(\d{1,2}:\d{2})/i,
    /inweeg\s*tyd\s*:?\s*(\d{1,2}:\d{2})/i,
    /\b(\d{1,2}:\d{2})\b/
  ]);

  const produk =
    valueNear(['materiaal'], { maxAhead: 3, valuePattern: /[a-zA-Z]{3,}/ }) ||
    regexFirst([/materiaal\s*:?\s*([A-Z][A-Z ]{2,})/i]);

  const vragBriefNo = regexFirst([
    /aflewering\s*no\.?\s*:?\s*([A-Z0-9]+)/i,
    /\b(A\d{6,})\b/i
  ]);

  const vog = numberFrom(
    valueNear(['vog'], { maxAhead: 3, valuePattern: /\d+[.,]\d+/ })
  );

  const graad =
    valueNear(['finale', 'graad'], { maxAhead: 3, valuePattern: /^[A-Z0-9]{1,5}$/i }) ||
    valueNear(['graad'], { maxAhead: 3, valuePattern: /^[A-Z0-9]{1,5}$/i });

  const nettoGewig = findNettoMassa();

  const nommerPlaat = regexFirst([
    /v\/reg\s*no\.?\s*:?\s*([A-Z0-9 ]{5,12})/i,
    /\b([A-Z]{2,3}\s?\d{3,4}\s?[A-Z]{1,3})\b/i
  ]).replace(/\s+/g, '');

  const land =
    valueNear(['kommentaar'], { maxAhead: 4 }) ||
    valueNear(['land'], { maxAhead: 4 });

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
