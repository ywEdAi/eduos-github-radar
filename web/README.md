# EduOS GitHub Radar web

The React/Next.js presentation layer for the independent `github-radar` registry.
It currently ships safe, allowlisted snapshots under `data/registry.json` and
`data/skills.json`.

```bash
cd github-radar
python3 scripts/build_site.py
python3 scripts/build_skills_site.py
cd web
npm install
npm run sync:data
npm run dev
```

## Education Skills Library

The header switches between GitHub projects and an education-oriented Skills
library. Every Skill card links to its public GitHub source repository and
public `SKILL.md` manifest. The UI does not install, execute, or serve a skill
package; it displays only generated manifest metadata.

## Vercel deployment

Create a Vercel project with `web` as its Root Directory. Add
`NEXT_PUBLIC_BUY_ME_A_COFFEE_URL` only after the creator page exists. The first
deployment needs no database and is a read-only public snapshot.

## Curated project suggestions

The home page includes a bilingual suggestion form. It accepts a GitHub
`owner/repository` name or GitHub URL and a private learning goal. Run
`../migrations/002_project_suggestions.sql` after `001_init.sql`, then set the
server-only `DATABASE_URL` in Vercel. The form never exposes a public read route:
the learning goal remains curator-only and a suggested repository is not shown
until GitHub metadata verification.

Never expose `DATABASE_URL`, `GITHUB_TOKEN`, or `CRON_SECRET` to client code.
