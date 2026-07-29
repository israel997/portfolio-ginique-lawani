import { isAuthenticated } from '../_lib/auth.js';
import { sendJson, methodNotAllowed } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  sendJson(res, 200, { authenticated: isAuthenticated(req) });
}
