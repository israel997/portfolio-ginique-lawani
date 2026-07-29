import { handleUpload } from '@vercel/blob/client';
import { isAuthenticated } from '../_lib/auth.js';
import { sendJson, methodNotAllowed } from '../_lib/http.js';

// Mints short-lived, direct-to-Blob upload tokens for the admin UI (CV, profile
// photo, project images). Auth is checked inside onBeforeGenerateToken, not by
// gating the whole handler, because Vercel Blob also calls this same route
// server-to-server for the (unused here) upload-completed event.
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!isAuthenticated(req)) {
          throw new Error('Unauthorized');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'],
          addRandomSuffix: true
        };
      }
    });
    sendJson(res, 200, jsonResponse);
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
}
