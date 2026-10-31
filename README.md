# Yojana Sahayak website

Public website deployment derived from CPTECH47/yojana-sahayak, captain/server-integration commit fe351b32d1474de0da73fdde9b296a4d4248ac91. The project team owns the original website design and reviewed scheme evidence.

This repository publishes the Hindi/English directory on free GitHub Pages. It opens the existing approved WhatsApp destination, where the locally operated Baileys bot handles conversation. Keep that bot running for a live demonstration.

## Rebuild

Use Node 22, then run `npm ci`, `npm test` and `npm run build`. GitHub Actions deploys the generated `dist` on pushes to main and an hourly maintenance schedule. The catalogue export reuses the original approved-passage/hash/expiry checks and pinned answer records. Disputed scholarship deadline facts remain withheld. Browser refresh also removes records whose review date has passed using India time.

## Source updates

The website uses a pinned public-source snapshot. To publish a reviewed change or withdrawal, update the copied corpus and its matching metadata from the team's approved integration revision, update the recorded source commit, run the checks and push. The hourly build only re-evaluates the pinned sources' dates. It does not fetch or approve new government information.

## Deployment boundaries

The static website publishes reviewed information, exact citations, language selection, official CSC links and the WhatsApp entry point. The WhatsApp bot, AI inference, speech processing and Android SMS gateway run in the existing local environment. No credentials or linked-device state are part of this deployment.

Original project: https://github.com/CPTECH47/yojana-sahayak

## Daily source review

The separate `Daily official source review` workflow runs at 06:00 India time (`30 0 * * *` UTC) and can be started manually from Actions. It checks thirteen official discovery seeds listed in `corpus/discovery-registry.json` for all five occupation groups, including the PM-KMY, NMMSS and PM Vishwakarma policy pages. Inspect the `official-source-review` artifact for readable observations, source changes, new allowlisted links and fetch/extraction failures. The first cloud run reported two access failures and three unreadable pages; it still saved the report and baseline. Newly observed material stays pending review. This job does not automatically change the website's approved catalogue. The expanded local bot implementation is under review in https://github.com/CPTECH47/yojana-sahayak/pull/10 ; this site keeps its existing approved catalogue snapshot until a separate export.
