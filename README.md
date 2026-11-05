# Prompt Genie Studio

A responsive Prompt Genie website with three input modes. Static assets are in `public/`; Vercel Node.js functions are in `api/`.

- **Text to prompt** — sends an idea to `/prompt/text`.
- **Image URL to prompt** — sends a public image URL to `/prompt/image-url`.
- **Image to prompt** — uploads a local image and instruction to `/prompt/image`.

The browser calls same-origin `/api/prompt/*` functions. Those Vercel functions proxy to `https://prompt-genie-five.vercel.app`, so the browser does not need direct cross-origin access to the upstream API.

## Deploy on Vercel

1. Download and extract this project ZIP.
2. Put the extracted `prompt-genie` folder into a GitHub repository (or upload the files to a new repository).
3. Open [Vercel](https://vercel.com/new), import that repository, and deploy.
4. No environment variables are required. The upstream API URL is configured in `api/_utils.js`.
5. Open the deployed Vercel URL and test all three modes.

**Important:** deploy this project to Vercel (or another host that supports its Node.js serverless functions). Opening `index.html` directly from a phone's file manager will not make the `/api` proxy functions work. Vercel's serverless functions remove the browser-to-upstream CORS dependency, but they cannot fix an outage or a restriction inside the upstream Prompt Genie service itself.

## Run locally

Requires Node.js 20+.

```bash
npm install
npx vercel dev
```

Then open the local URL shown by Vercel CLI.

## API mapping

| Website request | Upstream request |
|---|---|
| `POST /api/prompt/text` with `{ "text": "..." }` | `GET https://prompt-genie-five.vercel.app/prompt/text?text=...` |
| `POST /api/prompt/image-url` with `{ "image_url": "https://..." }` | `GET https://prompt-genie-five.vercel.app/prompt/image-url?image_url=...` |
| `POST /api/prompt/image` with `multipart/form-data` | `POST https://prompt-genie-five.vercel.app/prompt/image` with the original multipart body |

## Included safeguards

- Input validation for empty text, malformed image URLs and unsupported upload types.
- 10,000-character text limit and 4 MB image-upload limit (kept below Vercel Functions’ 4.5 MB request-body ceiling).
- 65-second upstream timeout and understandable network/service errors.
- Same-origin server-side proxy to avoid browser CORS errors.
- Safe rendering of generated output as text (not executable HTML).
- Retry, cancel, copy, download, upload preview, and recent prompt history.
- Recent history is stored only in this browser's local storage; use **Clear history** to remove it.
- Responsive mobile navigation and reduced-motion support.

## Notes

The API's exact response schema and live availability could not be independently verified during project creation. The UI accepts JSON and plain-text responses and tries common prompt/result fields before falling back to readable JSON. If the upstream service changes its request fields or response format, update the matching file under `api/prompt/` or `readableResponse()` in `app.js`.
