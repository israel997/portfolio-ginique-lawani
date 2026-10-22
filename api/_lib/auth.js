import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { sql } from './db.js';
import { ensureSchema } from './migrations.js';
import { sendJson } from './http.js';

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours

// Single admin account. The password hash set from the back-office
// (admin_auth table) wins; until one is set, this bcrypt hash (cost 12)
// is used. Only hashes are stored, never the password itself.
const ADMIN_EMAIL = 'israellawani.pro@gmail.com';
const DEFAULT_PASSWORD_HASH = '$2a$12$/dUJo8t/EzfPRv33hqeVLO0tcItY6qidCi5xT/r9odfacxai4N7Ry';

export const MIN_PASSWORD_LENGTH = 12;

// Brute-force lockout: this many failed logins from one IP within the
// window blocks further attempts from that IP until the window passes.
const MAX_FAILURES = 5;
const LOCK_WINDOW_MINUTES = 15;

// HMAC base key. SESSION_SECRET wins if set; otherwise it's derived from
// POSTGRES_URL, a secret Vercel already injects through the Postgres
// integration, so nothing extra has to be configured.
function baseSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const dbUrl = process.env.POSTGRES_URL;
  if (!dbUrl) throw new Error('Neither SESSION_SECRET nor POSTGRES_URL is set');
  return crypto.createHash('sha256').update(`admin-session:${dbUrl}`).digest('hex');
}

async function currentPasswordHash() {
  await ensureSchema();
  const { rows } = await sql`SELECT password_hash FROM admin_auth WHERE id = 1`;
  return rows[0]?.password_hash || DEFAULT_PASSWORD_HASH;
}

// Sessions are signed with a key derived from the current password hash, so
// changing the password invalidates every session issued before.
async function signer() {
  const key = crypto.createHmac('sha256', baseSecret()).update(await currentPasswordHash()).digest();
  return (value) => crypto.createHmac('sha256', key).update(value).digest('base64url');
}

export async function createSessionToken() {
  const sign = await signer();
  const payload = { iat: Date.now(), exp: Date.now() + SESSION_TTL_SECONDS * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;
  const sign = await signer();
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(sign(encoded));
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((part) => {
      const idx = part.indexOf('=');
      if (idx === -1) return [part.trim(), ''];
      return [part.slice(0, idx).trim(), decodeURIComponent(part.slice(idx + 1).trim())];
    })
  );
}

export function setSessionCookie(res, token) {
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${SESSION_TTL_SECONDS}`
  ];
  if (process.env.NODE_ENV !== 'development') attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );
}

export async function isAuthenticated(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return false;
  return verifySessionToken(token);
}

export async function requireAuth(req, res) {
  if (!(await isAuthenticated(req))) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return false;
  }
  return true;
}

export async function verifyCredentials(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string' || !password) return false;
  const emailMatches = email.trim().toLowerCase() === ADMIN_EMAIL;
  // Always run bcrypt, even for a wrong email, so response time doesn't
  // reveal whether the email was right.
  const passwordMatches = await bcrypt.compare(password, await currentPasswordHash());
  return emailMatches && passwordMatches;
}

export async function verifyPassword(password) {
  if (typeof password !== 'string' || !password) return false;
  return bcrypt.compare(password, await currentPasswordHash());
}

export async function setPassword(password) {
  const hash = await bcrypt.hash(password, 12);
  await sql`
    INSERT INTO admin_auth (id, password_hash, updated_at) VALUES (1, ${hash}, now())
    ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = now()
  `;
}

// --- Brute-force lockout -----------------------------------------------------

// Vercel sets x-real-ip / x-forwarded-for from the actual connection
export function clientIp(req) {
  const real = req.headers?.['x-real-ip'];
  if (real) return String(real);
  const forwarded = req.headers?.['x-forwarded-for'];
  return forwarded ? String(forwarded).split(',')[0].trim() : 'unknown';
}

// Minutes left before this IP may try again (0 = not locked)
export async function lockedMinutes(ip) {
  await ensureSchema();
  const { rows } = await sql`
    SELECT attempted_at FROM login_attempts
    WHERE ip = ${ip} AND attempted_at > now() - make_interval(mins => ${LOCK_WINDOW_MINUTES})
    ORDER BY attempted_at DESC
    LIMIT ${MAX_FAILURES}
  `;
  if (rows.length < MAX_FAILURES) return 0;
  const oldest = new Date(rows[rows.length - 1].attempted_at).getTime();
  const unlockAt = oldest + LOCK_WINDOW_MINUTES * 60 * 1000;
  return Math.max(1, Math.ceil((unlockAt - Date.now()) / 60000));
}

export async function recordFailedLogin(ip) {
  await sql`INSERT INTO login_attempts (ip) VALUES (${ip})`;
  await sql`DELETE FROM login_attempts WHERE attempted_at < now() - interval '1 day'`;
}

export async function clearFailedLogins(ip) {
  await sql`DELETE FROM login_attempts WHERE ip = ${ip}`;
}
