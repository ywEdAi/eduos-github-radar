# EduOS GitHub Radar web

The React/Next.js presentation layer for the independent `github-radar` registry.
It currently ships a safe, allowlisted snapshot under `data/registry.json`.

```bash
cd github-radar
python3 scripts/build_site.py
cd web
npm install
npm run sync:data
npm run dev
```

## Vercel deployment

Create a Vercel project with `github-radar/web` as its Root Directory. Add
`NEXT_PUBLIC_BUY_ME_A_COFFEE_URL` only after the creator page exists. The first
deployment needs no database and is a read-only public snapshot.

When a Neon database is approved, replace the server-side snapshot import in
`app/page.js` with a parameterized database query, then add the daily cron route.
Never expose `DATABASE_URL`, `GITHUB_TOKEN`, or `CRON_SECRET` to client code.
