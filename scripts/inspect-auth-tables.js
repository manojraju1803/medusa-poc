const { Client } = require('pg');

async function inspectAuth() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();

  const authTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%auth%'");
  console.log('Auth tables:', authTables.rows.map(r => r.table_name));

  for (const t of authTables.rows) {
    const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t.table_name}'`);
    console.log(`Columns for ${t.table_name}:`, cols.rows.map(r => r.column_name));
    const sample = await client.query(`SELECT * FROM ${t.table_name} LIMIT 2`);
    console.log(`Sample from ${t.table_name}:`, sample.rows);
  }

  await client.end();
}

inspectAuth().catch(console.error);
