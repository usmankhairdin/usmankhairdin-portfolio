# Production deployment — usmankhairdin.com

This build is intended to replace the root portfolio site while preserving the existing legacy project folders under `/portfolio/`.

## Critical rule

**Do not delete or overwrite `public_html/portfolio/`.**

The final Work set deliberately links to existing public project folders including:

- `/portfolio/bizcare/`
- `/portfolio/bum.life/`
- `/portfolio/PNWLeads/`

The included `.htaccess` leaves real files/directories alone before applying the React SPA fallback, so those legacy project folders remain directly accessible.

## Build locally

```bash
npm install
npm run build
```

The deployable files will be created in `dist/`.

## Replace the root site in cPanel

1. Back up the current `public_html` root files.
2. Keep the `public_html/portfolio/` directory untouched.
3. Remove/replace only the old root-site files that conflict with the new site.
4. Upload the **contents of `dist/`** into `public_html/`.
5. Confirm `.htaccess` exists at `public_html/.htaccess` after upload.
6. Do not point the domain to another host unless the legacy `/portfolio/` URLs have also been migrated/proxied.

## Production checks

- `/` loads the immersive homepage.
- `/work/`, `/services/`, `/for-agencies/`, `/about/`, `/contact/` load on direct refresh.
- `/work/prima/`, `/work/bizcare/`, `/work/bansar/`, `/work/rantle/`, `/work/bum-life/`, `/work/pnw-leads/` load on direct refresh.
- `https://www.usmankhairdin.com/portfolio/bizcare/` still loads.
- `https://www.usmankhairdin.com/portfolio/bum.life/` still loads.
- `https://www.usmankhairdin.com/portfolio/PNWLeads/` still loads.
- Every **Live project** link opens in a new tab.
- Contact form sends to `usman.khairdin@gmail.com`.

## Contact form

The form currently uses FormSubmit. The first real submission may trigger a one-time activation email to `usman.khairdin@gmail.com`. Confirm that activation once. Later, the transport can be changed to a domain mailbox/backend without redesigning the form.
