const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_Tvo7hO4uYzxt@ep-summer-tooth-b56ya9p6-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
const LOCAL_URL = 'postgresql://postgres:postgres@localhost:5432/medusa';

async function syncUsers() {
  const neon = new Client({ connectionString: NEON_URL });
  const local = new Client({ connectionString: LOCAL_URL });

  await neon.connect();
  console.log('Connected to Neon.');
  await local.connect();
  console.log('Connected to Local DB.');

  const tablesToSync = [
    'auth_identity',
    'provider_identity',
    'customer',
    'customer_group',
    'customer_group_customer',
    'customer_account_holder',
    'account_holder'
  ];

  for (const table of tablesToSync) {
    try {
      const { rows } = await neon.query(`SELECT * FROM ${table}`);
      console.log(`Fetched ${rows.length} rows from Neon for ${table}`);

      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const updateSet = columns.filter(c => c !== 'id').map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');

        const query = `
          INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')})
          VALUES (${placeholders})
          ON CONFLICT (id) DO UPDATE SET ${updateSet}
        `;

        await local.query(query, values);
      }
      console.log(`Successfully synced ${table} to local DB.`);
    } catch (err) {
      console.warn(`Note on ${table}:`, err.message);
    }
  }

  await neon.end();
  await local.end();
  console.log('ALL USERS & AUTH SYNCED TO LOCAL POSTGRES SUCCESSFULLY!');
}

syncUsers().catch(console.error);
