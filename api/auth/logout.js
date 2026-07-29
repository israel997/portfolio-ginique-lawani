import { clearSessionCookie } from '../_lib/auth.js';
import { sendJson, methodNotAllowed } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  clearSessionCookie(res);
  sendJson(res, 200, { authenticated: false });
}
