# GitHub Radar run log

## Ownership and boundary

- Artifact family: `github-radar/`
- Writer: Codex delegated task `GitHub 教育/未来能力 Radar`
- Started: 2026-07-22 America/Los_Angeles
- Scope: discovery, API metadata registry, compact snapshots, public read route.
- Explicitly out of scope: clone/source storage, deep code analysis, substrate
  node creation/promotion, edits to schema/vocabulary/merged graphs/corpus/reviews.

## 2026-07-22

- Read root `AGENTS.md` and curator-first/frozen boundaries in `SCHEMA.md`.
- Confirmed no existing `github-radar/`, web framework, package manifest or
  `.openai/hosting.json`.
- Read PenEcho local Git origin only; exact gold seed is `penecho/penecho`.
- Verified current GitHub REST search/pagination/rate/ETag/release semantics from
  official GitHub documentation.
- Verified current Vercel Marketplace, plan/security and Neon/Supabase/Prisma
  pricing/backup facts from official provider documentation.
- Created independent crawler, registry contract, seed/query configs, Postgres
  migration, deployment notes and dependency-free static site.
- Registered all 23 supplied leads before verification.
- Live official API smoke run:
  - PenEcho exact seed: verified with repository, languages and latest-release
    endpoints (3 requests).
  - `topic:education`: 25 unique search results; 2 received full language/release
    hydration (7 requests total).
  - Incremental refresh: 1 saved ETag returned `304 Not Modified`.
  - Owner expansion: `penecho` returned 1 repository without changing the stable
    registry count or erasing hydrated metadata.
- Second-stage name verification: 23 selected, 20 API matches, 3 unresolved
  (`awesome-k12-cs`, `MDK12-Bench`, `xex`), with no request errors.
- Final local registry before hydration queue: 48 records, 45 API-verified,
  3 unverified name leads; 19 name matches remain explicitly `probable`.
- Structural validation: 0 errors.
- Hydration queue: 10 supplied leads received full repository/language/release
  calls (30 requests, no errors). Final completeness is 13 fully hydrated of 45
  verified records; 32 remain intentionally queued.
- Compact size after all lead provenance: registry 96 KiB; allowlisted public
  JSON about 56 KiB.
- Static validation: Python compile, JSON parse, query-length/operator guard and
  JavaScript syntax check passed. A network-bound browser preview was not needed
  for this delegated/background task; no deployment was authorized.
- Public export uses a field allowlist and excludes local provenance paths,
  internal API/clone fields and candidate-resolution details.

## 2026-07-24

- Added `github-radar/web/`, an isolated Next.js/React presentation layer. It
  reads only the allowlisted generated `site/data/registry.json` snapshot copied
  by `npm run sync:data`; it neither reads analysis output nor changes registry
  fields.
- Implemented sidebar search, kind/subject/language/activity filters, four
  sort orders, GitHub README links, GitHub social-preview thumbnail fallback,
  and a support route. The Buy Me a Coffee destination is deliberately empty
  until the curator supplies a creator-page URL through an environment variable.
- Local validation passed: `npm run sync:data`, `npm run build` (Next.js
  16.2.11), desktop/mobile browser visual checks, search filtering, and Support
  route navigation.
- No database, Vercel project, domain, scheduled job, GitHub analysis pipeline,
  paid resource, or support-account creation was authorized or performed.
- `npm audit` initially reported three high-severity items during install, but a
  follow-up advisory lookup could not be independently completed because the
  registry network request was not authorized. No automatic dependency upgrade
  was applied.
