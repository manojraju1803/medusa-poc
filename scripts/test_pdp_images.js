const http = require('http');

const handles = [
  'sunfiber-fgi-taiyo-13023239',
  'rosehip-extract-13021919',
  'premitex-xlh18045-blendhub-21069050',
  'fresh-cream-amul-040150',
  'qcmp-toor-dal-acronym'
];

async function check() {
  for (const h of handles) {
    await new Promise((res) => {
      http.get('http://localhost:8000/in/products/' + h, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => {
          const match = data.match(/src="([^"]+)"[^>]*alt="Product visual"/i) || data.match(/alt="Product visual"[^>]*src="([^"]+)"/i);
          console.log(h, '-> Product visual image:', match ? match[1] : 'NONE');
          res();
        });
      }).on('error', (e) => {
        console.error(h, '-> ERROR', e.message);
        res();
      });
    });
  }
}
check();
