# Production deployment — usmankhairdin.com

This build replaces the root portfolio and includes the complete maintained Bum.Life static demo. The existing Forma and Veyravael public demos remain on the host.

## Critical rule

**Do not delete `public_html/portfolio/` or replace its other project folders.** The included `dist/portfolio/bum.life/` may update that demo, including its referenced JS, CSS and images. Its shared `demo-forms.js` helper is included too.

The final Work set deliberately links to existing public project folders including:

- `/portfolio/forma/`
- `/portfolio/veyravael/`
- `/portfolio/bum.life/`

The included `.htaccess` leaves real files/directories alone and serves generated route HTML. Unknown paths return a real 404. Retired BizCare and PNWLeads source/demo folders are no longer included in this repository or deployment package.

## Build locally

```bash
npm install
npm run build
npm test
npm run check:seo
npm run check:links -- --offline
```

The deployable files will be created in `dist/`.

## Replace the root site in cPanel

1. Back up the current `public_html` root files.
2. Preserve existing project folders under `public_html/portfolio/`; update only the included Bum.Life runtime files and demo helper.
3. Remove/replace only the old root-site files that conflict with the new site.
4. Upload the **contents of `dist/`** into `public_html/`.
5. Confirm `.htaccess` exists at `public_html/.htaccess` after upload.
6. Do not point the domain to another host unless the legacy `/portfolio/` URLs have also been migrated/proxied.

## Production checks

- `/` loads the immersive homepage on desktop and the Web Experience on mobile/coarse-pointer devices.
- `/work/`, `/services/`, `/for-agencies/`, `/about/`, `/contact/` load on direct refresh.
- `/work/sanaira/`, `/work/forma/`, `/work/prima/`, `/work/veyravael/`, `/work/rantle/`, `/work/bum-life/`, and `/work/personal-portfolio-3d/` load on direct refresh.
- `https://www.usmankhairdin.com/portfolio/forma/` and `/portfolio/veyravael/` still load.
- `https://www.usmankhairdin.com/portfolio/bum.life/` still loads.
- Every **Live project** link opens in a new tab.
- Contact form sends to `brief@usmankhairdin.com`.

## Contact form

The form currently uses FormSubmit. The first real submission may trigger a one-time activation email to `brief@usmankhairdin.com`. Confirm that activation once. Later, the transport can be changed to a domain mailbox/backend without redesigning the form.
