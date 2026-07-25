"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { COPY, initialLocale } from "./i18n";

const SUBJECTS = [
  ["mathematics", "Mathematics", "数学", /math|algebra|geometry|calculus|arithmetic/i],
  ["language", "Language", "语言", /language|english|chinese|vocab|reading|writing/i],
  ["science", "Science", "科学", /science|physics|chemistry|biology|geography/i],
  ["computer-science", "Computer science", "计算机科学", /computer|coding|programming|code|cs\b/i],
  ["teacher-workflow", "Teacher workflow", "教师工作流", /teacher|teaching|lesson|classroom|grading|rubric/i],
  ["learning-systems", "Learning systems", "学习系统", /education|edtech|learning|lms|course|curriculum|school/i],
];

const KINDS = { repo: ["repo", "代码仓库"], dataset: ["dataset", "数据集"], benchmark: ["benchmark", "基准测试"], awesome_index: ["awesome index", "Awesome 索引"], unknown: ["unknown", "未知"] };

function text(value, fallback = "—") { return value === null || value === undefined || value === "" ? fallback : String(value); }
function compactNumber(value, locale) { return value === null || value === undefined ? "—" : new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(value); }
function displayDate(value, locale) { const isoDate = value ? String(value).slice(0, 10) : "—"; return locale === "zh" ? isoDate.replaceAll("-", "/") : isoDate; }
function repositoryText(record) { return [record.full_name, record.name, record.description, record.primary_language, ...(record.topics || []), ...Object.keys(record.languages || {})].filter(Boolean).join(" "); }
function subjectSignals(record, locale) { const haystack = repositoryText(record); return SUBJECTS.filter(([, , , expression]) => expression.test(haystack)).map(([id, en, zh]) => ({ id, label: locale === "zh" ? zh : en })); }
function subjectIds(record) { return subjectSignals(record, "en").map(({ id }) => id); }
function projectHue(record) { return [...(record.full_name || record.name || "radar")].reduce((total, character) => total + character.charCodeAt(0), 0) % 360; }

function safeHomepage(record) {
  try {
    const url = new URL(record.homepage || "");
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

function previewCandidates(record) {
  return [
    ...(record.homepage_screenshot_url ? [{ type: "website", url: record.homepage_screenshot_url }] : []),
    ...(record.full_name ? [{ type: "github", url: `https://opengraph.githubassets.com/1/${record.full_name}` }] : []),
  ];
}

function Thumbnail({ record, copy }) {
  const candidates = previewCandidates(record);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [record.github_repo_id, record.full_name]);
  const preview = candidates[index];
  return (
    <div className="thumbnail" style={{ "--hue": projectHue(record) }}>
      {preview ? <img src={preview.url} alt={`${preview.type === "website" ? copy.websitePreview : copy.githubPreview}: ${record.full_name || record.name}`} loading="lazy" onError={() => setIndex((current) => current + 1)} /> : null}
      {!preview ? <span className="thumbnail-fallback" aria-hidden="true">{(record.name || "?").slice(0, 1).toUpperCase()}</span> : null}
      {preview ? <span className="preview-source">{preview.type === "website" ? copy.websitePreview : copy.githubPreview}</span> : null}
      {record.archived ? <span className="archived-mark">{copy.archived}</span> : null}
    </div>
  );
}

function Pill({ children, variant = "default" }) { return <span className={`pill ${variant}`}>{children}</span>; }

function RepoCard({ record, copy, locale }) {
  const signals = subjectSignals(record, locale);
  const homepage = safeHomepage(record);
  const kindLabel = KINDS[record.entity_kind] || KINDS.unknown;
  return <article className="repo-card">
    <Thumbnail record={record} copy={copy} />
    <div className="repo-content">
      <div className="card-kicker"><Pill variant={`kind-${record.entity_kind}`}>{kindLabel[locale === "zh" ? 1 : 0]}</Pill>{record.lead_match_status === "probable" ? <Pill variant="probable">{copy.probable}</Pill> : null}</div>
      <h2>{record.html_url ? <a href={record.html_url} target="_blank" rel="noreferrer">{text(record.full_name, record.name)}</a> : text(record.name)}</h2>
      <p className="description">{text(record.description, copy.awaitingDescription)}</p>
      <dl className="quick-stats"><div><dt>{copy.stars}</dt><dd>{compactNumber(record.metrics?.stars, locale)}</dd></div><div><dt>{copy.language}</dt><dd>{text(record.primary_language)}</dd></div><div><dt>{copy.updated}</dt><dd>{displayDate(record.pushed_at, locale)}</dd></div></dl>
      <div className="signal-row">{signals.slice(0, 2).map((signal) => <Pill key={signal.id} variant="signal">{signal.label}</Pill>)}{(record.topics || []).slice(0, 2).map((topic) => <Pill key={topic} variant="topic">{topic}</Pill>)}</div>
      <div className="card-footer"><span>{record.verification_status === "verified" ? copy.verified : copy.awaiting}</span><div>{homepage ? <a href={homepage} target="_blank" rel="noreferrer">{copy.visitWebsite}</a> : null}{record.html_url ? <a href={`${record.html_url}#readme`} target="_blank" rel="noreferrer">{copy.readme}</a> : null}</div></div>
    </div>
  </article>;
}

function FilterBlock({ title, children }) { return <section className="filter-block"><h2>{title}</h2>{children}</section>; }

function SuggestionForm({ copy }) {
  const [repo, setRepo] = useState("");
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setStatus(""); setSubmitting(true);
    try {
      const response = await fetch("/api/suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ repository: repo, learningGoal: goal }) });
      const result = await response.json();
      if (!response.ok) { setStatus(result.code === "INVALID_REPOSITORY" ? "invalid" : result.code === "DATABASE_NOT_CONFIGURED" ? "unavailable" : "error"); return; }
      setRepo(""); setGoal(""); setStatus("sent");
    } catch { setStatus("error"); } finally { setSubmitting(false); }
  };
  const message = { sent: copy.submissionSent, invalid: copy.submissionInvalid, unavailable: copy.submissionUnavailable, error: copy.submissionError }[status];
  return <section className="suggestion-section" aria-labelledby="suggestion-heading"><div><p className="eyebrow">{copy.suggestEyebrow}</p><h2 id="suggestion-heading">{copy.suggestTitle}</h2><p>{copy.suggestCopy}</p></div><form onSubmit={submit}><label>{copy.repoLabel}<input required value={repo} onChange={(event) => setRepo(event.target.value)} placeholder={copy.repoPlaceholder} /></label><label>{copy.goalLabel}<small>{copy.goalPrivate}</small><textarea required value={goal} onChange={(event) => setGoal(event.target.value)} placeholder={copy.goalPlaceholder} rows="3" /></label><button className="coffee-button" disabled={submitting}>{copy.submitSignal}</button>{message ? <p className={`form-status ${status}`}>{message}</p> : null}</form></section>;
}

export default function RadarClient({ payload, supportUrl }) {
  const [locale, setLocale] = useState("en"); const [query, setQuery] = useState(""); const [kind, setKind] = useState(""); const [language, setLanguage] = useState(""); const [subject, setSubject] = useState(""); const [sort, setSort] = useState("stars"); const [showOnlyActive, setShowOnlyActive] = useState(false);
  useEffect(() => { const saved = initialLocale(); setLocale(saved); document.documentElement.lang = saved === "zh" ? "zh-CN" : "en"; }, []);
  const switchLocale = (next) => { setLocale(next); window.localStorage.setItem("radar-locale", next); document.documentElement.lang = next === "zh" ? "zh-CN" : "en"; };
  const copy = COPY[locale]; const records = payload.records || [];
  const languages = useMemo(() => [...new Set(records.map((record) => record.primary_language).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [records]);
  const verified = payload.counts?.verification_status?.verified || 0;
  const subjectCounts = useMemo(() => { const counts = Object.fromEntries(SUBJECTS.map(([id]) => [id, 0])); records.forEach((record) => subjectIds(record).forEach((id) => { counts[id] += 1; })); return counts; }, [records]);
  const filtered = useMemo(() => records.filter((record) => !query.trim() || repositoryText(record).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).filter((record) => !kind || record.entity_kind === kind).filter((record) => !language || record.primary_language === language).filter((record) => !subject || subjectIds(record).includes(subject)).filter((record) => !showOnlyActive || (!record.archived && record.pushed_at && Date.parse(record.pushed_at) > Date.now() - 63072000000)).sort((left, right) => sort === "stars" ? (right.metrics?.stars || 0) - (left.metrics?.stars || 0) : sort === "github-updated" ? Date.parse(right.pushed_at || 0) - Date.parse(left.pushed_at || 0) : sort === "synced" ? Date.parse(right.fetched_at || 0) - Date.parse(left.fetched_at || 0) : Date.parse(right.first_seen || 0) - Date.parse(left.first_seen || 0)), [records, query, kind, language, subject, showOnlyActive, sort]);
  const clearFilters = () => { setQuery(""); setKind(""); setLanguage(""); setSubject(""); setShowOnlyActive(false); setSort("stars"); };
  const kindChoices = [["", copy.allProjects], ["repo", copy.repositories], ["dataset", copy.datasets], ["benchmark", copy.benchmarks], ["awesome_index", copy.awesomeLists]];
  return <main className="radar-shell"><header className="topbar"><Link href="/" className="brand"><span>EDU</span>OS <i>Radar</i></Link><div className="topbar-actions"><span className="live-badge"><b /> {copy.snapshotLive}</span><div className="language-switch" aria-label={copy.languageLabel}><button className={locale === "en" ? "active" : ""} onClick={() => switchLocale("en")}>{copy.languageEnglish}</button><button className={locale === "zh" ? "active" : ""} onClick={() => switchLocale("zh")}>{copy.languageChinese}</button></div>{supportUrl ? <a className="coffee-button" href={supportUrl} target="_blank" rel="noreferrer">{copy.buyCoffee}</a> : <Link className="coffee-button" href="/support">{copy.supportRadar}</Link>}</div></header>
    <section className="hero-grid"><div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.heroTitleStart}<br /><em>{copy.heroTitleEmphasis}</em><br />{copy.heroTitleEnd}</h1><p className="hero-copy">{copy.heroCopy}</p></div><div className="hero-note"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit orbit-three" /><p>{copy.freshSignals}</p><strong>{payload.count}</strong><span>{copy.projectsSnapshot}</span><small>{locale === "zh" ? `${verified}${copy.metadataOnly}` : `${verified} ${copy.metadataOnly}`}</small></div></section>
    <SuggestionForm copy={copy} />
    <section className="explorer"><aside className="sidebar"><div className="sidebar-title"><span>{copy.explore}</span><button onClick={clearFilters}>{copy.reset}</button></div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} /></label><FilterBlock title={copy.sortBy}><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="added">{copy.sortAdded}</option><option value="github-updated">{copy.sortGithubUpdated}</option><option value="synced">{copy.sortSynced}</option><option value="stars">{copy.sortStars}</option></select></FilterBlock><FilterBlock title={copy.projectShape}><div className="choice-grid">{kindChoices.map(([value, label]) => <button key={value || "all"} className={kind === value ? "selected" : ""} onClick={() => setKind(value)}>{label}</button>)}</div></FilterBlock><FilterBlock title={copy.subjectSignals}><p className="filter-caption">{copy.automaticMetadata}</p><div className="choice-grid subject-grid">{SUBJECTS.map(([id, en, zh]) => <button key={id} className={subject === id ? "selected" : ""} onClick={() => setSubject(subject === id ? "" : id)}><span>{locale === "zh" ? zh : en}</span><b>{subjectCounts[id]}</b></button>)}</div></FilterBlock><FilterBlock title={copy.primaryLanguage}><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="">{copy.allLanguages}</option>{languages.map((item) => <option key={item} value={item}>{item}</option>)}</select></FilterBlock><label className="toggle-row"><input type="checkbox" checked={showOnlyActive} onChange={(event) => setShowOnlyActive(event.target.checked)} /><span>{copy.activeTwoYears}</span></label></aside><section className="results" aria-live="polite"><div className="results-head"><div><p className="eyebrow">{copy.radarIndex}</p><h2>{filtered.length} {copy.projectsInView}</h2></div><p>{copy.resultsHint}</p></div><div className="repo-grid">{filtered.map((record) => <RepoCard record={record} copy={copy} locale={locale} key={record.github_repo_id || record.name} />)}</div>{filtered.length === 0 ? <div className="empty-state"><span>⌕</span><h2>{copy.noMatches}</h2><button onClick={clearFilters}>{copy.resetFilters}</button></div> : null}</section></section><footer><span>EduOS GitHub Radar</span><span>{copy.footerMetadata} {payload.generated_at?.slice(0, 10)}</span><Link href="/support">{copy.footerSupport}</Link></footer></main>;
}
