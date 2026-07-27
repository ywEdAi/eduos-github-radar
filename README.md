# GitHub 教育 / 未来能力 Radar

This directory is an independent, metadata-only discovery registry. It does not
write substrate nodes, infer deep product capabilities, or clone repositories.
Its stable deduplication key is GitHub's numeric repository ID.

## Boundary

- Writes only under `github-radar/` plus `tasks/github-radar-2026-07-22.md`.
- Treats every user/image lead as `unverified` before an API response.
- A `verified` record means GitHub returned current repository metadata. For an
  ambiguous name-only lead, `lead_match_status: probable` still requires curator
  confirmation that it is the intended repository.
- Keeps clone URLs as metadata only. There is no clone/submodule/download code.
- Uses a basic `repo | dataset | benchmark | awesome_index | unknown` kind. It
  deliberately does not perform capability classification or source analysis.
- This registry schema is independent of `SCHEMA.md` and `VOCABULARY.md`.

## Files

- `config/seeds.json`: exact/name lead registry; PenEcho is the gold exact seed.
- `config/query-matrix.json`: high-recall English/Chinese discovery queries.
- `config/awesome-leads.example.txt`: exact lead-import format for approved
  awesome indices.
- `scripts/crawl.py`: seed verification, discovery, hydration, incremental refresh.
- `config/skill-sources.json`: curator-approved first-party Skills collections.
- `config/skill-query-matrix.json`: bounded GitHub `SKILL.md` discovery queries
  for public community Skills.
- `scripts/crawl_skills.py`: metadata-only Skills manifest collector; it reads
  public GitHub repository metadata, file trees, and `SKILL.md` frontmatter.
- `data/skills.jsonl`: high-recall local Skills registry. It never stores a
  skill body, scripts, assets, or references.
- `scripts/build_skills_site.py`: education-oriented public Skills export.
- `docs/skills-roadmap.md`: product boundary, collection route, and EduOS handoff.
- `schema/registry.schema.json`: registry contract.
- `migrations/001_init.sql`: future managed Postgres schema.
- `data/registry.jsonl`: compact canonical local registry.
- `data/snapshots/`: immutable-per-run compact snapshots, never source archives.
- `site/`: dependency-free read-only public page.
- `web/`: polished Next.js/React Radar UI, ready to deploy from this directory
  as a Vercel project. It reads the generated public snapshot and is independent
  of any deep-analysis work.
- `docs/`: API and deployment decisions.

## Reproducible commands

Python 3.10+ is sufficient; there are no third-party Python dependencies.

```bash
cd github-radar

# Validate code and configuration without network access.
python3 -m py_compile scripts/crawl.py scripts/build_site.py scripts/validate.py
python3 -m json.tool config/seeds.json >/dev/null
python3 -m json.tool config/query-matrix.json >/dev/null
python3 -m json.tool schema/registry.schema.json >/dev/null

# Register all leads as unverified, then verify only the exact PenEcho gold seed.
python3 scripts/crawl.py seed --only penecho

# Resolve a small named-lead batch. Without GITHUB_TOKEN, search is throttled to
# one request per 6.2 seconds and the core API is limited to 60 requests/hour.
python3 scripts/crawl.py seed --limit 5

# Verify every name lead from repository-search metadata while deferring the
# extra languages/release calls. Ambiguous name matches remain `probable`.
python3 scripts/crawl.py seed --summary-only

# One-page discovery for a controlled query family. Search results are compact
# metadata records; hydrate only the top 10 records with languages/releases.
python3 scripts/crawl.py discover \
  --family education-native \
  --query-limit 2 \
  --pages 1 \
  --hydrate-limit 10

# Incremental conditional refresh using saved ETags.
python3 scripts/crawl.py refresh --limit 50

# Fill languages/latest release later, prioritizing supplied leads.
python3 scripts/crawl.py hydrate --lead-only --limit 20

# Controlled organization/topic neighbors; no graph-wide expansion.
python3 scripts/crawl.py expand --owner penecho --pages 1
python3 scripts/crawl.py expand --topic education,edtech --pages 1

# Import exact repository URLs/names extracted from a curator-approved awesome
# list. The crawler verifies metadata but does not fetch/store the README.
python3 scripts/crawl.py expand --lead-file config/awesome-leads.txt

# Validate and build the read-only static export.
python3 scripts/validate.py \
  --report reports/data-quality-$(date -u +%F).md
python3 scripts/build_site.py
python3 -m http.server 8000 --directory site

# Skills: official collections plus a bounded community GitHub search. This
# fetches only public repository metadata, trees, and SKILL.md frontmatter.
GH_TOKEN="$(gh auth token)" python3 scripts/crawl_skills.py --discover \
  --query-limit 40 --per-page 20
python3 scripts/validate_skills.py \
  --report reports/skills-data-quality-$(date -u +%F).md
python3 scripts/build_skills_site.py
```

## React website (Vercel-ready)

The initial public UI remains available in `site/`. The deployable React version
lives independently in `web/`; it consumes only the allowlisted public snapshot
and does not require a database for the current 48-record catalog.

```bash
cd github-radar/web
npm install
npm run sync:data
npm run dev
npm run build
```

For Vercel, import this repository and set the project's **Root Directory** to
`web`. The website is intentionally not deployed or linked to a
Vercel account by this repository. To enable the outbound support button, set
`NEXT_PUBLIC_BUY_ME_A_COFFEE_URL` to the creator-page URL in the Vercel project
environment. Do not set `DATABASE_URL`, `GITHUB_TOKEN`, or `CRON_SECRET` until
the scheduled-refresh architecture is explicitly enabled.

The visible thumbnail uses GitHub's public social-preview endpoint with a local
branded fallback. When a scheduled screenshot cache is configured,
`homepage_screenshot_url` takes priority for repositories with a website. Do
not call a third-party screenshot API from each public page view: it creates
visitor-facing rate-limit failures and leaks every homepage URL to that vendor.

For a larger run, set a read-only GitHub token in the shell, do not put it in
`.env.example`, and partition the matrix by date/star ranges so that no query
relies on results beyond GitHub's first 1,000. See `docs/github-api.md`.

## Incremental semantics

- `first_seen`: earliest time the record entered this registry.
- `last_seen`: latest run that observed or successfully condition-checked it.
- `fetched_at`: latest time a response body refreshed stored metadata.
- `checked_at`: latest attempted/conditional check.
- `provenance`: deduplicated discovery paths, not an asserted capability trail.
- Repository rename/transfer does not create a duplicate because numeric
  `github_repo_id` remains the key; `full_name` is mutable metadata.

## Scaling plan

1. **100–200 repos:** JSONL canonical registry + generated static JSON/site.
2. **200–2,000 repos:** authenticated query matrix, bounded hydration queue,
   scheduled refresh, and compact run snapshots.
3. **2,000+ repos:** managed Postgres, append-only discovery rows, a worker/cron
   outside the public request path, and a cached read-only search API.

Do not run broad GitHub crawling inside a user-facing Vercel request. It risks
timeouts, token exposure, rate-limit amplification, and an expensive thundering
herd. Crawl on a schedule, then publish a snapshot or query the database.

`build_site.py` uses an explicit public-field allowlist. It removes API/clone
URLs, candidate-resolution internals, full provenance references and local
filesystem paths from `site/data/registry.json`. It also applies a documented,
metadata-only education-signal gate to the public view. The canonical registry
remains high-recall; GitHub API verification is not an assertion that every
record should be featured on the education-facing website.

## Education Skills Library

The website's **Skills** switch is an education-oriented library, not a general
Skill Marketplace. Each visible card links back to the public GitHub repository
that contains the Skill and to its public `SKILL.md` manifest. The local
registry is deliberately broader for recall, while the public shelf applies a
transparent metadata gate for education, learning, research, teacher/student
workflow, or learning-to-build signals. This gate is not a pedagogical-quality
claim; future curator review and EduOS evaluation remain separate work.
