const fs = require('fs');
const path = require('path');
const https = require('https');
const { Client } = require('pg');

const targetDir = path.join(__dirname, '..', 'apps', 'storefront', 'public', 'images', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const brainDir = 'C:\\Users\\phane\\.gemini\\antigravity-ide\\brain\\1a556bb9-5ec6-4169-acf3-43376f456f99';

// Map of generated images to copy
const generatedCopies = [
  { src: 'sunfiber_powder_1791164580235.jpg', dest: 'sunfiber-powder.jpg' },
  { src: 'premitex_blend_1791164609395.jpg', dest: 'premitex-stabilizer.jpg' },
  { src: 'premitex_blend_1791164609395.jpg', dest: 'premigum-texturizer.jpg' },
  { src: 'premitex_blend_1791164609395.jpg', dest: 'premitex-blend.jpg' },
  { src: 'premitex_blend_1791164609395.jpg', dest: 'premitex-dairy.jpg' },
  { src: 'rosemary_extract_1791164630696.jpg', dest: 'rosemary-extract.jpg' },
  { src: 'fresh_cream_1791164655234.jpg', dest: 'fresh-cream.jpg' },
  { src: 'instant_coffee_1791164684588.jpg', dest: 'instant-coffee-powder.jpg' },
  { src: 'dark_chocolate_extract_1791164741615.jpg', dest: 'dark-chocolate-extract.jpg' },
  { src: 'dark_chocolate_extract_1791164741615.jpg', dest: 'chocolate-rods-flavour.jpg' },
  { src: 'dark_chocolate_extract_1791164741615.jpg', dest: 'cocoa-oleoresin.jpg' },
  { src: 'dark_chocolate_extract_1791164741615.jpg', dest: 'chocolate-supreme.jpg' },
  { src: 'cocoa_powder_1791164721107.jpg', dest: 'cocoa-powder-jindal.jpg' },
  { src: 'vanilla_extract_1791164765768.jpg', dest: 'vanilla-bean-extract.jpg' },
  { src: 'prebiotic_sweetener_1791164802191.jpg', dest: 'neo-sweet-powder.jpg' },
  { src: 'prebiotic_sweetener_1791164802191.jpg', dest: 'new-sweet-crystals.jpg' },
  { src: 'prebiotic_sweetener_1791164802191.jpg', dest: 'fos-foslife-l65.jpg' },
  { src: 'prebiotic_sweetener_1791164802191.jpg', dest: 'fos-foslife-l55.jpg' },
  { src: 'quinoa_grain_1791164885858.jpg', dest: 'quinoa-grain.jpg' },
  { src: 'indian_pulses_dal_1791164912147.jpg', dest: 'toor-dal.jpg' },
  { src: 'indian_pulses_dal_1791164912147.jpg', dest: 'urad-dal.jpg' },
  { src: 'mango_powder_1791164832930.jpg', dest: 'alphonso-mango-powder.jpg' },
  { src: 'banana_powder_1791164857292.jpg', dest: 'banana-fruit-powder.jpg' },
];

for (const copy of generatedCopies) {
  const srcPath = path.join(brainDir, copy.src);
  const destPath = path.join(targetDir, copy.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${copy.src} -> ${copy.dest}`);
  } else {
    console.warn(`File not found: ${srcPath}`);
  }
}

// Download list for remaining products
const downloads = [
  // Millets
  {
    dest: 'pearl-millet-bajra.jpg',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80' // whole grains
  },
  {
    dest: 'finger-millet-ragi.jpg',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' // red grain/seeds
  },
  {
    dest: 'foxtail-millet.jpg',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80' // golden grain
  },
  {
    dest: 'foxtail-millet-seeds.jpg',
    url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: 'proso-millet.jpg',
    url: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: 'barnyard-millet.jpg',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: 'browntop-millet.jpg',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: 'kodo-millet.jpg',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: 'little-millet.jpg',
    url: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80'
  },
  // Ginger powder
  {
    dest: 'organic-ginger-powder.jpg',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'
  },
  // Cardamom
  {
    dest: 'cardamom-flavour-extract.jpg',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
  },
  // Clove oil
  {
    dest: 'clove-essential-oil.jpg',
    url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'
  },
  // Green chilli
  {
    dest: 'green-chilli-extract.jpg',
    url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80'
  },
  // Savory / Yeast / HVP / Enzymes
  {
    dest: 'yeast-extract-powder.jpg',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: 'soya-sauce-powder.jpg',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: 'hydrolysed-vegetable-protein.jpg',
    url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: 'digeaidzyme-enzyme.jpg',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Product ID to image file mapping
const productToImage = {
  'prod_01M36KGFKA75X46JN83DBN360F': '/images/products/sunfiber-powder.jpg', // Sunfiber AGI Taiyo
  'prod_01M36KGFKAGXFHHZTRVVDH2XPE': '/images/products/premitex-stabilizer.jpg', // Premitex XLH18045
  'prod_01M36KGFKBP2NE71T85AAD62KH': '/images/products/premigum-texturizer.jpg', // Premigum XLH21015M
  'prod_01M36KGFKBW2YT74M8WZZQ2381': '/images/products/premitex-blend.jpg', // Premitex XLH21024M
  'prod_01M36KGFKBVG085BMVR5VFECQ5': '/images/products/premitex-dairy.jpg', // Premitex XLH19036
  'prod_01M36KGFKB58W0AYHQHR2B6FN7': '/images/products/rosemary-extract.jpg', // Rosemary 5% CA Akay
  'prod_01M36KGFKBTHXWK9YM348B16R5': '/images/products/fresh-cream.jpg', // Fresh Cream Amul
  'prod_01M36KGFKB1QNAGFM951HBWQFW': '/images/products/instant-coffee-powder.jpg', // Instant Coffee powder
  'prod_01M36KGFKBN51QZPZ36V76E7C0': '/images/products/dark-chocolate-extract.jpg', // Dark chocolate flavour
  'prod_01M36KGFKB5HYD0WR7BFF4VVM2': '/images/products/neo-sweet-powder.jpg', // Neo Sweet IB
  'prod_01M36KGFKBVJAR91Z354HXZZSX': '/images/products/vanilla-bean-extract.jpg', // Vanilla flavour
  'prod_01M36KGFKB8BCXKA33FH1GA3KZ': '/images/products/new-sweet-crystals.jpg', // New- Sweet IB
  'prod_01M36KGFKBVQ0HPZE8YM4MJRQZ': '/images/products/quinoa-grain.jpg', // QCMP Quinoa
  'prod_01M36KGFKCZVERNKCX4XAGD61Z': '/images/products/toor-dal.jpg', // QCMP Toor dal
  'prod_01M36KGFKC0JD6Z38MV9HTGJAG': '/images/products/urad-dal.jpg', // QCMP Urad dal
  'prod_01M36KGFKC9B1YAHE51SNR9653': '/images/products/alphonso-mango-powder.jpg', // SD Alphenso Mango powder
  'prod_01M36KGFKCMPP7NG3B6BWV829C': '/images/products/banana-fruit-powder.jpg', // SD Banana powder
  'prod_01M36KGFKCWD6RF7QBAHW223EY': '/images/products/pearl-millet-bajra.jpg', // QCMP Pearl millet
  'prod_01M36KGFKCD74DNFJXCF00Z1F4': '/images/products/finger-millet-ragi.jpg', // QCMP Finger millet
  'prod_01M36KGFKCXSP2EFPNY3B8DBPK': '/images/products/proso-millet.jpg', // QCMP Proso millet
  'prod_01M36KGFKC1TPYPWA0G976KVK1': '/images/products/barnyard-millet.jpg', // QCMP Barnyard millet
  'prod_01M36KGFKCQV9R7T3RNYBN0TDC': '/images/products/browntop-millet.jpg', // QCMP Brown top millet
  'prod_01M36KGFKC9FBWJYMBV2HHN3HA': '/images/products/kodo-millet.jpg', // QCMP Kodo millet
  'prod_01M36KGFKCDRES13S00KBN85QX': '/images/products/foxtail-millet.jpg', // QCMP Foxtail millet
  'prod_01M36KGFKC1TGS9KF2P4GVEV42': '/images/products/little-millet.jpg', // QCMP Little millet
  'prod_01M36KGFKDW0BJCAWSGN0C7S96': '/images/products/organic-ginger-powder.jpg', // Ginger powder
  'prod_01M36KGFKD7NTSRDBWF7BPQDDY': '/images/products/cardamom-flavour-extract.jpg', // Natural Cardamom flavour
  'prod_01M36KGFKD4CZCYX1K8G60HGJG': '/images/products/foxtail-millet-seeds.jpg', // QCMP Foxtail millet Acronym
  'prod_01M36KGFKDZT0N5TKEKXG4QEB1': '/images/products/chocolate-rods-flavour.jpg', // Chocolate rods flavour
  'prod_01M36KGFKDW9RM6D03VDME0MR0': '/images/products/cocoa-powder-jindal.jpg', // Cocoa powder 707 Jindal
  'prod_01M36KGFKD7SVZ10PY0P2NBM4M': '/images/products/clove-essential-oil.jpg', // Clove oil
  'prod_01M36KGFKDKFY4Y3D068FTK1XN': '/images/products/digeaidzyme-enzyme.jpg', // Digeaidzyme Biovedic
  'prod_01M36KGFKD5D75T67CQ8FX078R': '/images/products/yeast-extract-powder.jpg', // Yeast extract powder
  'prod_01M36KGFKDP09MP7RARYFRC8B1': '/images/products/soya-sauce-powder.jpg', // Soya Sauce Powder
  'prod_01M36KGFKDBJ9Q56JG94MXSPXK': '/images/products/hydrolysed-vegetable-protein.jpg', // Hydrolysed Vegetable Protein
  'prod_01M36KGFKDVA041HFXHBNRDHK4': '/images/products/cocoa-oleoresin.jpg', // Cocoa oleoresin
  'prod_01M36KGFKD65QA07PVGH25AW0R': '/images/products/green-chilli-extract.jpg', // Green chilli
  'prod_01M36KGFKDCPK24B6A6PHPHX2Y': '/images/products/chocolate-supreme.jpg', // Chocolate supreme
  'prod_01M36KGFKE65DGWGT2ZTDK0X23': '/images/products/fos-foslife-l65.jpg', // FOS Foslife L65
  'prod_01M36KGFKEM0YWW3CJC3C766K8': '/images/products/fos-foslife-l55.jpg', // FOS Foslife L55
};

async function main() {
  console.log('Downloading additional ingredient images...');
  for (const item of downloads) {
    const dest = path.join(targetDir, item.dest);
    if (!fs.existsSync(dest)) {
      try {
        await downloadFile(item.url, dest);
        console.log(`Downloaded ${item.dest}`);
      } catch (err) {
        console.error(`Failed to download ${item.dest}:`, err.message);
      }
    } else {
      console.log(`Already exists: ${item.dest}`);
    }
  }

  console.log('Connecting to PostgreSQL database to update product images...');
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();

  let updatedCount = 0;
  for (const [productId, imagePath] of Object.entries(productToImage)) {
    // 1. Update product.thumbnail
    const updateRes = await client.query(
      `UPDATE product SET thumbnail = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title;`,
      [imagePath, productId]
    );

    if (updateRes.rows.length > 0) {
      // 2. Insert into image table if not present
      const imgId = `img_${productId.replace('prod_', '')}`;
      await client.query(
        `INSERT INTO image (id, url, product_id, rank, created_at, updated_at) 
         VALUES ($1, $2, $3, 0, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET url = $2, updated_at = NOW();`,
        [imgId, imagePath, productId]
      );

      console.log(`[UPDATED] ${updateRes.rows[0].title} -> ${imagePath}`);
      updatedCount++;
    } else {
      console.warn(`[NOT FOUND] Product ${productId}`);
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} / ${Object.keys(productToImage).length} products.`);

  // Verify missing count
  const remaining = await client.query(
    `SELECT count(*) FROM product WHERE thumbnail IS NULL OR thumbnail = '' OR thumbnail LIKE '%placeholder%';`
  );
  console.log(`Remaining products without thumbnail in DB: ${remaining.rows[0].count}`);

  await client.end();
}

main().catch(console.error);
