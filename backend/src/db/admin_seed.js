import bcrypt from 'bcryptjs';

/**
 * Ensure the ADMIN_EMAIL account exists and is an admin.
 * Idempotent upsert. No-op unless ADMIN_EMAIL + ADMIN_PASSWORD are set.
 * @param {import('pg').PoolClient|import('pg').Pool} client
 * @returns {Promise<boolean>} true if an admin was ensured
 */
export async function ensureAdmin(client) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;

  const hash = await bcrypt.hash(adminPassword, 12);
  await client.query(
    `INSERT INTO users(name, email, password_hash, is_admin)
     VALUES($1,$2,$3,TRUE)
     ON CONFLICT (email) DO UPDATE SET is_admin = TRUE`,
    ['Admin', adminEmail, hash]
  );
  console.log(`✅ Admin account ensured for ${adminEmail}`);
  return true;
}
