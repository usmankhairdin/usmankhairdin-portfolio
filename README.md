# Usman Khair Din — Interface Gallery Full Final

Production-ready portfolio build based on the approved immersive corridor experience.

## Final selected work
- PRIMA
- BizCare Benefits
- Bansar China
- Rantle
- Bum.Life
- PNWLeads

## Final pass highlights
- Selected-work index rebuilt around the six approved projects only.
- Project-card numbering removed; preview spacing and hierarchy rebalanced.
- Live project previews use live screenshot services with fallback handling.
- Work-room project wall uses the same approved six-project source and keeps the existing wheel browsing behavior.
- Every public/live project link opens in a new tab so the portfolio remains open.
- `/portfolio/...` links remain outbound references; deployment must preserve the existing `/portfolio` folder on the domain.
- About, Services, For Agencies, Contact, Work and project-detail pages receive a richer branded visual layer while preserving the cream/ink/accent system.
- Contact form is configured to deliver to `usman.khairdin@gmail.com` through FormSubmit.

## Local run
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

Deploy the contents of `dist/` to the domain root without deleting the existing `/portfolio` directory.
