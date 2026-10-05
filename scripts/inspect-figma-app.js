const fs = require('fs');

async function inspectFigma() {
  const res = await fetch('https://sky-cape-80694006.figma.site/assets/index-Bh_Lam-T.js');
  const code = await res.text();
  console.log('JS Code length:', code.length);

  // Search for navigation items, titles, categories, suppliers, UI components
  const keywords = ['Ingredients', 'Supplier', 'Category', 'Cart', 'Order', 'Catalog', 'Approved', 'MOQ', 'B2B', 'Taiyo', 'Sunfiber'];
  for (const kw of keywords) {
    let index = 0;
    let occurrences = 0;
    while ((index = code.indexOf(kw, index + 1)) !== -1 && occurrences < 3) {
      occurrences++;
      const snippet = code.substring(Math.max(0, index - 80), Math.min(code.length, index + 150));
      console.log(`[Keyword: ${kw}] ... ${snippet.replace(/\n/g, ' ')} ...\n`);
    }
  }
}

inspectFigma().catch(console.error);
