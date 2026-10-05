const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();

  const missing = await client.query(
    `SELECT id, title, handle, thumbnail, description, subtitle 
     FROM product 
     WHERE thumbnail IS NULL OR thumbnail = '' OR thumbnail LIKE '%placeholder%'
     ORDER BY title ASC;`
  );

  console.log(`Missing products count: ${missing.rows.length}`);
  console.log(JSON.stringify(missing.rows, null, 2));

  // Check product image tables
  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%image%';`
  );
  console.log('Image related tables:', tables.rows.map(t => t.table_name));

  for (const t of tables.rows) {
    const cols = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t.table_name}';`
    );
    console.log(`Columns for ${t.table_name}:`, cols.rows.map(c => `${c.column_name} (${c.data_type})`));
  }

  await client.end();
}

main().catch(console.error);
