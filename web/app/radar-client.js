"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const SUBJECTS = [
  ["mathematics", "Mathematics", /math|algebra|geometry|calculus|arithmetic/i],
  ["language", "Language", /language|english|chinese|vocab|reading|writing/i],
  ["science", "Science", /science|physics|chemistry|biology|geography/i],
  ["computer-science", "Computer science", /computer|coding|programming|code|cs\b/i],
  ["teacher-workflow", "Teacher workflow", /teacher|teaching|lesson|classroom|grading|rubric/i],
  ["learning-systems", "Learning systems", /education|edtech|learning|lms|course|curriculum|school/i],
];

function text(value, fallback = "—") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function compactNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function repositoryText(record) {
  return [
    record.full_name,
    record.name,
    record.description,
    record.primary_language,
    ...(record.topics || []),
    ...Object.keys(record.languages || {}),
  ]
    .filter(Boolean)
    .join(" ");
}

function subjectSignals(record) {
  const haystack = repositoryText(record);
  return SUBJECTS.filter(([, , expression]) => expression.test(haystack)).map(([id, label]) => ({ id, label }));
}

function thumbnailUrl(record) {
  return record.full_name ? `https://opengraph.githubassets.com/1/${record.full_name}` : "";
}

function projectHue(record) {
  const source = record.full_name || record.name || "radar";
  return [...source].reduce((total, character) => total + character.charCodeAt(0), 0) % 360;
}

function Thumbnail({ record }) {
  const [failed, setFailed] = useState(false);
  const hue = projectHue(record);
  return (
    <div className="thumbnail" style={{ "--hue": hue }}>
      {!failed && thumbnailUrl(record) ? (
        <img src={thumbnailUrl(record)} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : null}
      <span className="thumbnail-fallback" aria-hidden={failed ? false : true}>
        {(record.name || "?").slice(0, 1).toUpperCase()}
      </span>
      {record.archived ? <span className="archived-mark">Archived</span> : null}
    </div>
  );
}

function Pill({ children, variant = "default" }) {
  return <span className={`pill ${variant}`}>{children}</span>;
}

function RepoCard({ record }) {
  const signals = subjectSignals(record);
  return (
    <article className="repo-card">
      <Thumbnail record={record} />
      <div className="repo-content">
        <div className="card-kicker">
          <Pill variant={`kind-${record.entity_kind}`}>{record.entity_kind.replace("_", " ")}</Pill>
          {record.lead_match_status === "probable" ? <Pill variant="probable">probable lead</Pill> : null}
        </div>
        <h2>
          {record.html_url ? (
            <a href={record.html_url} target="_blank" rel="noreferrer">{text(record.full_name, record.name)}</a>
          ) : text(record.name)}
        </h2>
        <p className="description">{text(record.description, "Metadata is awaiting its first GitHub verification.")}</p>
        <dl className="quick-stats">
          <div><dt>Stars</dt><dd>{compactNumber(record.metrics?.stars)}</dd></div>
          <div><dt>Language</dt><dd>{text(record.primary_language)}</dd></div>
          <div><dt>Updated</dt><dd>{record.pushed_at ? record.pushed_at.slice(0, 10) : "—"}</dd></div>
        </dl>
        <div className="signal-row">
          {signals.slice(0, 2).map((signal) => <Pill key={signal.id} variant="signal">{signal.label}</Pill>)}
          {(record.topics || []).slice(0, 2).map((topic) => <Pill key={topic} variant="topic">{topic}</Pill>)}
        </div>
        <div className="card-footer">
          <span>{record.verification_status === "verified" ? "GitHub metadata verified" : "Awaiting verification"}</span>
          {record.html_url ? <a href={`${record.html_url}#readme`} target="_blank" rel="noreferrer">Read README ↗</a> : null}
        </div>
      </div>
    </article>
  );
}

function FilterBlock({ title, children }) {
  return <section className="filter-block"><h2>{title}</h2>{children}</section>;
}

export default function RadarClient({ payload, supportUrl }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [language, setLanguage] = useState("");
  const [subject, setSubject] = useState("");
  const [sort, setSort] = useState("added");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const records = payload.records || [];

  const languages = useMemo(
    () => [...new Set(records.map((record) => record.primary_language).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [records]
  );
  const verified = payload.counts?.verification_status?.verified || 0;
  const subjectCounts = useMemo(() => {
    const counts = Object.fromEntries(SUBJECTS.map(([id]) => [id, 0]));
    records.forEach((record) => subjectSignals(record).forEach(({ id }) => { counts[id] += 1; }));
    return counts;
  }, [records]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return records
      .filter((record) => !normalized || repositoryText(record).toLocaleLowerCase().includes(normalized))
      .filter((record) => !kind || record.entity_kind === kind)
      .filter((record) => !language || record.primary_language === language)
      .filter((record) => !subject || subjectSignals(record).some((item) => item.id === subject))
      .filter((record) => !showOnlyActive || (!record.archived && record.pushed_at && Date.parse(record.pushed_at) > Date.now() - 1000 * 60 * 60 * 24 * 365 * 2))
      .sort((left, right) => {
        if (sort === "stars") return (right.metrics?.stars || 0) - (left.metrics?.stars || 0);
        if (sort === "github-updated") return Date.parse(right.pushed_at || 0) - Date.parse(left.pushed_at || 0);
        if (sort === "synced") return Date.parse(right.fetched_at || 0) - Date.parse(left.fetched_at || 0);
        return Date.parse(right.first_seen || 0) - Date.parse(left.first_seen || 0);
      });
  }, [records, query, kind, language, subject, showOnlyActive, sort]);

  const clearFilters = () => {
    setQuery(""); setKind(""); setLanguage(""); setSubject(""); setShowOnlyActive(false); setSort("added");
  };

  return (
    <main className="radar-shell">
      <header className="topbar">
        <Link href="/" className="brand"><span>EDU</span>OS <i>Radar</i></Link>
        <div className="topbar-actions">
          <span className="live-badge"><b /> Snapshot live</span>
          {supportUrl ? (
            <a className="coffee-button" href={supportUrl} target="_blank" rel="noreferrer">Buy me a coffee ↗</a>
          ) : (
            <Link className="coffee-button" href="/support">Support the Radar</Link>
          )}
        </div>
      </header>

      <section className="hero-grid">
        <div>
          <p className="eyebrow">OPEN-SOURCE EDUCATION INTELLIGENCE</p>
          <h1>Find the<br /><em>learning tools</em><br />worth watching.</h1>
          <p className="hero-copy">A living field guide to education-native projects, teaching workflows, learning infrastructure, datasets, and benchmarks on GitHub.</p>
        </div>
        <div className="hero-note">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit orbit-three" />
          <p>FRESH SIGNALS</p><strong>{payload.count}</strong><span>projects in this snapshot</span>
          <small>{verified} GitHub-verified · metadata only</small>
        </div>
      </section>

      <section className="explorer">
        <aside className="sidebar">
          <div className="sidebar-title"><span>Explore</span><button onClick={clearFilters}>Reset</button></div>
          <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, topics…" /></label>
          <FilterBlock title="Sort by">
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="added">Recently added to Radar</option>
              <option value="github-updated">GitHub recently updated</option>
              <option value="synced">Last metadata sync</option>
              <option value="stars">Most starred</option>
            </select>
          </FilterBlock>
          <FilterBlock title="Project shape">
            <div className="choice-grid">
              {[["", "All projects"], ["repo", "Repositories"], ["dataset", "Datasets"], ["benchmark", "Benchmarks"], ["awesome_index", "Awesome lists"]].map(([value, label]) => (
                <button key={value || "all"} className={kind === value ? "selected" : ""} onClick={() => setKind(value)}>{label}</button>
              ))}
            </div>
          </FilterBlock>
          <FilterBlock title="Subject signals"><p className="filter-caption">Automatic, metadata-based</p>
            <div className="choice-grid subject-grid">
              {SUBJECTS.map(([id, label]) => <button key={id} className={subject === id ? "selected" : ""} onClick={() => setSubject(subject === id ? "" : id)}><span>{label}</span><b>{subjectCounts[id]}</b></button>)}
            </div>
          </FilterBlock>
          <FilterBlock title="Primary language">
            <select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="">All languages</option>{languages.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          </FilterBlock>
          <label className="toggle-row"><input type="checkbox" checked={showOnlyActive} onChange={(event) => setShowOnlyActive(event.target.checked)} /><span>Actively pushed in 2 years</span></label>
        </aside>

        <section className="results" aria-live="polite">
          <div className="results-head"><div><p className="eyebrow">RADAR INDEX</p><h2>{filtered.length} projects in view</h2></div><p>Sort, filter, then follow the README trail.</p></div>
          <div className="repo-grid">{filtered.map((record) => <RepoCard record={record} key={record.github_repo_id || record.name} />)}</div>
          {filtered.length === 0 ? <div className="empty-state"><span>⌕</span><h2>No projects match that signal.</h2><button onClick={clearFilters}>Reset filters</button></div> : null}
        </section>
      </section>

      <footer><span>EduOS GitHub Radar</span><span>Metadata-first · No bulk source cloning · {payload.generated_at?.slice(0, 10)}</span><Link href="/support">Support updates →</Link></footer>
    </main>
  );
}
