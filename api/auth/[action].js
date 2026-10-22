import {
  verifyCredentials, verifyPassword, setPassword, createSessionToken, setSessionCookie, clearSessionCookie,
  isAuthenticated, requireAuth, clientIp, lockedMinutes, recordFailedLogin, clearFailedLogins, MIN_PASSWORD_LENGTH
} from '../_lib/auth.js';
import { sendJson, methodNotAllowed, withErrorHandling } from '../_lib/http.js';

export default async function handler(req, res) {
  const { action } = req.query;

  if (action === 'login') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    return withErrorHandling(res, async () => {
      const ip = clientIp(req);
      const locked = await lockedMinutes(ip);
      if (locked) {
        res.setHeader('Retry-After', String(locked * 60));
        return sendJson(res, 429, { error: `Trop de tentatives. Réessayez dans ${locked} min.` });
      }
      const { email, password } = req.body || {};
      const valid = await verifyCredentials(email, password);
      if (!valid) {
        await recordFailedLogin(ip);
        return sendJson(res, 401, { error: 'Email ou mot de passe incorrect' });
      }
      await clearFailedLogins(ip);
      setSessionCookie(res, await createSessionToken());
      sendJson(res, 200, { authenticated: true });
    });
  }

  if (action === 'logout') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    clearSessionCookie(res);
    return sendJson(res, 200, { authenticated: false });
  }

  if (action === 'session') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    return withErrorHandling(res, async () => {
      sendJson(res, 200, { authenticated: await isAuthenticated(req) });
    });
  }

  if (action === 'password') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    return withErrorHandling(res, async () => {
      if (!(await requireAuth(req, res))) return;
      const { currentPassword, newPassword } = req.body || {};
      if (!(await verifyPassword(currentPassword))) {
        return sendJson(res, 400, { error: 'Le mot de passe actuel est incorrect.' });
      }
      if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
        return sendJson(res, 400, { error: `Le nouveau mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.` });
      }
      if (newPassword === currentPassword) {
        return sendJson(res, 400, { error: 'Le nouveau mot de passe doit être différent de l\'actuel.' });
      }
      await setPassword(newPassword);
      // Every older session is now invalid; keep this one signed in
      setSessionCookie(res, await createSessionToken());
      sendJson(res, 200, { ok: true });
    });
  }

  return sendJson(res, 404, { error: 'Unknown auth action' });
}
