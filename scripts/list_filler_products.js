const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();

  const filler = await client.query("SELECT id, handle, title, thumbnail FROM product WHERE thumbnail LIKE '%ingredients-bazar.jpg%' ORDER BY title;");
  console.log('Count:', filler.rows.length);
  console.log(JSON.stringify(filler.rows, null, 2));

  await client.end();
}

main().catch(console.error);
