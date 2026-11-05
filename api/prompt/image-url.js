'use strict';
const { UPSTREAM, sendJson, methodNotAllowed, forwardRequest } = require('../../lib/api-utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  const imageUrl = typeof req.body?.image_url === 'string' ? req.body.image_url.trim() : '';
  if (!imageUrl) return sendJson(res, 400, { error: 'Please provide an image URL.' });
  if (imageUrl.length > 2048) return sendJson(res, 400, { error: 'The image URL is too long.' });
  let parsed;
  try { parsed = new URL(imageUrl); } catch { return sendJson(res, 400, { error: 'That image URL is not valid.' }); }
  if (!['http:', 'https:'].includes(parsed.protocol)) return sendJson(res, 400, { error: 'Only HTTP and HTTPS image URLs are supported.' });
  const url = new URL('/prompt/image-url', UPSTREAM);
  url.searchParams.set('image_url', parsed.href);
  return forwardRequest(url, { method: 'GET', headers: { Accept: 'application/json, text/plain, */*' } }, res);
};
