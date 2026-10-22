import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { sendJson } from './http.js';

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Single admin account, kept in code so the back-office works with zero
// dashboard setup. Only the bcrypt hash (cost 12) is stored, never the
// password itself. To change the password, regenerate the hash with:
//   node -e "console.log(require('bcryptjs').hashSync('new-password', 12))"
const ADMIN_EMAIL = 'israellawani.pro@gmail.com';
const ADMIN_PASSWORD_HASH = '$2a$12$/dUJo8t/EzfPRv33hqeVLO0tcItY6qidCi5xT/r9odfacxai4N7Ry';

// Session cookies are HMAC-signed. SESSION_SECRET wins if set; otherwise the
// key is derived from POSTGRES_URL, a secret Vercel already injects through
// the Postgres integration, so nothing extra has to be configured.
function getSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const dbUrl = process.env.POSTGRES_URL;
  if (!dbUrl) throw new Error('Neither SESSION_SECRET nor POSTGRES_URL is set');
  return crypto.createHash('sha256').update(`admin-session:${dbUrl}`).digest('hex');
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

export function createSessionToken() {
  const payload = { iat: Date.now(), exp: Date.now() + SESSION_TTL_SECONDS * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;
  const expected = sign(encoded);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
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

export function isAuthenticated(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[COOKIE_NAME]);
}

export function requireAuth(req, res) {
  if (!isAuthenticated(req)) {
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
  const passwordMatches = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  return emailMatches && passwordMatches;
}
