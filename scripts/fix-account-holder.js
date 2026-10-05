const { Client } = require('pg');

async function fixAccountHolder() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();

  const holders = await client.query('SELECT * FROM account_holder');
  console.log('Account holders:', holders.rows);

  const custHolders = await client.query('SELECT * FROM customer_account_holder');
  console.log('Customer account holders:', custHolders.rows);

  // If duplicate or mismatched account holder exists, let's clean it up so Medusa can manage it cleanly
  await client.query("DELETE FROM customer_account_holder WHERE customer_id = 'cus_01M43FCG36QRBN16Z3K8MRCHP6'");
  await client.query("DELETE FROM account_holder WHERE external_id = 'cus_01M43FCG36QRBN16Z3K8MRCHP6'");
  console.log('Cleaned up existing account holders for cus_01M43FCG36QRBN16Z3K8MRCHP6');

  await client.end();
}

fixAccountHolder().catch(console.error);
