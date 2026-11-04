# Verification

Local checks on **4 November 2026**, Windows, Node **24.19.0**, Python **3.13**.

| Check | Observed result |
| --- | --- |
| Node regression suite with V8 coverage | **189 passed, 0 failed**; **94.50% lines**, 87.71% branches, 94.59% functions for measured Node modules |
| Static/backend rule parity | **3,780** Hindi/English true/false/unknown profile assessments across all six scheme families |
| Python source ingestion/update tests | **13 passed** in an isolated environment with `requirements-ingest.txt` |
| Local and public production builds | Vite production builds completed; public build exports 18 reviewed records and six questionnaires |
| Syntax | 60 server/tool JavaScript modules checked; JSX checked by Vite |
| Release evidence gate | Passed: 11 currently usable source documents, six scheme families, 18 pinned answer records |
| npm audit | 0 reported vulnerabilities in the installed dependency graph |
| Credentials/runtime scan | No token/private-key patterns or tracked runtime/auth/profile files found in the prepared source |

## Browser acceptance

Executed against the built public mode at its GitHub Pages base path, without a backend API:

- English PM-KISAN questionnaire: yes/no/no/unknown produced **More information needed** and exact source citations.
- Changing the unknown condition to no produced **Possible match on selected conditions**.
- Hindi scheme question returned the reviewed Hindi benefit text and its official citation.
- Unsupported PAN-card exception was withheld without borrowed claims.
- Language and scheme switching, review/correction controls, and disabled submit states were inspected.
- Browser error log was empty during the exercised journey.
- Phone-sized viewport: questionnaire controls remained readable, and content width matched the viewport without horizontal overflow.

Node HTTP tests additionally exercised authentication, invalid/oversized input, rate limits, proxy-header boundaries, concurrent-work admission, and an aborted client retaining its work slot until handler completion.

## Target acceptance

GitHub Pages deployment and repository push verification are recorded below after publication. Local success alone does not establish a successful hosted deployment.

Live WhatsApp pairing, real handset audio, local Qwen/Whisper performance, official source re-review, production messaging approval, and actual Google indexing are **not established by these checks**. The public demo deliberately uses reviewed records and selected-condition rules without a cloud inference service or beneficiary data storage.
