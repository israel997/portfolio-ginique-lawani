import { verifyPassword, createSessionToken, setSessionCookie, clearSessionCookie, isAuthenticated } from '../_lib/auth.js';
import { sendJson, methodNotAllowed, withErrorHandling } from '../_lib/http.js';

export default async function handler(req, res) {
  const { action } = req.query;

  if (action === 'login') {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    return withErrorHandling(res, async () => {
      const { password } = req.body || {};
      const valid = await verifyPassword(password);
      if (!valid) return sendJson(res, 401, { error: 'Invalid password' });
      setSessionCookie(res, createSessionToken());
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
    return sendJson(res, 200, { authenticated: isAuthenticated(req) });
  }

  return sendJson(res, 404, { error: 'Unknown auth action' });
}
