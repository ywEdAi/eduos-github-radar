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

const HUES = { math: "#1B2AFF", lang: "#F5219A", sci: "#00B3A4", teach: "#FF7A00", learn: "#5A5F73", cs: "#7DBE12" };
const SHAPES = { repo: "repo", dataset: "dataset", benchmark: "benchmark", awesome_index: "list" };
const DAY = 86400000;

const GUIDE = {
  en: {
    snapshot: "Open-source education intelligence",
    thesis: "Education-native projects on GitHub, read by someone who teaches.",
    thesisMore: "Every entry shows its shape before you click.",
    pages: ["What this is", "Today’s pick", "Browse by subject", "How to read a repo", "What people want"],
    pageNo: "Page",
    heroTitleStart: "See what a",
    heroTitleAccent: "learning tool",
    heroTitleEnd: "does before you clone it.",
    heroBody: "Not a list of links. A field guide that makes the project, its current activity, documentation and licence legible before you spend an evening on it.",
    projects: "projects indexed",
    liveDemos: "with a live website",
    verified: "GitHub metadata verified",
    browseSubject: "Browse by subject",
    readSignals: "How to read a repo",
    todayPick: "Today’s pick",
    pickNote: "A project with a live website is useful only when its metadata is still trustworthy. Start with the demo, then inspect the four signals below.",
    openEntry: "Open project ↗",
    allProjects: "Browse all projects",
    subjectTitle: "Start from what you teach.",
    subjectCta: "Show projects",
    checkTitle: "Four checks before you spend an evening on it.",
    checks: [
      ["Signal 01", "Recent activity", "A recently pushed repository is more likely to have an active maintainer when something breaks."],
      ["Signal 02", "Issue load", "Open issues are a lightweight proxy for the project’s current support load, not a verdict on its quality."],
      ["Signal 03", "Docs", "A description and useful public metadata make a repository much easier to evaluate before cloning."],
      ["Signal 04", "Licence", "A clear licence tells you what you can adapt, share, or redistribute."],
    ],
    demandTitle: "What people are looking for.",
    demandBody: "When the private submission inbox is connected, recurring needs will appear here only as curator-approved, aggregated themes.",
    addSignal: "Add a signal",
    tryEyebrow: "PROJECTS WITH A PUBLIC HOMEPAGE",
    tryTitle: "Open it in a tab and see for yourself.",
    tryBody: "These entries point to a declared project website. Visit it, then decide whether it belongs in your classroom or build stack.",
    seeAll: "See all in the index ↓",
    search: "Search projects, topics…",
    showMe: "Show me",
    everything: "Everything",
    live: "Has a live website",
    screenshot: "Has a cached screenshot",
    picks: "Gold seeds",
    projectShape: "Project shape",
    subject: "Subject",
    language: "Primary language",
    index: "Index",
    inView: "projects in view",
    generatedHint: "Project portraits are metadata-based guides, not website screenshots.",
    noResults: "No projects fit that combination.",
    clear: "Clear filters",
    drop: "Drop the narrowest filter",
    sourceGenerated: "Project portrait",
    sourceDemo: "Demo site",
    maintained: "Maint.",
    issues: "Issues",
    docs: "Docs",
    licence: "Licence",
    stars: "stars",
    forks: "forks",
    updated: "updated",
    github: "GitHub",
    skills: "Skills",
    skillsTitle: "Public skills, arranged as a field guide.",
    skillsBody: "Explore source-attributed skill manifests before installing, adapting, or connecting them to a learning workflow.",
    skillIndex: "Skills index",
    skillsInView: "skills in view",
    skillsSearch: "Search skills, workflows…",
    skillSource: "Source repository",
    skillResources: "Resource hints",
    all: "All",
    support: "Support the Radar",
    sync: "snapshot",
    privateNotice: "Your learning goal stays private. A repository is published only after metadata verification.",
    contributor: "Curator submission",
    curatorNote: "GitHub metadata verified",
    source: "Source",
  },
  zh: {
    snapshot: "开源教育情报",
    thesis: "由真正理解教学的人阅读过的 GitHub 教育项目。",
    thesisMore: "点击之前，先看清它的形态与信号。",
    pages: ["这是哪里", "今日精选", "按学科浏览", "如何读一个 repo", "大家在寻找什么"],
    pageNo: "第",
    heroTitleStart: "克隆之前，先看懂一个",
    heroTitleAccent: "学习工具",
    heroTitleEnd: "真正能做什么。",
    heroBody: "这不是链接清单，而是一份 field guide：在你花一个晚上研究它之前，先看清项目、活跃度、文档和许可证。",
    projects: "个项目已收录",
    liveDemos: "个有公开网站",
    verified: "个 GitHub 元数据已核验",
    browseSubject: "按学科浏览",
    readSignals: "如何读一个 repo",
    todayPick: "今日精选",
    pickNote: "一个有公开网站的项目，仍要先确认它的元数据是否可信。先试 demo，再看下方四个信号。",
    openEntry: "打开项目 ↗",
    allProjects: "浏览全部项目",
    subjectTitle: "从你教的内容开始。",
    subjectCta: "显示项目",
    checkTitle: "投入一个晚上之前，先看四个信号。",
    checks: [
      ["信号 01", "最近活跃度", "近期有 push 的仓库，更可能在出问题时仍有维护者响应。"],
      ["信号 02", "Issue 负载", "Open issue 是当前支持负载的轻量代理，并不是项目质量的最终判断。"],
      ["信号 03", "文档", "描述与可读的公开元数据能让你在 clone 前更快判断项目。"],
      ["信号 04", "许可证", "清晰的许可证说明你能如何改造、分享或重新发布材料。"],
    ],
    demandTitle: "大家正在寻找什么。",
    demandBody: "投稿数据库连通后，这里只会展示策展人审核过的、聚合后的需求主题，不会显示私人学习目标。",
    addSignal: "推荐项目",
    tryEyebrow: "带公开主页的项目",
    tryTitle: "直接打开，在浏览器里看看。",
    tryBody: "这些条目声明了项目主页。先访问它，再决定它是否适合你的课堂或 build stack。",
    seeAll: "在索引中查看全部 ↓",
    search: "搜索项目、主题……",
    showMe: "显示方式",
    everything: "全部项目",
    live: "有公开网站",
    screenshot: "有缓存截图",
    picks: "Gold seed",
    projectShape: "项目类型",
    subject: "学科",
    language: "主要语言",
    index: "索引",
    inView: "个项目正在显示",
    generatedHint: "项目画像来自已核验元数据，不是网站截图。",
    noResults: "没有项目符合这组条件。",
    clear: "清除筛选",
    drop: "移除最窄的条件",
    sourceGenerated: "项目画像",
    sourceDemo: "官网截图",
    maintained: "活跃",
    issues: "议题",
    docs: "文档",
    licence: "许可",
    stars: "Stars",
    forks: "Forks",
    updated: "更新",
    github: "GitHub",
    skills: "Skills",
    skillsTitle: "把公开 skills 当作一份 field guide 来阅读。",
    skillsBody: "安装、改造或接入教学工作流前，先浏览标注来源的公开 skill manifest。",
    skillIndex: "Skills 索引",
    skillsInView: "个 Skill 正在显示",
    skillsSearch: "搜索 Skill、工作流……",
    skillSource: "来源仓库",
    skillResources: "资源提示",
    all: "全部",
    support: "支持 Radar",
    sync: "快照",
    privateNotice: "你的学习目标保持私密。仓库通过元数据核验后才会公开。",
    contributor: "策展投稿",
    curatorNote: "GitHub 元数据已核验",
    source: "来源",
  },
};

function text(value, fallback = "—") { return value === null || value === undefined || value === "" ? fallback : String(value); }
function compactNumber(value, locale) { return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0); }
function displayDate(value) { return value ? String(value).slice(0, 10) : "—"; }
function repositoryText(record) { return [record.full_name, record.name, record.description, record.primary_language, ...(record.topics || []), ...Object.keys(record.languages || {})].filter(Boolean).join(" "); }
function skillText(record) { return [record.skill_name, record.description, record.source_repository?.full_name, ...(record.ecosystems || []), record.skill_path].filter(Boolean).join(" "); }
function matchedSubjects(record) { const haystack = repositoryText(record); return SUBJECTS.filter(([, , , , expression]) => expression.test(haystack)); }
function primarySubject(record) { return matchedSubjects(record)[0] || SUBJECTS.find(([id]) => id === "learning-systems"); }
function shape(record) { return SHAPES[record.entity_kind] || "repo"; }
function safeHomepage(record) { try { const url = new URL(record.homepage || ""); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : ""; } catch { return ""; } }
function hash(value) { return [...String(value)].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) | 0, 0) >>> 0; }
function round(value) { return Number(value.toFixed(3)); }
function ownerName(record) { return record.owner?.login || String(record.full_name || "").split("/")[0] || "GitHub"; }
function initials(value) { const words = String(value).replace(/([^A-Z])([A-Z])/g, "$1 $2").replace(/[^A-Za-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean); return (words.slice(0, 2).map((word) => word[0]).join("") || String(value).slice(0, 2)).toUpperCase(); }
function signalLevel(record, name) {
  const observedAt = record.fetched_at || record.updated_at || record.pushed_at;
  const age = record.pushed_at && observedAt ? (Date.parse(observedAt) - Date.parse(record.pushed_at)) / DAY : Infinity;
  if (name === "maintained") return age <= 90 ? "pass" : age <= 365 ? "warn" : "fail";
  if (name === "issues") { const issues = record.metrics?.open_issues; return issues === null || issues === undefined ? "warn" : issues < 60 ? "pass" : issues < 300 ? "warn" : "fail"; }
  if (name === "docs") return record.description && (record.topics || []).length ? "pass" : record.description || (record.topics || []).length ? "warn" : "fail";
  const licence = record.license_spdx || "";
  if (!licence) return "fail";
  return /^(MIT|Apache-2\.0|BSD-|ISC|CC0|CC-BY|Unlicense)/i.test(licence) ? "pass" : "warn";
}
function signalTitle(record, name, label) {
  const observedAt = record.fetched_at || record.updated_at || record.pushed_at;
  const age = record.pushed_at && observedAt ? Math.max(0, Math.floor((Date.parse(observedAt) - Date.parse(record.pushed_at)) / DAY)) : null;
  if (name === "maintained") return `${label}: ${age === null ? "no push date" : `${age} days since last push`}. Pass: ≤90 days; warn: ≤365 days.`;
  if (name === "issues") return `${label}: ${record.metrics?.open_issues ?? "unknown"} open issues. This is an issue-load proxy, not a maintainer-reply measure.`;
  if (name === "docs") return `${label}: based on whether the public GitHub description and topics are present.`;
  return `${label}: ${record.license_spdx || "no licence detected"}. Permissive licences pass; copyleft/restricted licences warn.`;
}

function GeneratedPlate({ record, className = "" }) {
  const [, tax, subject] = primarySubject(record); const hue = HUES[tax]; const seed = hash(`${ownerName(record)}/${record.name}`); const kind = shape(record); const label = kind === "dataset" ? "DATASET" : kind === "benchmark" ? "BENCHMARK" : kind === "list" ? "CURATED LIST" : "LEARNING TOOL";
  const warm = ["#FFE4BD", "#FBE0F0", "#DFF5E8", "#DDE5FF"][seed % 4];
  const bars = Array.from({ length: 4 }, (_, index) => 44 + ((seed >> (index * 3)) & 31) * 4);
  return <svg className={className} viewBox="0 0 320 200" role="img" aria-label={`Metadata portrait for ${record.full_name || record.name}`}>
    <rect width="320" height="200" fill={warm} />
    <rect x="18" y="17" width="284" height="166" rx="14" fill="#FFFEFA" stroke={hue} strokeOpacity=".24" />
    <rect x="18" y="17" width="284" height="27" rx="14" fill={hue} /><rect x="18" y="31" width="284" height="13" fill={hue} />
    <circle cx="35" cy="30" r="3" fill="#fff" opacity=".85" /><circle cx="46" cy="30" r="3" fill="#fff" opacity=".55" /><circle cx="57" cy="30" r="3" fill="#fff" opacity=".3" />
    <text x="75" y="33" fill="#fff" fontFamily="ui-monospace, monospace" fontSize="8" letterSpacing="1.4">{label}</text>
    {kind === "dataset" ? <>
      <text x="36" y="66" fill="#171827" fontFamily="Georgia, serif" fontSize="18">Open data, ready to inspect</text>
      <rect x="36" y="78" width="248" height="15" rx="4" fill={hue} opacity=".13" />
      {[0, 1, 2, 3].map((row) => <g key={row}><rect x="36" y={101 + row * 15} width="248" height="10" rx="3" fill="#F4F1EB" />{[0, 1, 2, 3].map((column) => <rect key={column} x={42 + column * 57} y={104 + row * 15} width={18 + ((seed >> (row + column)) & 3) * 8} height="4" rx="2" fill={hue} opacity={column === 0 ? ".72" : ".28"} />)}</g>)}
    </> : kind === "benchmark" ? <>
      <text x="36" y="66" fill="#171827" fontFamily="Georgia, serif" fontSize="18">Evidence at a glance</text>
      <text x="36" y="82" fill="#71717D" fontFamily="ui-monospace, monospace" fontSize="7" letterSpacing=".8">TASK · METHOD · RESULT</text>
      {bars.map((width, index) => <g key={index}><rect x="36" y={96 + index * 18} width="228" height="10" rx="5" fill="#F1EEE8" /><rect x="36" y={96 + index * 18} width={width} height="10" rx="5" fill={hue} /><rect x="270" y={97 + index * 18} width="12" height="8" rx="2" fill={index % 2 ? "#F6C358" : "#F3A7C5"} /></g>)}
    </> : kind === "list" ? <>
      <text x="36" y="66" fill="#171827" fontFamily="Georgia, serif" fontSize="18">A reading shelf</text>
      {[0, 1, 2, 3, 4].map((index) => <g key={index}><rect x={36 + index * 45} y={84 + ((seed >> index) & 1) * 7} width="32" height={60 - ((seed >> (index + 4)) & 3) * 5} rx="4" fill={index % 2 ? hue : "#F6C358"} opacity={index % 2 ? ".82" : ".88"} /><rect x={41 + index * 45} y={94 + ((seed >> index) & 1) * 7} width="22" height="3" rx="1.5" fill="#fff" opacity=".7" /></g>)}
    </> : <>
      <text x="36" y="66" fill="#171827" fontFamily="Georgia, serif" fontSize="18">Build a lesson path</text>
      <text x="36" y="82" fill="#71717D" fontFamily="ui-monospace, monospace" fontSize="7" letterSpacing=".8">{subject.toUpperCase()} · EXPLORE · PRACTISE</text>
      <rect x="36" y="96" width="104" height="55" rx="8" fill={hue} opacity=".12" /><rect x="151" y="96" width="133" height="22" rx="7" fill="#F5F1EB" /><rect x="151" y="128" width="95" height="23" rx="7" fill="#F5F1EB" />
      <path d="M54 132 C72 106 89 151 116 111" fill="none" stroke={hue} strokeWidth="4" strokeLinecap="round" /><circle cx="54" cy="132" r="7" fill="#fff" stroke={hue} strokeWidth="3" /><circle cx="116" cy="111" r="7" fill={hue} />
      <rect x="164" y="103" width="78" height="5" rx="2.5" fill={hue} opacity=".55" /><rect x="164" y="136" width="54" height="5" rx="2.5" fill={hue} opacity=".55" />
    </>}
  </svg>;
}

function OwnerMark({ record }) {
  const [, tax] = primarySubject(record); const [failed, setFailed] = useState(false); const owner = ownerName(record);
  return <span className="owner-mark" aria-label={owner}>{!failed ? <img src={`https://avatars.githubusercontent.com/${encodeURIComponent(owner)}?s=96`} width="46" height="46" alt="" onError={() => setFailed(true)} /> : <span style={{ "--mark-hue": HUES[tax] }}>{initials(owner)}</span>}</span>;
}

function Visual({ record, copy }) {
  const [, tax] = primarySubject(record); const screenshot = record.homepage_screenshot_url;
  return <div className={`plate-art t-${tax}`}>
    {screenshot ? <img src={screenshot} alt={`${record.full_name || record.name} ${copy.sourceDemo}`} width="640" height="400" loading="lazy" /> : <GeneratedPlate record={record} />}
    <span className="source-badge">{screenshot ? copy.sourceDemo : copy.sourceGenerated}</span>
    <OwnerMark record={record} />
  </div>;
}

function Signal({ record, name, label }) { const state = signalLevel(record, name); return <span className={`signal signal-${state}`} title={signalTitle(record, name, label)} aria-label={signalTitle(record, name, label)}>{label}</span>; }

function ProjectCard({ record, copy, locale }) {
  const subjects = matchedSubjects(record); const [primary, tax, en, zh] = primarySubject(record); const homepage = safeHomepage(record);
  return <article className={`plate-card t-${tax}`}>
    <Visual record={record} copy={copy} />
    <div className="plate-body">
      <span className="plate-owner">{ownerName(record)} /</span>
      <a className="plate-name" href={record.html_url} target="_blank" rel="noreferrer">{record.name}</a>
      <p className="plate-description">{text(record.description, locale === "zh" ? "等待下一次 GitHub 元数据核验。" : "Awaiting the next GitHub metadata verification.")}</p>
      <div className="chipline"><span className="topic-chip">{locale === "zh" ? zh : en}</span>{subjects[1] ? <span className="topic-chip topic-alt">{locale === "zh" ? subjects[1][3] : subjects[1][2]}</span> : null}</div>
      <div className="signals"><Signal record={record} name="maintained" label={copy.maintained} /><Signal record={record} name="issues" label={copy.issues} /><Signal record={record} name="docs" label={copy.docs} /><Signal record={record} name="licence" label={copy.licence} /></div>
      <div className="plate-stats"><span>★ <b>{compactNumber(record.metrics?.stars, locale)}</b></span><span>⑂ <b>{compactNumber(record.metrics?.forks, locale)}</b></span><span>{text(record.primary_language)}</span></div>
      <div className="plate-links">{homepage ? <a href={homepage} target="_blank" rel="noreferrer">{copy.openEntry}</a> : null}{record.html_url ? <a href={`${record.html_url}#readme`} target="_blank" rel="noreferrer">README ↗</a> : null}</div>
    </div>
  </article>;
}

function SkillCard({ record, copy, locale }) {
  const source = record.source_repository || {}; const pseudoRecord = { full_name: record.skill_name, name: record.skill_name, owner: { login: source.owner?.login || source.full_name?.split("/")[0] || "Skill" }, entity_kind: "repo", description: record.description, topics: record.ecosystems || [] };
  return <article className="plate-card t-learn"><Visual record={pseudoRecord} copy={copy} /><div className="plate-body"><span className="plate-owner">{source.full_name || copy.source} /</span><a className="plate-name" href={record.manifest_url} target="_blank" rel="noreferrer">{record.skill_name}</a><p className="plate-description">{text(record.description, "Public source manifest metadata.")}</p><div className="chipline">{(record.ecosystems || []).slice(0, 2).map((item) => <span className="topic-chip" key={item}>{item}</span>)}</div><div className="signals"><span className="signal signal-pass">MANIFEST</span><span className="signal signal-warn">SOURCE</span><span className="signal signal-pass">PUBLIC</span><span className="signal signal-warn">META</span></div><div className="plate-stats"><span>★ <b>{compactNumber(source.stars, locale)}</b></span><span>{displayDate(source.pushed_at || source.updated_at)}</span></div><div className="plate-links">{source.html_url ? <a href={source.html_url} target="_blank" rel="noreferrer">{copy.openEntry}</a> : null}<a href={record.manifest_url} target="_blank" rel="noreferrer">SKILL.md ↗</a></div></div></article>;
}

function SuggestionForm({ copy }) {
  const [repo, setRepo] = useState(""); const [goal, setGoal] = useState(""); const [status, setStatus] = useState(""); const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => { event.preventDefault(); setStatus(""); setSubmitting(true); try { const response = await fetch("/api/suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ repository: repo, learningGoal: goal }) }); const result = await response.json(); if (!response.ok) { setStatus(result.code === "INVALID_REPOSITORY" ? "invalid" : result.code === "DATABASE_NOT_CONFIGURED" ? "unavailable" : "error"); return; } setRepo(""); setGoal(""); setStatus("sent"); } catch { setStatus("error"); } finally { setSubmitting(false); } };
  const message = { sent: copy.submissionSent, invalid: copy.submissionInvalid, unavailable: copy.submissionUnavailable, error: copy.submissionError }[status];
  return <section className="contribute" id="add-signal"><div><p className="eyebrow">{copy.suggestEyebrow}</p><h2>{copy.suggestTitle}</h2><p>{copy.suggestCopy}</p></div><form onSubmit={submit}><label>{copy.repoLabel}<input required value={repo} onChange={(event) => setRepo(event.target.value)} placeholder={copy.repoPlaceholder} /></label><label>{copy.goalLabel}<small>{copy.goalPrivate}</small><textarea required rows="3" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder={copy.goalPlaceholder} /></label><button className="button button-ink" disabled={submitting}>{copy.submitSignal}</button>{message ? <p className={`form-status ${status}`}>{message}</p> : null}</form></section>;
}

function Book({ records, copy, locale, onSubject, onBrowse }) {
  const [current, setCurrent] = useState(0); const [direction, setDirection] = useState("next"); const touchStart = useRef(null);
  const subjectCounts = useMemo(() => Object.fromEntries(SUBJECTS.map(([id]) => [id, records.filter((record) => matchedSubjects(record).some(([subjectId]) => subjectId === id)).length])), [records]);
  const demos = records.filter((record) => safeHomepage(record)); const featured = demos.sort((a, b) => (b.metrics?.stars || 0) - (a.metrics?.stars || 0))[0] || records[0];
  const go = (next) => { const target = (next + 5) % 5; if (target === current) return; setDirection(target > current || (current === 4 && target === 0) ? "next" : "prev"); setCurrent(target); };
  const labels = copy.pages;
  const pageContent = [
    <div className="hero-split"><div><p className="page-no">{copy.pageNo} 01 — {labels[0]}</p><h1>{copy.heroTitleStart} <em>{copy.heroTitleAccent}</em> {copy.heroTitleEnd}</h1><p>{copy.heroBody}</p><div className="stat-row"><div><b>{records.length}</b>{copy.projects}</div><div><b>{demos.length}</b>{copy.liveDemos}</div><div><b>{records.filter((record) => record.verification_status === "verified").length}</b>{copy.verified}</div></div><div className="page-cta"><button className="button button-ink" onClick={() => go(2)}>{copy.browseSubject}</button><button className="button button-ghost" onClick={() => go(3)}>{copy.readSignals}</button></div></div>{featured ? <div className={`hero-portrait t-${primarySubject(featured)[1]}`}><Visual record={featured} copy={copy} /><div><span>{copy.todayPick}</span><strong>{featured.name}</strong><small>{ownerName(featured)} · {locale === "zh" ? primarySubject(featured)[3] : primarySubject(featured)[2]}</small></div></div> : null}</div>,
    featured ? <><p className="page-no">{copy.pageNo} 02 — {copy.todayPick}</p><div className="feature-pick"><div className="feature-art"><Visual record={featured} copy={copy} /></div><div><span className="plate-owner">{ownerName(featured)} /</span><a className="feature-name" href={featured.html_url} target="_blank" rel="noreferrer">{featured.name}</a><blockquote>{copy.pickNote}</blockquote><div className="page-cta"><a className="button button-ink" href={featured.html_url} target="_blank" rel="noreferrer">{copy.openEntry}</a><button className="button button-ghost" onClick={onBrowse}>{copy.allProjects}</button></div></div></div></> : null,
    <><p className="page-no">{copy.pageNo} 03 — {labels[2]}</p><h2>{copy.subjectTitle}</h2><div className="subject-swatch-grid">{SUBJECTS.map(([id, tax, en, zh]) => <button className={`subject-swatch t-${tax}`} onClick={() => onSubject(id)} key={id}><i /><span>{locale === "zh" ? zh : en}</span><small>{subjectCounts[id]}</small></button>)}</div></>,
    <><p className="page-no">{copy.pageNo} 04 — {labels[3]}</p><h2>{copy.checkTitle}</h2><div className="checks">{copy.checks.map(([signal, title, description]) => <div className="check" key={title}><span>{signal}</span><h3>{title}</h3><p>{description}</p></div>)}</div></>,
    <><p className="page-no">{copy.pageNo} 05 — {labels[4]}</p><h2>{copy.demandTitle}</h2><p>{copy.demandBody}</p><div className="page-cta"><a className="button button-primary" href="#add-signal">{copy.addSignal}</a></div></>,
  ];
  return <section className="field-guide" onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); go(current + 1); } if (event.key === "ArrowLeft") { event.preventDefault(); go(current - 1); } }} onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX; }} onTouchEnd={(event) => { const distance = (event.changedTouches[0]?.clientX || 0) - (touchStart.current || 0); if (Math.abs(distance) > 55) go(current + (distance < 0 ? 1 : -1)); touchStart.current = null; }}>
    <div className="guide-stage">{pageContent.map((content, index) => <div key={index} role="tabpanel" id={`guide-page-${index}`} aria-labelledby={`guide-tab-${index}`} className={`guide-page ${direction}`} hidden={index !== current}>{content}</div>)}</div>
    <div className="guide-tabs" role="tablist" aria-label="Field guide pages"><span className="contents-label">Contents</span>{labels.map((label, index) => <button id={`guide-tab-${index}`} role="tab" aria-selected={index === current} aria-controls={`guide-page-${index}`} tabIndex={index === current ? 0 : -1} onClick={() => go(index)} onKeyDown={(event) => { if (event.key === "Home") { event.preventDefault(); go(0); } if (event.key === "End") { event.preventDefault(); go(4); } }} key={label}><span>{String(index + 1).padStart(2, "0")}</span>{label}</button>)}<div className="guide-controls"><small>Explore</small><button onClick={() => go(current - 1)} aria-label="Previous field guide page">←</button><button onClick={() => go(current + 1)} aria-label="Next field guide page">→</button></div></div>
  </section>;
}

export default function RadarClient({ payload, skillsPayload, supportUrl }) {
  const [locale, setLocale] = useState("en"); const [catalog, setCatalog] = useState("github"); const [query, setQuery] = useState(""); const [show, setShow] = useState("all"); const [kind, setKind] = useState(""); const [subject, setSubject] = useState(""); const [language, setLanguage] = useState(""); const indexRef = useRef(null);
  useEffect(() => { const saved = initialLocale(); setLocale(saved); document.documentElement.lang = saved === "zh" ? "zh-CN" : "en"; }, []);
  useEffect(() => { const params = new URLSearchParams(); if (catalog !== "github") params.set("catalog", catalog); if (query) params.set("q", query); if (show !== "all") params.set("has", show); if (kind) params.set("shape", kind); if (subject) params.set("subject", subject); if (language) params.set("language", language); const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`; window.history.replaceState(null, "", next); }, [catalog, query, show, kind, subject, language]);
  const switchLocale = (next) => { setLocale(next); window.localStorage.setItem("radar-locale", next); document.documentElement.lang = next === "zh" ? "zh-CN" : "en"; };
  const copy = { ...COPY[locale], ...GUIDE[locale] }; const records = payload.records || []; const skillRecords = skillsPayload.records || []; const isSkills = catalog === "skills";
  const languages = useMemo(() => [...new Set(records.map((record) => record.primary_language).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [records]);
  const allSubjects = useMemo(() => Object.fromEntries(SUBJECTS.map(([id]) => [id, records.filter((record) => matchedSubjects(record).some(([subjectId]) => subjectId === id)).length])), [records]);
  const filtered = useMemo(() => { if (isSkills) return skillRecords.filter((record) => !query || skillText(record).toLowerCase().includes(query.toLowerCase())); return records.filter((record) => !query || repositoryText(record).toLowerCase().includes(query.toLowerCase())).filter((record) => show === "all" || show === "live" && Boolean(safeHomepage(record)) || show === "screenshot" && Boolean(record.homepage_screenshot_url) || show === "picks" && record.gold_seed).filter((record) => !kind || record.entity_kind === kind).filter((record) => !subject || matchedSubjects(record).some(([id]) => id === subject)).filter((record) => !language || record.primary_language === language).sort((a, b) => (b.metrics?.stars || 0) - (a.metrics?.stars || 0)); }, [isSkills, skillRecords, records, query, show, kind, subject, language]);
  const scrollToIndex = () => indexRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const useSubject = (id) => { setCatalog("github"); setSubject(id); setShow("all"); scrollToIndex(); };
  const reset = () => { setQuery(""); setShow("all"); setKind(""); setSubject(""); setLanguage(""); };
  const filterGroups = [
    [copy.showMe, [["all", copy.everything, records.length], ["live", copy.live, records.filter((record) => safeHomepage(record)).length], ["screenshot", copy.screenshot, records.filter((record) => record.homepage_screenshot_url).length], ["picks", copy.picks, records.filter((record) => record.gold_seed).length]]],
    [copy.projectShape, [["repo", locale === "zh" ? "代码仓库" : "Repositories", payload.counts?.entity_kind?.repo || 0], ["dataset", locale === "zh" ? "数据集" : "Datasets", payload.counts?.entity_kind?.dataset || 0], ["benchmark", locale === "zh" ? "基准测试" : "Benchmarks", payload.counts?.entity_kind?.benchmark || 0], ["awesome_index", locale === "zh" ? "Awesome 索引" : "Awesome lists", payload.counts?.entity_kind?.awesome_index || 0]]],
  ];
  return <main className="radar"><header className="nav"><Link href="/" className="wordmark">EDUOS <em>Radar</em></Link><nav className="segmented" aria-label="Catalog"><button aria-pressed={!isSkills} onClick={() => { setCatalog("github"); reset(); }}>{copy.github}</button><button aria-pressed={isSkills} onClick={() => { setCatalog("skills"); reset(); }}>{copy.skills}</button></nav><div className="nav-right"><span className="sync"><i />{copy.sync} {payload.generated_at?.slice(0, 10)}</span><div className="language-switch"><button className={locale === "en" ? "active" : ""} onClick={() => switchLocale("en")}>EN</button><button className={locale === "zh" ? "active" : ""} onClick={() => switchLocale("zh")}>中文</button></div>{supportUrl ? <a className="button button-primary" href={supportUrl} target="_blank" rel="noreferrer">{copy.support} ↗</a> : <a className="button button-primary" href="#add-signal">{copy.addSignal}</a>}</div></header>
    <section className="thesis"><p className="eyebrow">{copy.snapshot} · {payload.generated_at?.slice(0, 10)}</p><p><b>{copy.thesis}</b> {copy.thesisMore}</p></section>
    {isSkills ? <section className="skills-intro"><p className="page-no">{copy.snapshot}</p><h1>{copy.skillsTitle}</h1><p>{copy.skillsBody}</p></section> : <Book records={records} copy={copy} locale={locale} onSubject={useSubject} onBrowse={scrollToIndex} />}
    {!isSkills ? <section className="try-it"><div className="try-head"><div><p className="eyebrow">{copy.tryEyebrow}</p><h2>{copy.tryTitle}</h2></div><p>{copy.tryBody}</p></div><div className="demo-rail" tabIndex="0" aria-label="Projects with public websites">{records.filter((record) => safeHomepage(record)).sort((a, b) => (b.metrics?.stars || 0) - (a.metrics?.stars || 0)).slice(0, 12).map((record) => <a href={safeHomepage(record)} target="_blank" rel="noreferrer" className={`demo-card t-${primarySubject(record)[1]}`} key={record.github_repo_id}><div className="demo-art"><Visual record={record} copy={copy} /></div><div><span className="live"><i />LIVE</span><span className="plate-owner">{ownerName(record)} /</span><strong>{record.name}</strong><p>{text(record.description, "—")}</p></div></a>)}<button className="see-all" onClick={scrollToIndex}>{copy.seeAll}</button></div></section> : null}
    <section className="index" ref={indexRef} id="index"><aside className="filter-sidebar"><input className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isSkills ? copy.skillsSearch : copy.search} />{isSkills ? <><div className="filter-group"><h2>{copy.skillSource}</h2><button aria-pressed="true">{copy.all}<em>{skillRecords.length}</em></button></div><div className="filter-group"><h2>{copy.skillResources}</h2><button aria-pressed="false">scripts <em>{skillRecords.filter((item) => item.resource_hints?.scripts).length}</em></button><button aria-pressed="false">references <em>{skillRecords.filter((item) => item.resource_hints?.references).length}</em></button></div></> : <>{filterGroups.map(([title, options], groupIndex) => <div className="filter-group" key={title}><h2>{title}</h2>{options.map(([value, label, count]) => <button key={value} aria-pressed={groupIndex === 0 ? show === value : kind === value} onClick={() => groupIndex === 0 ? setShow(value) : setKind(kind === value ? "" : value)}>{label}<em>{count}</em></button>)}</div>)}<div className="filter-group"><h2>{copy.subject}</h2>{SUBJECTS.map(([id, tax, en, zh]) => <button className={`filter-subject t-${tax}`} aria-pressed={subject === id} key={id} onClick={() => setSubject(subject === id ? "" : id)}>{locale === "zh" ? zh : en}<em>{allSubjects[id]}</em></button>)}</div><div className="filter-group"><h2>{copy.language}</h2><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="">{copy.all}</option>{languages.map((item) => <option value={item} key={item}>{item}</option>)}</select></div></>}<button className="reset" onClick={reset}>{copy.clear}</button></aside><section className="index-results"><div className="index-head"><div><p className="eyebrow">{isSkills ? copy.skillIndex : copy.index}</p><h2>{filtered.length} {isSkills ? copy.skillsInView : copy.inView}</h2></div><p>{isSkills ? copy.skillsBody : copy.generatedHint}</p></div><div className="plate-grid">{filtered.map((record) => isSkills ? <SkillCard record={record} copy={copy} locale={locale} key={record.skill_key} /> : <ProjectCard record={record} copy={copy} locale={locale} key={`${record.github_repo_id || "lead"}:${record.full_name || record.name || "unknown"}`} />)}</div>{filtered.length === 0 ? <div className="empty"><h2>{copy.noResults}</h2><button className="button button-ghost" onClick={reset}>{copy.drop}</button></div> : null}</section></section>
    {!isSkills ? <SuggestionForm copy={copy} /> : null}<footer><span>EduOS Radar — a project by edu-ai-builders</span><span>{copy.generatedHint}</span><Link href="/support">{copy.support} →</Link></footer>
  </main>;
}
