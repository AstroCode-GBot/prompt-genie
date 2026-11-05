'use strict';
const { UPSTREAM, sendJson, methodNotAllowed, forwardRequest, readRawBody } = require('../../lib/api-utils');

async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data;')) {
    return sendJson(res, 400, { error: 'Upload an image using a multipart form.' });
  }
  try {
    const body = await readRawBody(req);
    if (!body.length) return sendJson(res, 400, { error: 'The image upload was empty.' });
    const url = new URL('/prompt/image', UPSTREAM);
    return forwardRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': contentType, Accept: 'application/json, text/plain, */*' },
      body
    }, res);
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message || 'Could not read the uploaded image.' });
  }
};

handler.config = { api: { bodyParser: false } };
module.exports = handler;
