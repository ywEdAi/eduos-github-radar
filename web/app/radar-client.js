"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
    thesis: "A human-readable directory for open education technology.",
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
    apps: "Apps & systems",
    skills: "Skills",
    data: "Data & benchmarks",
    catalogLabel: "Radar collections",
    appsTitle: "Find systems you can actually open and adapt.",
    appsBody: "A readable index of public education tools, learning systems and curated project maps. GitHub is the current source, not the category.",
    dataTitle: "Find data and benchmarks before they disappear into a paper trail.",
    dataBody: "A dedicated shelf for public education datasets, question banks and benchmarks. It begins with GitHub metadata and can grow beyond it.",
    browseApps: "Browse apps & systems",
    browseSkills: "Browse skills",
    browseData: "Browse data & benchmarks",
    appsIndex: "Apps & systems index",
    dataIndex: "Data & benchmarks index",
    appsInView: "apps & systems in view",
    dataInView: "data records in view",
    appsSearch: "Search apps, systems, or topics…",
    dataSearch: "Search datasets, benchmarks, or topics…",
    dataSource: "Current source: GitHub metadata",
    catalogSource: "Source: GitHub metadata",
    dataResultsHint: "These records describe public sources. Check the dataset card, licence and documentation before using data.",
    appsResultsHint: "Each row uses repository metadata only. Read the source before adopting or cloning anything.",
    noDataResults: "No data or benchmark records fit that combination.",
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
    cardView: "Cards",
    listView: "List",
  },
  zh: {
    snapshot: "开源教育项目雷达",
    thesis: "一个面向开放教育技术的人类可读目录。",
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
    apps: "应用与系统",
    skills: "Skills",
    data: "数据与基准",
    catalogLabel: "Radar 目录",
    appsTitle: "先找到真正可以打开、理解和改造的系统。",
    appsBody: "这里收录公开的教育工具、学习系统与精选项目地图。GitHub 是当前来源，而不是目录分类本身。",
    dataTitle: "在它们淹没在论文链接之前，先找到数据与基准。",
    dataBody: "一个专门整理教育数据集、题库与评测基准的目录。它从 GitHub 元数据开始，未来可扩展至更多公开来源。",
    browseApps: "浏览应用与系统",
    browseSkills: "浏览 Skills",
    browseData: "浏览数据与基准",
    appsIndex: "应用与系统索引",
    dataIndex: "数据与基准索引",
    appsInView: "个应用与系统正在显示",
    dataInView: "条数据记录正在显示",
    appsSearch: "搜索应用、系统或主题……",
    dataSearch: "搜索数据集、基准或主题……",
    dataSource: "当前来源：GitHub 元数据",
    catalogSource: "来源：GitHub 元数据",
    dataResultsHint: "这些记录描述公开来源。使用数据前，请先核对数据卡、许可证与文档。",
    appsResultsHint: "每一行只使用仓库公开元数据。采用或 clone 前，请先阅读来源项目。",
    noDataResults: "没有数据集或基准符合当前筛选条件。",
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
    cardView: "卡片",
    listView: "列表",
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

function languageGlyph(language) {
  const glyphs = { TypeScript: "TS", JavaScript: "JS", Python: "PY", Java: "JV", "C++": "C+", "C#": "C#", "Jupyter Notebook": "NB", HTML: "HT", CSS: "CS", Ruby: "RB", Go: "GO", Rust: "RS", R: "R" };
  return glyphs[language] || String(language || "").slice(0, 2).toUpperCase();
}

function LanguageMark({ language }) {
  if (!language) return null;
  return <span className="language-mark" title={language} aria-label={`Primary language: ${language}`}>{languageGlyph(language)}</span>;
}

function SubjectMark({ record, locale, card = false }) {
  const subjects = matchedSubjects(record); const visibleSubjects = subjects.length ? subjects.slice(0, 2) : [primarySubject(record)];
  if (card) return <div className="subject-chips">{visibleSubjects.map(([, tax, en, zh]) => <span className={`subject-chip t-${tax}`} key={tax}>{locale === "zh" ? zh : en}</span>)}</div>;
  const [, tax, en, zh] = visibleSubjects[0];
  return <div className="subject-line"><span className={`subject-dot t-${tax}`} aria-hidden="true" />{locale === "zh" ? zh : en}{visibleSubjects[1] ? <span>· {locale === "zh" ? visibleSubjects[1][3] : visibleSubjects[1][2]}</span> : null}</div>;
}

function ProjectRow({ record, copy, locale, view }) {
  const homepage = safeHomepage(record); const [, tax] = primarySubject(record); const secondary = matchedSubjects(record)[1]?.[1];
  return <article className={`${view === "cards" ? "project-card" : "project-row"} t-${tax}`}>
    {view === "cards" ? <div className="card-spectrum" aria-hidden="true"><i className={`t-${tax}`} /><i className={secondary ? `t-${secondary}` : "t-learn"} /><i className="t-learn" /></div> : null}
    <div className="project-main">
      {view === "cards" ? <LanguageMark language={record.primary_language} /> : null}
      <p className="project-kicker"><span>{kindLabel(record.entity_kind, copy)}</span><span>{record.verification_status === "verified" ? copy.verified : copy.awaiting}</span></p>
      <p className="project-owner">{ownerName(record)} /</p>
      <h3><a href={record.html_url} target="_blank" rel="noreferrer">{record.name || record.full_name}</a></h3>
      <p className="project-description">{text(record.description, locale === "zh" ? "等待下一次 GitHub 元数据核验。" : "Awaiting the next GitHub metadata verification.")}</p>
      <SubjectMark record={record} locale={locale} card={view === "cards"} />
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

function SkillRow({ record, copy, locale, view }) {
  const source = record.source_repository || {};
  return <article className={`${view === "cards" ? "project-card" : "project-row"} skill-row t-learn`}>
    {view === "cards" ? <div className="card-spectrum" aria-hidden="true"><i className="t-learn" /><i className="t-cs" /><i className="t-teach" /></div> : null}
    <div className="project-main">
      {view === "cards" ? <LanguageMark language={source.primary_language} /> : null}
      <p className="project-kicker"><span>{copy.skill}</span><span>{copy.source}</span></p>
      <p className="project-owner">{source.full_name || copy.skillSource} /</p>
      <h3><a href={record.manifest_url} target="_blank" rel="noreferrer">{record.skill_name}</a></h3>
      <p className="project-description">{text(record.description, copy.skillDescriptionUnavailable)}</p>
      {view === "cards" ? <div className="subject-chips">{(record.ecosystems || []).slice(0, 2).map((item) => <span className="subject-chip t-learn" key={item}>{item}</span>)}</div> : <div className="subject-line"><span className="subject-dot t-learn" aria-hidden="true" />{(record.ecosystems || []).slice(0, 2).join(" · ") || copy.sourceManifest}</div>}
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

function CatalogHero({ catalog, copy, counts, onCatalog, onBrowse }) {
  const reduceMotion = useReducedMotion();
  const collections = [
    { id: "apps", title: copy.apps, description: copy.appsBody, count: counts.apps, action: copy.browseApps },
    { id: "skills", title: copy.skills, description: copy.skillsBody, count: counts.skills, action: copy.browseSkills },
    { id: "data", title: copy.data, description: copy.dataBody, count: counts.data, action: copy.browseData },
  ];
  const active = collections.find((item) => item.id === catalog) || collections[0];
  const title = catalog === "apps" ? copy.appsTitle : catalog === "skills" ? copy.skillsTitle : copy.dataTitle;
  const eyebrow = catalog === "skills" ? copy.skillsEyebrow : catalog === "data" ? copy.data : copy.snapshot;
  const reveal = (delay) => reduceMotion ? {} : {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.52, delay, ease: [0.16, 1, 0.3, 1] },
  };

  return <section className={`catalog-hero catalog-${catalog}`}>
    <motion.div className="catalog-copy" {...reveal(0)}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{active.description}</p>
      <div className="intro-actions"><button className="text-link" onClick={onBrowse}>{active.action} ↓</button><a className="text-link" href="#add-signal">{copy.submitProject} ↓</a></div>
    </motion.div>
    <motion.div className="catalog-stage" {...reveal(0.08)} aria-label={copy.catalogLabel}>
      <div className="catalog-stage-head"><p className="eyebrow">{copy.catalogLabel}</p><span>{copy.catalogSource}</span></div>
      <div className="catalog-rail">
        {collections.map((item, index) => <motion.button key={item.id} className={`catalog-card catalog-card-${item.id}`} aria-pressed={catalog === item.id} onClick={() => onCatalog(item.id)} whileHover={reduceMotion ? undefined : { y: -5 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }} layout>
          <span className="catalog-card-number">0{index + 1}</span><span className="catalog-card-dot" aria-hidden="true" />
          <strong>{item.title}</strong><small>{item.description}</small><b>{item.count}<em>{catalog === item.id ? " selected" : " records"}</em></b>
        </motion.button>)}
      </div>
      <motion.i className="catalog-scan" aria-hidden="true" animate={reduceMotion ? undefined : { x: ["-140%", "280%"] }} transition={reduceMotion ? undefined : { duration: 5.2, repeat: Infinity, ease: "linear", repeatDelay: 2 }} />
    </motion.div>
  </section>;
}

export default function RadarClient({ payload, skillsPayload, supportUrl }) {
  const [locale, setLocale] = useState("en"); const [catalog, setCatalog] = useState("apps"); const [query, setQuery] = useState(""); const [show, setShow] = useState("all"); const [kind, setKind] = useState(""); const [subject, setSubject] = useState(""); const [language, setLanguage] = useState(""); const [sort, setSort] = useState("stars"); const [view, setView] = useState("cards"); const indexRef = useRef(null);
  useEffect(() => { const saved = initialLocale(); setLocale(saved); document.documentElement.lang = saved === "zh" ? "zh-CN" : "en"; }, []);
  useEffect(() => { const params = new URLSearchParams(); if (catalog !== "apps") params.set("catalog", catalog); if (query) params.set("q", query); if (show !== "all") params.set("has", show); if (kind) params.set("shape", kind); if (subject) params.set("subject", subject); if (language) params.set("language", language); if (sort !== "stars") params.set("sort", sort); const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`; window.history.replaceState(null, "", next); }, [catalog, query, show, kind, subject, language, sort]);
  const switchLocale = (next) => { setLocale(next); window.localStorage.setItem("radar-locale", next); document.documentElement.lang = next === "zh" ? "zh-CN" : "en"; };
  const copy = { ...COPY[locale], ...GUIDE[locale] }; const records = payload.records || []; const skillRecords = skillsPayload.records || []; const isSkills = catalog === "skills"; const isData = catalog === "data";
  const catalogRecords = useMemo(() => records.filter((record) => isData ? ["dataset", "benchmark"].includes(record.entity_kind) : ["repo", "awesome_index"].includes(record.entity_kind)), [records, isData]);
  const collectionCounts = useMemo(() => ({ apps: records.filter((record) => ["repo", "awesome_index"].includes(record.entity_kind)).length, skills: skillRecords.length, data: records.filter((record) => ["dataset", "benchmark"].includes(record.entity_kind)).length }), [records, skillRecords]);
  const languages = useMemo(() => [...new Set(catalogRecords.map((record) => record.primary_language).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [catalogRecords]);
  const allSubjects = useMemo(() => Object.fromEntries(SUBJECTS.map(([id]) => [id, catalogRecords.filter((record) => matchedSubjects(record).some(([subjectId]) => subjectId === id)).length])), [catalogRecords]);
  const filtered = useMemo(() => {
    if (isSkills) return skillRecords.filter((record) => !query || skillText(record).toLowerCase().includes(query.toLowerCase())).sort((a, b) => (b.source_repository?.stars || 0) - (a.source_repository?.stars || 0));
    const date = (record, fields) => Math.max(...fields.map((field) => Date.parse(record[field]) || 0));
    const ordered = catalogRecords.filter((record) => !query || repositoryText(record).toLowerCase().includes(query.toLowerCase())).filter((record) => !isData || show === "all" || show === "picks" && record.gold_seed).filter((record) => isData || show === "all" || show === "live" && Boolean(safeHomepage(record)) || show === "picks" && record.gold_seed).filter((record) => !kind || record.entity_kind === kind).filter((record) => !subject || matchedSubjects(record).some(([id]) => id === subject)).filter((record) => !language || record.primary_language === language);
    return ordered.sort((a, b) => sort === "stars" ? (b.metrics?.stars || 0) - (a.metrics?.stars || 0) : sort === "updated" ? date(b, ["pushed_at", "updated_at"]) - date(a, ["pushed_at", "updated_at"]) : sort === "synced" ? date(b, ["fetched_at"]) - date(a, ["fetched_at"]) : date(b, ["first_seen", "fetched_at"]) - date(a, ["first_seen", "fetched_at"]));
  }, [isSkills, isData, skillRecords, catalogRecords, query, show, kind, subject, language, sort]);
  const scrollToIndex = () => indexRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const reset = () => { setQuery(""); setShow("all"); setKind(""); setSubject(""); setLanguage(""); setSort("stars"); };
  const selectCatalog = (next) => { setCatalog(next); reset(); };
  const filterGroups = isData
    ? [[copy.projectShape, [["dataset", copy.datasets, payload.counts?.entity_kind?.dataset || 0], ["benchmark", copy.benchmarks, payload.counts?.entity_kind?.benchmark || 0]]]]
    : [[copy.showMe, [["all", copy.everything, collectionCounts.apps], ["live", copy.live, catalogRecords.filter((record) => safeHomepage(record)).length], ["picks", copy.picks, catalogRecords.filter((record) => record.gold_seed).length]]], [copy.projectShape, [["repo", copy.repositories, payload.counts?.entity_kind?.repo || 0], ["awesome_index", copy.awesomeLists, payload.counts?.entity_kind?.awesome_index || 0]]]];
  const searchPlaceholder = isSkills ? copy.skillsSearch : isData ? copy.dataSearch : copy.appsSearch;
  const indexLabel = isSkills ? copy.skillIndex : isData ? copy.dataIndex : copy.appsIndex;
  const inViewLabel = isSkills ? copy.skillsInView : isData ? copy.dataInView : copy.appsInView;
  const resultHint = isSkills ? copy.skillsBody : isData ? copy.dataResultsHint : copy.appsResultsHint;
  return <main className="radar"><header className="masthead"><div className="system-line"><span>EDU AI BUILDERS / OPEN INFRASTRUCTURE</span><span><i />RADAR ONLINE</span></div><div className="masthead-top"><a href="https://edu-ai-builders.dev/" target="_top" className="wordmark" aria-label="Edu AI Builders main site"><b className="wordmark-orbit" aria-hidden="true"><i /><i /><i /><em>e</em></b><span>Edu AI Builders</span><small>/ DIRECTORY</small></a><nav className="catalog-nav" aria-label={copy.catalogLabel}><button aria-pressed={catalog === "apps"} onClick={() => selectCatalog("apps")}>{copy.apps}</button><button aria-pressed={catalog === "skills"} onClick={() => selectCatalog("skills")}>{copy.skills}</button><button aria-pressed={catalog === "data"} onClick={() => selectCatalog("data")}>{copy.data}</button></nav><div className="masthead-tools"><span className="sync"><i />{copy.sync} {payload.generated_at?.slice(0, 10)}</span><div className="language-switch"><button className={locale === "en" ? "active" : ""} onClick={() => switchLocale("en")}>EN</button><button className={locale === "zh" ? "active" : ""} onClick={() => switchLocale("zh")}>中文</button></div><a className="main-site-link" href="https://edu-ai-builders.dev/" target="_top">Main site ↗</a>{supportUrl ? <a className="support-link" href={supportUrl} target="_blank" rel="noreferrer">{copy.support} ↗</a> : <a className="support-link" href="#add-signal">{copy.submitProject} ↓</a>}</div></div><div className="masthead-line"><p>{copy.thesis}</p><p>{copy.thesisMore}</p></div></header>
    <CatalogHero catalog={catalog} copy={copy} counts={collectionCounts} onCatalog={selectCatalog} onBrowse={scrollToIndex} />
    <section className="index" ref={indexRef} id="index"><aside className="filter-sidebar"><label className="visually-hidden" htmlFor="radar-search">{searchPlaceholder}</label><input id="radar-search" className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} />{isSkills ? <div className="filter-note"><p>{copy.skillSource}</p><span>{skillRecords.length} {copy.skillsInView}</span></div> : <><div className="filter-note"><p>{isData ? copy.dataSource : copy.catalogSource}</p><span>{catalogRecords.length} {inViewLabel}</span></div>{filterGroups.map(([title, options], groupIndex) => <div className="filter-group" key={title}><h2>{title}</h2>{options.map(([value, label, count]) => <button key={value} aria-pressed={title === copy.showMe ? show === value : kind === value} onClick={() => title === copy.showMe ? setShow(value) : setKind(kind === value ? "" : value)}>{label}<span>{count}</span></button>)}</div>)}<div className="filter-group"><h2>{copy.subject}</h2>{SUBJECTS.map(([id, tax, en, zh]) => <button className={`filter-subject t-${tax}`} aria-pressed={subject === id} key={id} onClick={() => setSubject(subject === id ? "" : id)}><i aria-hidden="true" />{locale === "zh" ? zh : en}<span>{allSubjects[id]}</span></button>)}</div><div className="filter-group"><h2>{copy.language}</h2><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="">{copy.allLanguages}</option>{languages.map((item) => <option value={item} key={item}>{item}</option>)}</select></div></>}<button className="reset" onClick={reset}>{copy.clear}</button></aside><section className="index-results"><div className="index-head"><div><p className="eyebrow">{indexLabel}</p><h2 aria-live="polite">{filtered.length} {inViewLabel}</h2></div><p>{resultHint}</p><div className="index-controls"><div className="view-switch" aria-label="View mode"><button aria-pressed={view === "cards"} onClick={() => setView("cards")}>{copy.cardView}</button><button aria-pressed={view === "list"} onClick={() => setView("list")}>{copy.listView}</button></div>{!isSkills ? <label className="sort-control">{copy.sortBy}<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="stars">{copy.sortStars}</option><option value="added">{copy.sortAdded}</option><option value="updated">{copy.sortGithubUpdated}</option><option value="synced">{copy.sortSynced}</option></select></label> : null}</div></div><div className={`project-list ${view}`}>{filtered.map((record) => isSkills ? <SkillRow record={record} copy={copy} locale={locale} view={view} key={record.skill_key} /> : <ProjectRow record={record} copy={copy} locale={locale} view={view} key={`${record.github_repo_id || "lead"}:${record.full_name || record.name || "unknown"}`} />)}</div>{filtered.length === 0 ? <div className="empty"><h2>{isData ? copy.noDataResults : isSkills ? copy.noSkillsMatches : copy.noResults}</h2><button className="text-link" onClick={reset}>{copy.drop}</button></div> : null}</section></section>
    <SuggestionForm copy={copy} /><footer className="footer-mast"><span>EduOS Radar — part of the Edu AI Builders infrastructure layer</span><span>{copy.footerMetadata}</span><a href="https://edu-ai-builders.dev/" target="_top">Return to the system →</a><Link href="/support">{copy.support} →</Link></footer>
  </main>;
}
