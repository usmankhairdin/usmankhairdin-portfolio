# Avenlo standalone Work addition — 2026-10-22

Owner authorized uploading the existing Avenlo Static edition, adding one Work item and pushing the portfolio. No redesign of the existing portfolio or changes to prior project destinations were requested.

- Work item and generated SEO route: /work/avenlo/.
- Public static demo: /portfolio/avenlo/. All171 compiled files match the approved store release byte-for-byte; source and buyer ZIPs are not public.
- Screenshots reuse the fully loaded actual-page captures from the completed store release. Case-study evidence covers Individuals, Brokers, Employers, Health insurance and plan discovery. Existing case-study components and Avenlo-specific colour tokens are used without changing shared layouts/styles.
- Existing seven project records include the six earlier items unchanged. Avenlo is standalone-only: workRoom:false keeps the fixed six-display immersive room unchanged through the existing data adapter.
- Work count and sitemap include the additional item. Existing portfolio URLs, homepage feature order, header, footer, CSS and immersive geometry are preserved.
- Verification:289 Node tests passed; production build,15 indexed-route SEO checks and offline link checks (247 assets/564 demo references) passed. Headless Chrome verified Work -> Avenlo case study, light/dark and mobile fit, and five main static demo routes at the actual /portfolio/avenlo/ mount with zero page/resource errors.
- The link scanner excludes computed template-string fragments only inside the newly compiled Avenlo JS; literal dependency checks remain active.

Push is authorized. Existing GitHub Actions deploys main to Namecheap; no live post-push deployment monitoring requested. Prior static portfolio folders must remain intact.
