"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { COPY, initialLocale } from "./i18n";

const SUBJECTS = [
  ["mathematics", "math", "Mathematics", "数学", /math|algebra|geometry|calculus|arithmetic/i],
  ["language", "lang", "Language", "语言", /language|english|chinese|vocab|reading|writing/i],
  ["science", "sci", "Science", "科学", /science|physics|chemistry|biology|geography/i],
  ["computer-science", "cs", "Computer science", "计算机科学", /computer|coding|programming|code|cs\b/i],
  ["teacher-workflow", "teach", "Teacher workflow", "教师工作流", /teacher|teaching|lesson|classroom|grading|rubric/i],
  ["learning-systems", "learn", "Learning systems", "学习系统", /education|edtech|learning|lms|course|curriculum|school/i],
];

const GUIDE = {
  en: {
    snapshot: "Open-source education intelligence",
    thesis: "A human-readable index of education-native projects on GitHub.",
    thesisMore: "Search the evidence before you decide what is worth opening, saving, or adapting.",
    directoryTitle: "Start with the work you are trying to do.",
    directoryCopy: "A project does not need a polished homepage to be useful. This directory keeps the essential public signals together: what it says it is, where it lives, how it is maintained, and what you may reuse.",
    browseIndex: "Browse the index",
    submitProject: "Submit a project",
    projects: "projects indexed",
    liveDemos: "with a declared website",
    verified: "metadata verified",
    subjectIndex: "Browse by subject",
    directoryNote: "Subjects are lightweight discovery cues based on public repository metadata, not a judgment about pedagogical quality.",
    search: "Search projects, topics, or languages…",
    showMe: "Availability",
    everything: "Everything",
    live: "Has a website",
    picks: "Gold seeds",
    projectShape: "Project shape",
    subject: "Subject",
    language: "Primary language",
    index: "Project index",
    inView: "projects in view",
    resultsHint: "Each row uses repository metadata only. Read the source before adopting or cloning anything.",
    noResults: "No projects fit that combination.",
    clear: "Clear filters",
    drop: "Reset filters",
    github: "GitHub",
    skills: "Skills",
    skillsTitle: "Public skills, kept readable.",
    skillsBody: "A source-attributed index of public skill manifests for people who want to inspect a workflow before installing or adapting it.",
    skillIndex: "Skills index",
    skillsInView: "skills in view",
    skillsSearch: "Search skills, workflows, or ecosystems…",
    skillSource: "Source repository",
    support: "Support the Radar",
    sync: "snapshot",
    privateNotice: "Your learning goal stays private. A repository is published only after metadata verification.",
    curatorNote: "GitHub metadata verified",
    source: "Source",
    latestPush: "Last push",
    licence: "Licence",
    projectType: "Type",
    readme: "README ↗",
    openGithub: "Open GitHub ↗",
    repository: "Repository",
    dataset: "Dataset",
    benchmark: "Benchmark",
    awesomeIndex: "Awesome index",
    skill: "Skill",
  },
  zh: {
    snapshot: "开源教育项目雷达",
    thesis: "一个以教学与学习为视角整理的 GitHub 教育项目索引。",
    thesisMore: "在决定打开、收藏或改造之前，先从公开信息快速判断它是否值得继续看。",
    directoryTitle: "先从你真正要解决的教学与学习问题开始。",
    directoryCopy: "一个项目不一定有漂亮的官网，才值得了解。这里把最关键的公开线索放在一起：它自称在做什么、项目在哪里、最近是否仍在维护，以及许可证允许你怎样使用。",
    browseIndex: "浏览项目索引",
    submitProject: "推荐一个项目",
    projects: "个项目已收录",
    liveDemos: "个提供公开主页",
    verified: "元数据已核验",
    subjectIndex: "按学科浏览",
    directoryNote: "学科标签来自公开仓库元数据，只用于帮助发现项目，并不代表对教学价值的判断。",
    search: "搜索项目、主题或编程语言……",
    showMe: "可用信息",
    everything: "全部项目",
    live: "有公开主页",
    picks: "重点线索",
    projectShape: "项目类型",
    subject: "学科",
    language: "主要语言",
    index: "项目索引",
    inView: "个项目正在显示",
    resultsHint: "每一行只使用仓库公开元数据。采用或 clone 前，请先阅读来源项目。",
    noResults: "没有项目符合这组条件。",
    clear: "清除筛选",
    drop: "重置筛选",
    github: "GitHub",
    skills: "Skills",
    skillsTitle: "把公开 Skill 先读明白。",
    skillsBody: "一个标注来源的公开 Skill manifest 索引，帮助你在安装或改造工作流之前，先理解它的用途与来源。",
    skillIndex: "Skills 索引",
    skillsInView: "个 Skill 正在显示",
    skillsSearch: "搜索 Skill、工作流或生态……",
    skillSource: "来源仓库",
    support: "支持 Radar",
    sync: "数据快照",
    privateNotice: "你的学习目标始终保持私密。项目通过元数据核验后才会公开显示。",
    curatorNote: "GitHub 元数据已核验",
    source: "来源",
    latestPush: "最近推送",
    licence: "许可证",
    projectType: "类型",
    readme: "查看 README ↗",
    openGithub: "打开 GitHub ↗",
    repository: "代码仓库",
    dataset: "数据集",
    benchmark: "基准测试",
    awesomeIndex: "Awesome 索引",
    skill: "Skill",
  },
};

function text(value, fallback = "—") { return value === null || value === undefined || value === "" ? fallback : String(value); }
function compactNumber(value, locale) { return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0); }
function displayDate(value) { return value ? String(value).slice(0, 10) : "—"; }
function repositoryText(record) { return [record.full_name, record.name, record.description, record.primary_language, ...(record.topics || []), ...Object.keys(record.languages || {})].filter(Boolean).join(" "); }
function skillText(record) { return [record.skill_name, record.description, record.source_repository?.full_name, ...(record.ecosystems || []), record.skill_path].filter(Boolean).join(" "); }
function matchedSubjects(record) { const haystack = repositoryText(record); return SUBJECTS.filter(([, , , , expression]) => expression.test(haystack)); }
function primarySubject(record) { return matchedSubjects(record)[0] || SUBJECTS.find(([id]) => id === "learning-systems"); }
function safeHomepage(record) { try { const url = new URL(record.homepage || ""); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : ""; } catch { return ""; } }
function ownerName(record) { return record.owner?.login || String(record.full_name || "").split("/")[0] || "GitHub"; }
function kindLabel(kind, copy) { return { repo: copy.repository, dataset: copy.dataset, benchmark: copy.benchmark, awesome_index: copy.awesomeIndex }[kind] || copy.repository; }

function SubjectMark({ record, locale }) {
  const subjects = matchedSubjects(record); const [, tax, en, zh] = primarySubject(record);
  return <div className="subject-line"><span className={`subject-dot t-${tax}`} aria-hidden="true" />{locale === "zh" ? zh : en}{subjects[1] ? <span>· {locale === "zh" ? subjects[1][3] : subjects[1][2]}</span> : null}</div>;
}

function ProjectRow({ record, copy, locale }) {
  const homepage = safeHomepage(record);
  return <article className="project-row">
    <div className="project-main">
      <p className="project-kicker"><span>{kindLabel(record.entity_kind, copy)}</span><span>{record.verification_status === "verified" ? copy.verified : copy.awaiting}</span></p>
      <p className="project-owner">{ownerName(record)} /</p>
      <h3><a href={record.html_url} target="_blank" rel="noreferrer">{record.name || record.full_name}</a></h3>
      <p className="project-description">{text(record.description, locale === "zh" ? "等待下一次 GitHub 元数据核验。" : "Awaiting the next GitHub metadata verification.")}</p>
      <SubjectMark record={record} locale={locale} />
    </div>
    <dl className="project-facts">
      <div><dt>{copy.stars}</dt><dd>{compactNumber(record.metrics?.stars, locale)}</dd></div>
      <div><dt>{copy.latestPush}</dt><dd>{displayDate(record.pushed_at)}</dd></div>
      <div><dt>{copy.language}</dt><dd>{text(record.primary_language)}</dd></div>
      <div><dt>{copy.licence}</dt><dd>{text(record.license_spdx)}</dd></div>
    </dl>
    <div className="project-actions">
      {homepage ? <a href={homepage} target="_blank" rel="noreferrer">{copy.visitWebsite}</a> : null}
      <a href={record.html_url} target="_blank" rel="noreferrer">{copy.openGithub}</a>
      <a href={`${record.html_url}#readme`} target="_blank" rel="noreferrer">{copy.readme}</a>
    </div>
  </article>;
}

function SkillRow({ record, copy, locale }) {
  const source = record.source_repository || {};
  return <article className="project-row skill-row">
    <div className="project-main">
      <p className="project-kicker"><span>{copy.skill}</span><span>{copy.source}</span></p>
      <p className="project-owner">{source.full_name || copy.skillSource} /</p>
      <h3><a href={record.manifest_url} target="_blank" rel="noreferrer">{record.skill_name}</a></h3>
      <p className="project-description">{text(record.description, copy.skillDescriptionUnavailable)}</p>
      <div className="subject-line"><span className="subject-dot t-learn" aria-hidden="true" />{(record.ecosystems || []).slice(0, 2).join(" · ") || copy.sourceManifest}</div>
    </div>
    <dl className="project-facts">
      <div><dt>{copy.sourceStars}</dt><dd>{compactNumber(source.stars, locale)}</dd></div>
      <div><dt>{copy.sourceUpdated}</dt><dd>{displayDate(source.pushed_at || source.updated_at)}</dd></div>
      <div><dt>{copy.resources}</dt><dd>{[source.license_spdx, record.resource_hints?.scripts ? "scripts" : ""].filter(Boolean).join(" · ") || "—"}</dd></div>
    </dl>
    <div className="project-actions">
      {source.html_url ? <a href={source.html_url} target="_blank" rel="noreferrer">{copy.openGithub}</a> : null}
      <a href={record.manifest_url} target="_blank" rel="noreferrer">{copy.viewManifest}</a>
    </div>
  </article>;
}

function SuggestionForm({ copy }) {
  const [repo, setRepo] = useState(""); const [goal, setGoal] = useState(""); const [status, setStatus] = useState(""); const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => { event.preventDefault(); setStatus(""); setSubmitting(true); try { const response = await fetch("/api/suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ repository: repo, learningGoal: goal }) }); const result = await response.json(); if (!response.ok) { setStatus(result.code === "INVALID_REPOSITORY" ? "invalid" : result.code === "DATABASE_NOT_CONFIGURED" ? "unavailable" : "error"); return; } setRepo(""); setGoal(""); setStatus("sent"); } catch { setStatus("error"); } finally { setSubmitting(false); } };
  const message = { sent: copy.submissionSent, invalid: copy.submissionInvalid, unavailable: copy.submissionUnavailable, error: copy.submissionError }[status];
  return <section className="contribute" id="add-signal"><div><p className="eyebrow">{copy.suggestEyebrow}</p><h2>{copy.suggestTitle}</h2><p>{copy.suggestCopy}</p><small>{copy.privateNotice}</small></div><form onSubmit={submit}><label>{copy.repoLabel}<input required value={repo} onChange={(event) => setRepo(event.target.value)} placeholder={copy.repoPlaceholder} /></label><label>{copy.goalLabel}<small>{copy.goalPrivate}</small><textarea required rows="3" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder={copy.goalPlaceholder} /></label><button className="button button-accent" disabled={submitting}>{copy.submitSignal}</button>{message ? <p className={`form-status ${status}`} role="status">{message}</p> : null}</form></section>;
}

function DirectoryIntro({ records, copy, locale, onSubject, onBrowse }) {
  const counts = useMemo(() => Object.fromEntries(SUBJECTS.map(([id]) => [id, records.filter((record) => matchedSubjects(record).some(([subjectId]) => subjectId === id)).length])), [records]);
  const verified = records.filter((record) => record.verification_status === "verified").length;
  const live = records.filter((record) => safeHomepage(record)).length;
  return <section className="directory-intro">
    <div className="intro-copy"><p className="eyebrow">{copy.snapshot}</p><h1>{copy.directoryTitle}</h1><p>{copy.directoryCopy}</p><div className="intro-actions"><button className="text-link" onClick={onBrowse}>{copy.browseIndex} ↓</button><a className="text-link" href="#add-signal">{copy.submitProject} ↓</a></div></div>
    <dl className="directory-stats"><div><dd>{records.length}</dd><dt>{copy.projects}</dt></div><div><dd>{live}</dd><dt>{copy.liveDemos}</dt></div><div><dd>{verified}</dd><dt>{copy.verified}</dt></div></dl>
    <div className="subject-index"><p>{copy.subjectIndex}</p><nav aria-label={copy.subjectIndex}>{SUBJECTS.map(([id, tax, en, zh]) => <button key={id} className={`subject-choice t-${tax}`} onClick={() => onSubject(id)}><span aria-hidden="true" />{locale === "zh" ? zh : en}<b>{counts[id]}</b></button>)}</nav><small>{copy.directoryNote}</small></div>
  </section>;
}

export default function RadarClient({ payload, skillsPayload, supportUrl }) {
  const [locale, setLocale] = useState("en"); const [catalog, setCatalog] = useState("github"); const [query, setQuery] = useState(""); const [show, setShow] = useState("all"); const [kind, setKind] = useState(""); const [subject, setSubject] = useState(""); const [language, setLanguage] = useState(""); const [sort, setSort] = useState("stars"); const indexRef = useRef(null);
  useEffect(() => { const saved = initialLocale(); setLocale(saved); document.documentElement.lang = saved === "zh" ? "zh-CN" : "en"; }, []);
  useEffect(() => { const params = new URLSearchParams(); if (catalog !== "github") params.set("catalog", catalog); if (query) params.set("q", query); if (show !== "all") params.set("has", show); if (kind) params.set("shape", kind); if (subject) params.set("subject", subject); if (language) params.set("language", language); if (sort !== "stars") params.set("sort", sort); const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`; window.history.replaceState(null, "", next); }, [catalog, query, show, kind, subject, language, sort]);
  const switchLocale = (next) => { setLocale(next); window.localStorage.setItem("radar-locale", next); document.documentElement.lang = next === "zh" ? "zh-CN" : "en"; };
  const copy = { ...COPY[locale], ...GUIDE[locale] }; const records = payload.records || []; const skillRecords = skillsPayload.records || []; const isSkills = catalog === "skills";
  const languages = useMemo(() => [...new Set(records.map((record) => record.primary_language).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [records]);
  const allSubjects = useMemo(() => Object.fromEntries(SUBJECTS.map(([id]) => [id, records.filter((record) => matchedSubjects(record).some(([subjectId]) => subjectId === id)).length])), [records]);
  const filtered = useMemo(() => {
    if (isSkills) return skillRecords.filter((record) => !query || skillText(record).toLowerCase().includes(query.toLowerCase())).sort((a, b) => (b.source_repository?.stars || 0) - (a.source_repository?.stars || 0));
    const date = (record, fields) => Math.max(...fields.map((field) => Date.parse(record[field]) || 0));
    const ordered = records.filter((record) => !query || repositoryText(record).toLowerCase().includes(query.toLowerCase())).filter((record) => show === "all" || show === "live" && Boolean(safeHomepage(record)) || show === "picks" && record.gold_seed).filter((record) => !kind || record.entity_kind === kind).filter((record) => !subject || matchedSubjects(record).some(([id]) => id === subject)).filter((record) => !language || record.primary_language === language);
    return ordered.sort((a, b) => sort === "stars" ? (b.metrics?.stars || 0) - (a.metrics?.stars || 0) : sort === "updated" ? date(b, ["pushed_at", "updated_at"]) - date(a, ["pushed_at", "updated_at"]) : sort === "synced" ? date(b, ["fetched_at"]) - date(a, ["fetched_at"]) : date(b, ["first_seen", "fetched_at"]) - date(a, ["first_seen", "fetched_at"]));
  }, [isSkills, skillRecords, records, query, show, kind, subject, language, sort]);
  const scrollToIndex = () => indexRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const useSubject = (id) => { setCatalog("github"); setSubject(id); setShow("all"); scrollToIndex(); };
  const reset = () => { setQuery(""); setShow("all"); setKind(""); setSubject(""); setLanguage(""); setSort("stars"); };
  const filterGroups = [[copy.showMe, [["all", copy.everything, records.length], ["live", copy.live, records.filter((record) => safeHomepage(record)).length], ["picks", copy.picks, records.filter((record) => record.gold_seed).length]]], [copy.projectShape, [["repo", copy.repositories, payload.counts?.entity_kind?.repo || 0], ["dataset", copy.datasets, payload.counts?.entity_kind?.dataset || 0], ["benchmark", copy.benchmarks, payload.counts?.entity_kind?.benchmark || 0], ["awesome_index", copy.awesomeLists, payload.counts?.entity_kind?.awesome_index || 0]]]];
  return <main className="radar"><header className="masthead"><div className="masthead-top"><Link href="/" className="wordmark">EDUOS <span>Radar</span></Link><nav className="catalog-nav" aria-label="Catalog"><button aria-pressed={!isSkills} onClick={() => { setCatalog("github"); reset(); }}>{copy.github}</button><button aria-pressed={isSkills} onClick={() => { setCatalog("skills"); reset(); }}>{copy.skills}</button></nav><div className="masthead-tools"><span className="sync"><i />{copy.sync} {payload.generated_at?.slice(0, 10)}</span><div className="language-switch"><button className={locale === "en" ? "active" : ""} onClick={() => switchLocale("en")}>EN</button><button className={locale === "zh" ? "active" : ""} onClick={() => switchLocale("zh")}>中文</button></div>{supportUrl ? <a className="support-link" href={supportUrl} target="_blank" rel="noreferrer">{copy.support} ↗</a> : <a className="support-link" href="#add-signal">{copy.submitProject} ↓</a>}</div></div><div className="masthead-line"><p>{copy.thesis}</p><p>{copy.thesisMore}</p></div></header>
    {isSkills ? <section className="skills-intro"><p className="eyebrow">{copy.snapshot}</p><h1>{copy.skillsTitle}</h1><p>{copy.skillsBody}</p></section> : <DirectoryIntro records={records} copy={copy} locale={locale} onSubject={useSubject} onBrowse={scrollToIndex} />}
    <section className="index" ref={indexRef} id="index"><aside className="filter-sidebar"><label className="visually-hidden" htmlFor="radar-search">{isSkills ? copy.skillsSearch : copy.search}</label><input id="radar-search" className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isSkills ? copy.skillsSearch : copy.search} />{isSkills ? <div className="filter-note"><p>{copy.skillSource}</p><span>{skillRecords.length} {copy.skillsInView}</span></div> : <>{filterGroups.map(([title, options], groupIndex) => <div className="filter-group" key={title}><h2>{title}</h2>{options.map(([value, label, count]) => <button key={value} aria-pressed={groupIndex === 0 ? show === value : kind === value} onClick={() => groupIndex === 0 ? setShow(value) : setKind(kind === value ? "" : value)}>{label}<span>{count}</span></button>)}</div>)}<div className="filter-group"><h2>{copy.subject}</h2>{SUBJECTS.map(([id, tax, en, zh]) => <button className={`filter-subject t-${tax}`} aria-pressed={subject === id} key={id} onClick={() => setSubject(subject === id ? "" : id)}><i aria-hidden="true" />{locale === "zh" ? zh : en}<span>{allSubjects[id]}</span></button>)}</div><div className="filter-group"><h2>{copy.language}</h2><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="">{copy.all}</option>{languages.map((item) => <option value={item} key={item}>{item}</option>)}</select></div></>}<button className="reset" onClick={reset}>{copy.clear}</button></aside><section className="index-results"><div className="index-head"><div><p className="eyebrow">{isSkills ? copy.skillIndex : copy.index}</p><h2 aria-live="polite">{filtered.length} {isSkills ? copy.skillsInView : copy.inView}</h2></div><p>{isSkills ? copy.skillsBody : copy.resultsHint}</p>{!isSkills ? <label className="sort-control">{copy.sortBy}<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="stars">{copy.sortStars}</option><option value="added">{copy.sortAdded}</option><option value="updated">{copy.sortGithubUpdated}</option><option value="synced">{copy.sortSynced}</option></select></label> : null}</div><div className="project-list">{filtered.map((record) => isSkills ? <SkillRow record={record} copy={copy} locale={locale} key={record.skill_key} /> : <ProjectRow record={record} copy={copy} locale={locale} key={`${record.github_repo_id || "lead"}:${record.full_name || record.name || "unknown"}`} />)}</div>{filtered.length === 0 ? <div className="empty"><h2>{copy.noResults}</h2><button className="text-link" onClick={reset}>{copy.drop}</button></div> : null}</section></section>
    {!isSkills ? <SuggestionForm copy={copy} /> : null}<footer className="footer-mast"><span>EduOS Radar — a project by edu-ai-builders</span><span>{copy.footerMetadata}</span><Link href="/support">{copy.support} →</Link></footer>
  </main>;
}
