const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();

  const fillerImgs = await client.query("SELECT count(*) FROM image WHERE url LIKE '%ingredients-bazar.jpg%';");
  console.log('Images with ingredients-bazar.jpg in image table:', fillerImgs.rows[0].count);

  const fillerThumb = await client.query("SELECT count(*) FROM product WHERE thumbnail LIKE '%ingredients-bazar.jpg%';");
  console.log('Products with ingredients-bazar.jpg thumbnail:', fillerThumb.rows[0].count);

  const sampleFiller = await client.query("SELECT id, handle, title, thumbnail FROM product WHERE thumbnail LIKE '%ingredients-bazar.jpg%' LIMIT 10;");
  console.log('Sample filler products:', sampleFiller.rows);

  const sampleAny = await client.query("SELECT p.id, p.handle, p.title, p.thumbnail, (SELECT count(*) FROM image i WHERE i.product_id = p.id) as img_count FROM product p LIMIT 20;");
  console.log('Sample any products:', sampleAny.rows);

  await client.end();
}

main().catch(console.error);
