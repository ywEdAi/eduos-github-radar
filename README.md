<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="EduOS Radar: a human-readable directory of open-source education projects, skills, data and benchmarks.">
</p>

<p align="center">
  <a href="https://edu-ai-builders-site.vercel.app/directory">Open in Edu AI Builders</a>
  · <a href="#what-you-can-browse">Browse the collections</a>
  · <a href="#run-a-refresh">Run a refresh</a>
  · <a href="#trust-boundary">Read the boundary</a>
</p>

# EduOS Radar

**A bilingual, human-readable directory of public education technology.** It
helps educators, builders and researchers decide what is worth opening, saving,
adapting or studying before they invest time in a repository.

The public site is a read-only view of a compact metadata registry. It is not a
code host, a package installer, a model evaluation, or a recommendation that a
project is safe or pedagogically effective.

## Where Radar lives

- This repository is the source of truth for collection code, canonical
  registries, generated public snapshots, and the standalone Radar frontend.
- The primary visitor entry point is the
  [Edu AI Builders directory](https://edu-ai-builders-site.vercel.app/directory),
  which embeds the standalone deployment rather than maintaining a second copy
  of the registry.
- The independently deployed Radar service is mounted behind the Builder Site's
  `/directory` path as a Next.js multi-zone. It is an implementation boundary,
  not a second visitor-facing domain. Updating this repository's generated
  snapshots updates the unified directory after deployment.

## What you can browse

Radar is moving toward three peer collections. **GitHub is a source, not the
top-level product category.**

| Collection | What it is for | Current source boundary |
| --- | --- | --- |
| **Apps & systems** | Open-source education projects, tools and complete systems to inspect or adapt. | Public GitHub repository metadata. Existing `repo` records are a high-recall discovery set, not a claim that every record is a polished application. |
| **Skills** | Public `SKILL.md` manifests for inspecting a workflow before installing or adapting it. | Public repository metadata, Git tree paths and manifest frontmatter only. |
| **Data & benchmarks** | Datasets, question/exam sets, learning traces and evaluation benchmarks. | A dedicated metadata view today; it can later include non-GitHub sources without changing the public taxonomy. |

<p align="center">
  <img src="./assets/readme/registry-flow.svg" width="100%" alt="Radar flow: public leads become a verified metadata registry, then a searchable read-only directory.">
</p>

### What the website shows

- search, subject, language, activity and project-shape filters;
- English / Chinese interface switching;
- repository description, source link, homepage, license, stars, last push and
  declared metadata;
- a separate Skills shelf with source-repository and public-manifest links;
- an optional project-suggestion form. Private learning goals never enter the
  public catalog.

Open the directory through **[Edu AI Builders](https://edu-ai-builders-site.vercel.app/directory)**.

## Trust boundary

| Radar does | Radar deliberately does not do |
| --- | --- |
| Collect public repository metadata, stable GitHub IDs, provenance, timestamps, declared topics, languages, licenses and release state. | Clone repositories, store source trees, execute Skills, install packages, or perform deep code analysis. |
| Deduplicate GitHub repositories by numeric repository ID; keep `first_seen`, `last_seen`, `fetched_at` and source provenance. | Treat GitHub verification as an endorsement, a quality score, a security review or evidence of pedagogical alignment. |
| Publish a field-allowlisted snapshot and keep the larger discovery registry local. | Write to EduOS substrate nodes, `SCHEMA.md`, `VOCABULARY.md`, papers, products, reviews or merged graphs. |

`dataset`, `benchmark`, `awesome_index` and `repo` are lightweight discovery
shapes inferred from public metadata or an explicit lead. They are not a deep
capability classification.

## Repository map

```text
config/       exact leads and bounded English/Chinese discovery matrices
scripts/      dependency-free metadata collectors, validators and snapshot builders
data/         canonical JSONL registries and compact run snapshots
schema/       independent Radar registry contracts
site/         dependency-free static reader and generated public snapshot
web/          Next.js / React public directory (the Vercel deployment root)
docs/         GitHub API, deployment and Skills-roadmap decisions
migrations/   optional future Postgres schemas
```

The collector and website are intentionally separate: collection writes the
registry; presentation reads only the generated public snapshot.

## Run a refresh

### Current workspace entry point (2026-10-10)

This folder is currently a source/data snapshot without its own `.git`; its
external repository lifecycle remains separate. Run collection here; do not
commit the nested directory into the workspace wrapper or assume a data refresh
publishes the deployed service.

```bash
cd /Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/radar
python3 scripts/update_directory.py --refresh-limit 30 --discover
python3 scripts/update_directory.py --collect-builder-skills
python3 scripts/update_directory.py --offline
python3 scripts/query_resources.py --tag evaluation --license-observed
python3 scripts/query_resources.py 科学 --kind dataset
python3 scripts/query_resources.py tutor --all
python3 scripts/test_directory.py
python3 scripts/build_builder_index.py 科学 --limit 5
python3 scripts/test_builder_discovery.py
```

The new entry point refreshes exact curated sources, optionally rotates the
oldest checked records and runs one bounded discovery query, validates canonical
registries, builds staged public snapshots and syncs their data into `web/data`.
It uses an existing `GH_TOKEN`/`GITHUB_TOKEN` or the signed-in GitHub CLI token
without displaying or persisting credentials. Run it sequentially; its local
`flock` prevents concurrent runs through this entry point (macOS/Linux). Direct
legacy crawler invocations do not acquire that lock.

`--collect-builder-skills` adds bounded public-resource discovery through
`config/builder-discovery.json`: 18 keyword families, 54 rotating queries, at
most 8 queries, 24 manifest attempts and 100 additional GitHub API requests per
run. It saves frontmatter and source metadata only. The generated
`builder-index.json` unifies public repository, skill, dataset and benchmark
records; facet hints are inferred discovery signals, not capability evidence.
The search CLI provides an offline keyword/synonym baseline. The existing Monday
automation now includes this flag. For the maintenance subscription proposal,
three pilot scenarios, repo adaptation and workload-based skill fusion, see
[the current MVP scope](../../docs/education-builder-mvp-2026-10-10.md).

`data/education-resources.json` is the course-readable resource contract, with
copies in `site/data` and `web/data`. The JSON Schema is
`schema/course-resources.schema.json`. Its 11 initial curator-selected resources
include source/commit URLs, activity, scoped license observations, education
scenarios, tags, original reuse recipes and runtime conditions. The full
discovery registry remains broader and less reviewed. `--license-observed`
filters successful curated observations; it is not unconditional permission or
a runtime test. Unknown/unrecognized licenses remain `needs-review`.

`data/update-history.jsonl`, per-run before/after snapshots and
`resource-changes.json` retain refresh and change history. Failed requests keep
previous evidence and its original verification timestamp. Changed license text
stays unverified until a curator reviews it and adds `reviewed_sha256` to the
corresponding scope in `config/education-resources.json`. No source packages,
Skill bodies, or dataset payloads are saved by this entry point.

The existing **Weekly GitHub Radar refresh** automation was updated, rather than
duplicated: Monday 09:00 in the user's local schedule, current project/path,
local execution and failure-only notifications retained. This requires the Mac
powered on, the desktop app running, the project present, Python 3.10+ and GitHub
network access. It does not push/deploy; no cloud scheduler or database was
enabled. See the workspace report
[`directory.md`](../../docs/website-refresh-2026-10-10/directory.md).

### Legacy collector commands

Python 3.10+ is sufficient for collection and validation; the Python tools have
no third-party dependencies. Use a read-only GitHub token for larger runs, but
never commit it.

```bash
cd github-radar

# Validate code and configuration without network access.
python3 -m py_compile scripts/crawl.py scripts/build_site.py scripts/validate.py
python3 -m json.tool config/seeds.json >/dev/null
python3 -m json.tool config/query-matrix.json >/dev/null
python3 scripts/validate.py --report reports/data-quality-$(date -u +%F).md

# Resolve a small exact/named lead batch. No clone occurs.
python3 scripts/crawl.py seed --limit 5

# Run a bounded discovery family, then hydrate only a small priority queue.
GH_TOKEN="$(gh auth token)" python3 scripts/crawl.py discover \
  --family dataset-benchmark \
  --pages 1 \
  --per-page 50 \
  --sort updated \
  --hydrate-limit 10

# Build the allowlisted public data snapshot.
python3 scripts/build_site.py
```

For controlled incremental work, use:

```bash
# Conditional refresh through saved ETags.
python3 scripts/crawl.py refresh --limit 50

# Fill languages and latest-release metadata later, prioritising leads.
python3 scripts/crawl.py hydrate --lead-only --limit 20

# Verify exact owner/repo names extracted from an approved awesome index.
python3 scripts/crawl.py expand --lead-file config/awesome-leads.txt
```

See [GitHub API notes](./docs/github-api.md) for pagination, search ceilings,
ETags, rate limits and backoff. Broad crawling must stay out of public page
requests.

## Build the public site

The production site is an open-source **Next.js** application deployed from
`web/`. Using Vercel does not make the project less open source: GitHub is the
collaboration and source-of-truth home; Vercel supplies the public runtime,
serverless suggestion endpoint and a future path for scheduled refreshes.

```bash
cd github-radar/web
npm install
npm run sync:data
npm run dev
npm run build
```

For Vercel, set the project **Root Directory** to `web`. The first launch reads
the generated snapshot and needs no browser-visible GitHub token or database.
The optional `POST /api/suggestions` route needs `DATABASE_URL` only when a
managed Postgres database is intentionally enabled.

## Scale without changing the public contract

1. **100–2,000 records** — JSONL canonical registry, bounded API runs and a
   generated static snapshot.
2. **2,000+ records** — managed Postgres, append-only discovery rows, scheduled
   collection outside public requests, and a cached read-only query API.
3. **Semantic / intent-first discovery** — add human-reviewed descriptors first;
   use embeddings for recall only, while source URLs and metadata remain
   authoritative.

The current managed-database, backup, cache, search and safety route is in
[docs/deployment.md](./docs/deployment.md). The Skills collection's scope and
future EduOS handoff are in [docs/skills-roadmap.md](./docs/skills-roadmap.md).

## Before contributing a lead

Please provide an exact public repository URL whenever possible. A named lead
is first recorded as `unverified`; an API match can still remain `probable` when
the name is ambiguous. Keep any claim about learning impact, safety or quality
out of the lead itself unless a curator later records evidence for it.

## License and attribution

This repository keeps collection artifacts, generated snapshots and website
code together so that the public directory can be inspected, reproduced and
improved in the open. Refer to each listed project's own license and source
before reuse; Radar records observed license metadata but does not grant rights
on a project's behalf.

### 2026-10-10 trial entries and paper prototype

`data/builder-resources.json` (`radar.builder-resources.v1`) contains 13 curated entries, 2 observed official hosted trial pages (OpenMAIC public preview, RAGFlow account required). `primary_action.kind` distinguishes demo, setup, course, data and Skill reading. Availability checks do not establish generation quality; local commands are untested. `web/app` renders a bilingual curated shelf with steps, requirements and source links.

`data/discovery-feed.json` (`radar.discovery-feed.v1`) projects 81 records into common resource_id/kind/title/source_url/verified_at/tags/description/primary_action fields. Detailed builder and paper collections remain separate. Source URLs are never inferred to be demos. Public exports contain no user preferences or recommendation state. Run `python3 scripts/build_discovery_feed.py` after fetching papers; directory exports also rebuild this feed.

For the actual upstream arXiv comparison, pinned MIT implementation and reproducible commands, see [docs/arxiv-recommendations.md](docs/arxiv-recommendations.md). The sample contains 68 metadata records and 5 local recommendations. Frequency and unsubscribe are local preview controls; there is no signup endpoint, delivery service or daily sending automation. Existing weekly GitHub refresh remains unchanged in frequency and does not run the paper fetcher. arXiv requests are serialized and throttled to at least 3.1 seconds apart; the lock now covers snapshot read/write as well as requests.

Verification: 11 directory tests, 7 paper tests and `npm run build` passed.
