# Security review

Scope: the public GitHub Pages demo, its build/export path, the local Express API, and the optional WhatsApp integration. Reviewed on 4 November 2026. This is a code and behavior review, not a claim that every possible vulnerability has been eliminated.

## Fixed

| Finding | Change and evidence |
| --- | --- |
| Team operator's phone number embedded in public and restart routes | Removed the default. Both local routes use a validated owner setting; the public demo has no WhatsApp destination by default. Regression cases cover missing, invalid, and configured numbers. |
| Demo required a live paired phone or server | Added a static browser mode with no secret, model endpoint, message sending, or profile storage. It shares reviewed data and rule semantics with the local application. |
| A disconnected HTTP client could free the concurrency slot while model work continued | Admission is held until the async handler settles. A regression test aborts the first client and checks that new work is still rejected. |
| A question naming a different scheme could borrow facts from the selected dropdown scheme | Both engines clarify the conflict before selecting any facts. |
| Proxy clients could share one rate bucket, or arbitrary forwarded addresses could be trusted | Direct connections remain the default. Known proxy CIDRs can be explicitly configured; untrusted forwarding headers cannot evade the default bucket. |
| Browser lacked complete failure/correction states | Added skip/review/edit, missing-information results, timeout, unauthorized, busy, unavailable, and rate-limited handling. Pending responses are invalidated on scheme/language changes. |
| Browser security and search metadata were incomplete | Added restrictive CSP, no object embedding, referrer policy, no unnecessary browser permissions, canonical metadata, favicon, robots and sitemap. Static hosting cannot set every custom HTTP header; Node sets additional response headers. |

## Preserved controls

- Only approved, unexpired passages whose metadata and hashes match the manifest can support facts.
- Bilingual facts and rule evidence are independently pinned; quarantined scholarship dates remain withheld.
- Model output selects allowed IDs and cannot supply the final amount, URL, translation, or eligibility claim.
- The public demo reevaluates source expiry at runtime. A build cannot turn pending fetched material into approved evidence.
- API input size, per-client rates and work admission are bounded. No public cross-origin API access is enabled.
- React renders text without HTML injection; source URLs use HTTPS. External links use referrer protection.
- Local saved profiles require explicit consent, are encrypted, expire, and can be deleted. Alerts require separate consent and remain disabled by default.
- The new repository excludes private `.env`, pairing files, runtime keys/profiles, audio files, and model caches.

## Remaining operational boundaries

- The public demo is a reviewed-data prototype, not a beneficiary application portal or an eligibility authority.
- WhatsApp pairing and handset testing must use the owner's account. Baileys is unofficial; production transport and messaging policies require separate review.
- Live local model and speech-to-text accuracy/performance require hardware and language testing. The public demo does not send input to them.
- Source review has finite dates and coverage. Before an important demonstration, rerun the release gate and re-review any expired or changed source.
- GitHub Pages serves static content over HTTPS. It cannot run Node, Ollama, local Whisper, encrypted profile storage, or background WhatsApp sessions.
- Google indexing is controlled by Google. Public availability, canonical metadata and a sitemap support discovery but do not guarantee ranking or index inclusion.

Measured checks and deployment results are recorded in `VERIFICATION.md`.
