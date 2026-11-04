# Portfolio and resume

## Project description

Yojana Sahayak is a Hindi/English assistant for understanding government schemes. It combines retrieval of reviewed official evidence, pinned bilingual facts, explicit eligibility conditions, and a WhatsApp conversation. The public demo runs its reviewed-record question tool and selected-condition checks in the browser; the full local version adds optional model selection, WhatsApp pairing, encrypted consent-based storage, voice transcription, and source-review tools.

## Suggested resume bullets

- Extended a team hackathon prototype into a publicly testable bilingual scheme assistant with cited official evidence, preliminary eligibility checks, and a React interface.
- Added a shared-rule browser demo, configurable WhatsApp integration, source-expiry safeguards, and regression tests for unsupported claims, profile corrections, and request admission.

Use the measured final test counts from `VERIFICATION.md` if adding a testing metric. Do not claim guaranteed eligibility accuracy, zero hallucinations, production WhatsApp approval, or real-user adoption without separate evidence.

## Reviewer walkthrough

1. Open the public demo and finish a fictional PM-KISAN check.
2. Skip the last condition to see how unknown information is handled.
3. Correct a condition and see the result change.
4. Switch to Hindi and ask about a covered scheme's benefit.
5. Ask about an unsupported document exception and inspect the useful refusal.
6. Open the supporting official source, then inspect the architecture and test suite.

## Contribution and attribution

Credit the original team project and describe this repository as your extension and hardening work. Discuss your own UI, testing, integration, evidence-validation, or documentation contributions specifically. See `PROVENANCE.md` for the recovered baseline.
