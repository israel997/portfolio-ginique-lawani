import { verifyPassword, createSessionToken, setSessionCookie } from '../_lib/auth.js';
import { sendJson, methodNotAllowed, withErrorHandling } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  await withErrorHandling(res, async () => {
    const { password } = req.body || {};
    const valid = await verifyPassword(password);
    if (!valid) return sendJson(res, 401, { error: 'Invalid password' });

    setSessionCookie(res, createSessionToken());
    sendJson(res, 200, { authenticated: true });
  });
}
