const { Client } = require('pg');

async function check() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables in local medusa db:', res.rows.length);
  if (res.rows.length > 0) {
    console.log('Sample tables:', res.rows.slice(0, 10).map(r => r.table_name));
  }
  await client.end();
}

check().catch(console.error);
