# Feedback scope for this project

- Treat the immersive corridor and its rooms as one design surface. Feedback given inside that experience applies to all genuinely similar corridor/room elements unless the user explicitly limits it to one place.
- Treat the standalone web pages as a separate design surface. Feedback given on a standalone page applies to genuinely similar standalone-page elements unless the user explicitly limits it. Do not carry a treatment across the immersive/standalone boundary.
- Use shared components or shared styles for equivalent elements so a later change stays synchronized. Preserve page-specific content, artwork, and controls with different functions.
- Do not push to GitHub or deploy unless the user explicitly requests it.

## Owner push-only workflow — 2026-10-22

- When the owner says "just push", commit the authorized pending changes and push. Do not run or repeat tests, builds, audits or browser QA as part of that request unless separately asked.
- After pushing, stop and report the push result. Do not poll CI/deployment, inspect live pages or verify deployment success unless explicitly requested.
- Preserve existing automatic CI/deployment workflows. Keep credentials/private runtime files out of commits and do not force-push or include unrelated corridor work.