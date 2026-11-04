# Working on Yojana Sahayak

This is Tejas's independent development repository. The owner has authorized work across this checkout. Team branch restrictions in the original event handoffs do not apply here.

## Read first

- `docs/BUILD_PLAN.md` describes the current scope and acceptance cases.
- `docs/ORIGINAL_PRD.md` preserves the original, dated product brief; its roadmap is not a claim that every feature is implemented.
- `docs/ARCHITECTURE.md` describes transport, evidence, rules, and storage boundaries.
- `.agents/skills/search-first/SKILL.md` and `.agents/skills/verification-loop/SKILL.md` contain the selected ECC workflows. They are project-local; no global hooks or settings are installed.

## Invariants

- Final answers render approved bilingual fact records. Model-generated amounts, URLs, eligibility decisions, and translations must never be rendered as trusted scheme facts.
- Keep retrieval, source expiry, integrity checks, rule-evidence locks, and disputed-source quarantine enabled. A crawler cannot approve its own output.
- Preserve missing answers as unknown. Results are preliminary checks of selected conditions, never approval.
- Never introduce an operator phone number as a default. `YOJANA_WHATSAPP_NUMBER` is optional, owner-configured, and controls all public restart destinations.
- Do not copy `.env`, pairing/auth files, model caches, runtime records, or real beneficiary data into Git.
- Test profile changes, unknown schemes, unsupported facts, expired evidence, and failure recovery when changing answer behavior.
- Keep `npm ci`, `npm test`, `npm run build`, `npm run check:release`, and `npm start` working. Add checks for changed behavior; do not pad the suite with implementation-mirroring tests.
- Record actual check results and unverified external integrations in `docs/VERIFICATION.md`.

## Scope

The web interface is a local companion for the same backend used by WhatsApp. Preserve its existing directory design when making functional changes. A GitHub push is source delivery; do not assume it deploys the service or pairs a phone. Starting a new WhatsApp account requires the owner's pairing action. Do not operate the original team's bot.
