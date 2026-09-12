# Usman Khair Din — Portfolio v1

Premium multi-page portfolio and white-label agency-partner website.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If the development server has a local networking issue, use the production build instead:

```bash
npm run build
npm run start -- -H 127.0.0.1
```

Then open `http://127.0.0.1:3000`.

## Production checks

```bash
npm run build
```

## Important before production deployment

- Replace the preview-only contact form handler with the selected email/form endpoint.
- Add approved high-resolution project screenshots to the case studies.
- Verify the live project links and final project scope copy.
- Point the deployment preview to `usmankhairdin.com` only after approval.
