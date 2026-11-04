# Security and data handling

The public GitHub Pages demo processes questionnaire answers and reviewed-record questions in the current browser tab. It has no model endpoint, private credential, account login, saved beneficiary profile, or message-sending capability. Only the interface and public evidence catalogue are fetched. External source links and the CSC locator open third-party sites.

The optional local Node/WhatsApp application has different trust boundaries. Keep it bound to loopback by default. Exposing it requires a private API token, HTTPS, a known reverse-proxy boundary, and a deployment-specific review. Never put the token into a static build or commit `.env`, pairing/auth directories, encrypted state keys, real profiles, transcripts, or messages.

Review scope and actual results are recorded in `docs/SECURITY_REVIEW.md`. Passing tests or a dependency audit is not proof that every vulnerability has been found.

For a discovered issue, avoid posting credentials or beneficiary information. Use GitHub's private vulnerability reporting if enabled, or provide a minimal sanitized reproduction to the repository owner.
