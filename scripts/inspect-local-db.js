const { Client } = require('pg');

async function inspect() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();

  const products = await client.query('SELECT count(*) FROM product');
  console.log('Products count:', products.rows[0].count);

  const customers = await client.query('SELECT id, email, first_name FROM customer');
  console.log('Customers in local DB:', customers.rows);

  const apiKeys = await client.query('SELECT id, token, title, type FROM api_key');
  console.log('API keys in local DB:', apiKeys.rows);

  const regions = await client.query('SELECT id, name, currency_code FROM region');
  console.log('Regions in local DB:', regions.rows);

  await client.end();
}

inspect().catch(console.error);
