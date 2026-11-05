'use strict';
const { UPSTREAM, sendJson, methodNotAllowed, forwardRequest } = require('../../lib/api-utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) return sendJson(res, 400, { error: 'Please provide an idea to turn into a prompt.' });
  if (text.length > 10000) return sendJson(res, 413, { error: 'Your idea is too long. Keep it under 10,000 characters.' });
  const url = new URL('/prompt/text', UPSTREAM);
  url.searchParams.set('text', text);
  return forwardRequest(url, { method: 'GET', headers: { Accept: 'application/json, text/plain, */*' } }, res);
};
