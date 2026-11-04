# Rebuild scope and acceptance

The original hackathon concept is retained in `ORIGINAL_PRD.md`. This build extends the tested team implementation rather than discarding its evidence and privacy checks. The browser and WhatsApp use the same rules and answer service.

## Implemented in this repository

1. Recover the original product requirements and preserve upstream provenance.
2. Import only tracked source and reviewed corpus data, excluding credentials, session files, real profiles, old runtime output, and handoffs.
3. Remove the team's hardcoded WhatsApp contact. A new install has no active WhatsApp destination.
4. Add the real Hindi/English browser questionnaire and chat; preserve source-linked scheme browsing and assistance link-outs.
5. Supply questionnaires from the backend only when their rule evidence is currently usable.
6. Expose core readiness independently of the optional local model, with degraded extractive mode explicit.
7. Include selected ECC skills locally, CI, setup instructions, and actual verification results.

## Acceptance cases

- A fresh checkout builds and starts without Supabase, a model, a WhatsApp login, or API keys.
- A user can finish the PM-KISAN questionnaire, review answers, correct one answer, and see a sourced preliminary result.
- A skipped condition remains unknown and is listed in the result.
- A failed condition is explained; it does not become an approved match.
- Switching to Hindi updates the questions, controls, replies, and source labels.
- Scheme changes discard the previous scheme's answers. Language changes invalidate pending responses without silently changing answers.
- A factual question returns only a pinned record and citations, including when Ollama is unavailable.
- An unsupported detail cannot borrow a generic application fact. Invented model IDs, altered passages, expired sources, and quarantined dates are withheld.
- Without an owner number, WhatsApp links are absent and the redirect fails without choosing another contact. A configured fictional test number is used consistently in generated links.
- Unavailable API, authentication, timeout, busy, and rate-limited responses show recoverable states.
- Browser responses do not persist profiles. WhatsApp SAVE, alert consent, STOP, RESUME, and DELETE retain their independent meanings.

## External acceptance still required

- Pair the owner's own WhatsApp number and run a two-account handset test.
- Benchmark optional Qwen inference and local voice transcription on the selected hardware and languages.
- Re-review official scheme evidence before presenting it as current. Dates in the corpus are historical review metadata, not claims of checks on every app launch.
- Production hosting, approved messaging transport, verified centre listings, spoken replies, and scheme applications require separate implementation/operational work.
