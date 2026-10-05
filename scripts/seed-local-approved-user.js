const { Client } = require('pg');
const scrypt = require('scrypt-kdf');

async function seedUser() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medusa' });
  await client.connect();

  console.log('Connected to local DB.');

  // 1. Check if Approved group exists
  const groupRes = await client.query("SELECT id, name FROM customer_group WHERE name = 'Approved'");
  let groupId;
  if (groupRes.rows.length === 0) {
    groupId = 'cusgroup_01M35GWFZMQ49J1N865YY1EGYT';
    await client.query("INSERT INTO customer_group (id, name, created_at, updated_at) VALUES ($1, 'Approved', NOW(), NOW())", [groupId]);
    console.log('Created Approved customer group:', groupId);
  } else {
    groupId = groupRes.rows[0].id;
    console.log('Found Approved customer group:', groupId);
  }

  // 2. Check if customer exists
  const email = 'manoj.orders@ingredientsbazar.com';
  const custRes = await client.query("SELECT id, email FROM customer WHERE email = $1", [email]);
  let customerId;

  if (custRes.rows.length === 0) {
    customerId = 'cus_01M43FCG36QRBN16Z3K8MRCHP6';
    await client.query(`
      INSERT INTO customer (id, email, first_name, last_name, phone, has_account, created_at, updated_at)
      VALUES ($1, $2, 'Manoj', 'R', '917619114115', true, NOW(), NOW())
    `, [customerId, email]);
    console.log('Created customer in local DB:', customerId);
  } else {
    customerId = custRes.rows[0].id;
    console.log('Found existing customer in local DB:', customerId);
  }

  // 3. Associate customer with Approved group
  const linkRes = await client.query("SELECT * FROM customer_group_customer WHERE customer_id = $1 AND customer_group_id = $2", [customerId, groupId]);
  if (linkRes.rows.length === 0) {
    await client.query(`
      INSERT INTO customer_group_customer (id, customer_id, customer_group_id, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
    `, ['cgc_01M43APPROVEDLINK000000000', customerId, groupId]);
    console.log('Linked customer to Approved group');
  } else {
    console.log('Customer already in Approved group');
  }

  // 4. Check auth_identity in auth module
  const authIdentRes = await client.query("SELECT id, provider_metadata FROM auth_identity WHERE entity_id = $1", [email]);
  console.log('Auth identity found:', authIdentRes.rows.length);

  await client.end();
  console.log('Local DB user seeding complete.');
}

seedUser().catch(console.error);
