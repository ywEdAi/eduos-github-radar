const state = { records: [] };
const elements = {
  cards: document.querySelector("#cards"),
  empty: document.querySelector("#empty"),
  search: document.querySelector("#search"),
  kind: document.querySelector("#kind"),
  status: document.querySelector("#status"),
  language: document.querySelector("#language"),
  total: document.querySelector("#total-count"),
  verified: document.querySelector("#verified-count"),
  updated: document.querySelector("#updated-at"),
  result: document.querySelector("#result-count"),
};

function text(value, fallback = "—") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function compactNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function searchable(record) {
  return [
    record.full_name,
    record.name,
    record.description,
    record.primary_language,
    ...(record.topics || []),
    ...Object.keys(record.languages || {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

function card(record) {
  const article = document.createElement("article");
  article.className = "card";

  const top = document.createElement("div");
  top.className = "card-top";
  const kind = document.createElement("span");
  kind.className = `pill kind-${record.entity_kind}`;
  kind.textContent = record.entity_kind.replace("_", " ");
  const status = document.createElement("span");
  status.className = `pill status-${record.verification_status}`;
  status.textContent = record.verification_status;
  top.append(kind, status);
  if (record.lead_match_status === "probable") {
    const probable = document.createElement("span");
    probable.className = "pill probable";
    probable.textContent = "probable lead";
    top.append(probable);
  }

  const heading = document.createElement("h2");
  if (record.html_url) {
    const link = document.createElement("a");
    link.href = record.html_url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = text(record.full_name, record.name);
    heading.append(link);
  } else {
    heading.textContent = text(record.name);
  }

  const description = document.createElement("p");
  description.className = "description";
  description.textContent = text(record.description, "等待 GitHub API 核验。");

  const metrics = document.createElement("dl");
  metrics.className = "metrics";
  const values = [
    ["Stars", compactNumber(record.metrics?.stars)],
    ["Forks", compactNumber(record.metrics?.forks)],
    ["Issues", compactNumber(record.metrics?.open_issues)],
    ["Language", text(record.primary_language)],
    ["License", text(record.license_spdx)],
    ["Pushed", record.pushed_at ? record.pushed_at.slice(0, 10) : "—"],
  ];
  for (const [label, value] of values) {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    wrapper.append(dt, dd);
    metrics.append(wrapper);
  }

  const topics = document.createElement("div");
  topics.className = "topics";
  for (const topic of (record.topics || []).slice(0, 8)) {
    const span = document.createElement("span");
    span.textContent = topic;
    topics.append(span);
  }
  article.append(top, heading, description, metrics, topics);
  return article;
}

function render() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const kind = elements.kind.value;
  const status = elements.status.value;
  const language = elements.language.value;
  const matches = state.records.filter((record) => {
    return (
      (!query || searchable(record).includes(query)) &&
      (!kind || record.entity_kind === kind) &&
      (!status || record.verification_status === status) &&
      (!language || record.primary_language === language)
    );
  });
  elements.cards.replaceChildren(...matches.map(card));
  elements.result.textContent = String(matches.length);
  elements.empty.hidden = matches.length !== 0;
}

async function start() {
  try {
    const response = await fetch("./data/registry.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    state.records = payload.records;
    elements.total.textContent = String(payload.count);
    elements.verified.textContent = String(
      payload.counts?.verification_status?.verified || 0
    );
    elements.updated.textContent = payload.generated_at.slice(0, 10);
    const languages = [
      ...new Set(state.records.map((record) => record.primary_language).filter(Boolean)),
    ].sort((left, right) => left.localeCompare(right));
    for (const language of languages) {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = language;
      elements.language.append(option);
    }
    render();
  } catch (error) {
    elements.empty.hidden = false;
    elements.empty.textContent = `数据载入失败：${error.message}`;
  }
}

for (const element of [elements.search, elements.kind, elements.status, elements.language]) {
  element.addEventListener("input", render);
}
start();
