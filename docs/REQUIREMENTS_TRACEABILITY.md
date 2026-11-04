# Requirement and discussion coverage matrix

This matrix distinguishes the official statement, owner-requested extensions, and implementation recommendations. PRD section numbers are the implementation references; Txx identifies its acceptance cases. "Covered" means specified in the handoff, not implemented or tested in the application.

## Official INNOVISTA scope

| ID | Requirement and provenance | PRD coverage | Verification |
|---|---|---|---|
| O01 | PS.pdf p10: collect 10-20 public scheme documents | 1, 4, 6 | T01, corpus inventory |
| O02 | p10: RAG retrieves relevant passages before answering | 8, 10 | T02; unseen question with retrieved evidence |
| O03 | p10: Hindi and English answers | 1, 5, 8 | T02; both languages |
| O04 | pp10-11: factual answers cite source documents | 5, 10, 16 | T06, T10; title, URL, page/section |
| O05 | p10: questionnaire recommends matches | 5, 9 | T11-T13; changed sample profile changes result |
| O06 | p11: unsupported details trigger no guessing | 5, 10, 18 | T07-T10, T16 |
| O07 | pp2/11: public sources; no real personal/private data | 1, 17, 19 | Synthetic fixtures; no recordings/PII in git |
| O08 | p2: working prototype, live demo, readable setup/code, future ideas | 21, 23 | Demo checklist and run instructions |
| O09 | p2: results must come from system, not hardcoded transcripts | 4, 8, 20 | Unseen paraphrases and data-change test |
| O10 | pp10-11: optional voice, regional languages, support checking, WhatsApp-style UI | 4, 10-12, 23 | T18-T19, T28; honest optional-feature status |
| O11 | p11: suggested FAISS/Chroma, AI4Bharat/Bhashini and any LLM | 8, 12, 22 | Choice remains explicit; tools are suggestions |

## Owner's product discussion after the problem statement

| ID | Discussed point | PRD coverage | Verification or dependency |
|---|---|---|---|
| U01 | Use RAG for Yojana Sahayak, not generic document chat | 1, 5-10 | Source-backed application journey |
| U02 | Connect to government websites where schemes appear | 6-7 | Approved source adapter and snapshot |
| U03 | Detect new and changed schemes automatically | 7, 14 | T27; collection versus review distinguished |
| U04 | Identify target audiences such as farmers and engineers | 2, 5, 7, 9 | T11; overlapping roles and detailed rules |
| U05 | Users fill profile information through WhatsApp | 5, 11, 17 | Confirmed sample attributes and correction |
| U06 | Store profiles in a database and match automatically | 9, 14, 17 | Profile/rule version consistency |
| U07 | Voice notes transcribed on the local AI machine | 12 | T18-T19; no assumption of handset inference |
| U08 | Answer by voice or text | 5, 12 | Same validated payload; text fallback |
| U09 | Run as much as possible locally | 12, 15 | Local/hybrid boundary documented |
| U10 | Clarify the OpenAI 3.4-billion-model idea | 12 | gpt-oss-20b total/active distinction; benchmark pending |
| U11 | Better RAG means discovery, matching and application guidance | 5, 8-10 | Complete journey beyond FAQ |
| U12 | Do not recommend a scheme that is not there | 6, 10 | T08; approved-ID gate |
| U13 | Automatic hallucination prevention | 10, 20 | Evidence/field/version gates; no zero-error claim |
| U14 | Do not refuse every useful question | 3, 5, 10, 20 | T04-T06; false-refusal metric |
| U15 | Rural users may not know how to claim a scheme | 5, 13 | Sourced steps, checklist and assistance |
| U16 | Suggest nearby cyber cafes or other centres | 13 | T20-T22; CSC/office/private distinction |
| U17 | Can nearby help be implemented freely and easily? | 13, 15 | No-key search links versus verified directory effort |
| U18 | Distinguish free locator from free centre service | 13 | Unknown fees stay unknown; no invented free help |
| U19 | Coarse location or GPS; approximate nearest centre | 5, 13 | T20-T21; distance bounded to known directory |
| U20 | Spread the product in rural areas | 14 | Proposed CSC/NGO/panchayat/school pilot, no fake partnerships |
| U21 | Local languages, literacy and weak connectivity | 5, 12, 14 | Short prompts, voice, simple phones; honest internet dependence |
| U22 | Potentially use WhatsApp/Baileys | 11 | Provider adapter, official-platform preference, experimental limits |
| U23 | Privacy and escalation | 11, 17, 19 | Consent, no sensitive IDs, deletion and human-help route |
| U24 | Find free GitHub code to reuse | 22 | Four licence-checked repositories and practical limits |
| U25 | A close scheme/RAG reference repository | 22 | Sahakar Sahayak; hosted default and audit limits |
| U26 | WhatsApp, STT and local-model building blocks | 12, 22 | PyWa, faster-whisper, Ollama; separate weight licences |
| U27 | Tiny demo built in 9-10 minutes: continue? | 3-4 | Preserve transport; no unnecessary rebuild |
| U28 | START response and advertised benefit/MATCH examples | 3, 20 | T03-T06; real commands retained as tests |
| U29 | Scheme-only PM-KISAN request gets a generic refusal | 3, 18 | T04; overview/clarification route |
| U30 | Diagnose parser versus retrieval/ingestion failure | 3 | Exact-example comparison and distinct reason codes |
| U31 | Sample `yes no no` is not official eligibility | 3, 9 | Named questions, exclusions, unknowns |
| U32 | What to add next | 4, 21 | Ordered stages and exit gates |
| U33 | Are GCP credits necessary? | 1, 15 | Optional; original statement allows other tools |
| U34 | Best GCP alternative for current project | 15-16 | Existing Render/Supabase stack; laptop/tunnel for local demo |
| U35 | Free-tier constraints | 15 | Idle host, ephemeral files, database quotas/pausing, tunnel lifetime |
| U36 | Proactive scheme notifications | 11, 14 | Opt-in, templates/window, deduplication and cancellation |
| U37 | Include the official-government-sources PDF | 6, 24 | Exact attached file, SHA-256 and local relative link |
| U38 | Avoid losing any source entries | 6; registry | 8 pages, 91 annotations, 86 unique URLs |
| U39 | Discovery portal differs from rules and application portal | 5-7 | Separate URL/evidence roles |
| U40 | Source freshness, exclusions and mandatory/conditional documents | 5-7, 9-10 | T09, T13-T16; no invented alternatives |
| U41 | Save complete PRD for Captain Codex | Whole package | README entry point and copyable prompt |
| U42 | Push PRD and PDF to GitHub | Product handoff | Dedicated documentation branch and reviewable PR |
| U43 | Presentation/demo readiness | 23 | Demo journey, trust explanation, roadmap and judge questions |
| U44 | Save/export recommendations | 5, 20 | T26; selected sourced content, no private exports |

## Deliberate corrections and limits

- Earlier "one language" and "5-10 schemes" suggestions described an intermediate pilot. The official minimum is bilingual Hindi/English and 10-20 public documents; do not downgrade it.
- The source directory is not 86 verified schemes. It contains 86 unique URLs across directories, departments, programmes and services.
- No fully local claim is valid if hosted Supabase or hosted AI is used. No offline WhatsApp claim is valid.
- A catalogue-ID gate can block unknown records; source extraction and interpretation still require validation.
- Broad architecture research is supplied here; credentials, live source verification, actual prototype inspection, centre verification and hardware benchmarking remain necessary execution tasks.
