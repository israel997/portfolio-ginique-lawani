export function sendJson(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
}

export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  sendJson(res, 405, { error: 'Method not allowed' });
}

export function parseIdParam(req) {
  const raw = req.query?.id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function withErrorHandling(res, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Internal server error' });
  }
}
