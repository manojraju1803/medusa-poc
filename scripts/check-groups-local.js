const { Client } = require('pg');

async function checkGroups() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();

  const groups = await client.query('SELECT id, name FROM customer_group');
  console.log('Customer groups in local DB:', groups.rows);

  await client.end();
}

checkGroups().catch(console.error);
