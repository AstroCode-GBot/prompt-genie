'use strict';

const UPSTREAM = 'https://prompt-genie-five.vercel.app';
// Leave multipart boundary/header headroom below Vercel’s 4.5 MB function payload cap.
const MAX_BODY_BYTES = Math.floor(4.2 * 1024 * 1024);

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function methodNotAllowed(res) {
  res.setHeader('Allow', 'POST');
  sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
}

async function forwardRequest(targetUrl, options, res) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 65000);
  try {
    const upstream = await fetch(targetUrl, { ...options, signal: controller.signal });
    const body = Buffer.from(await upstream.arrayBuffer());
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(body);
  } catch (error) {
    const timedOut = error && error.name === 'AbortError';
    sendJson(res, timedOut ? 504 : 502, {
      error: timedOut
        ? 'The prompt service took too long to respond. Please try again.'
        : 'Could not connect to the Prompt Genie API. Check the upstream service and try again.'
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readRawBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      const error = new Error('Uploaded request is too large. Keep the image under 4 MB.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = { UPSTREAM, sendJson, methodNotAllowed, forwardRequest, readRawBody };
