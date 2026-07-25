"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COPY, initialLocale } from "../i18n";

export default function SupportClient({ supportUrl }) {
  const [locale, setLocale] = useState("en");
  useEffect(() => { const saved = initialLocale(); setLocale(saved); document.documentElement.lang = saved === "zh" ? "zh-CN" : "en"; }, []);
  const switchLocale = (next) => { setLocale(next); window.localStorage.setItem("radar-locale", next); document.documentElement.lang = next === "zh" ? "zh-CN" : "en"; };
  const copy = COPY[locale];
  return <main className="support-page"><div className="support-top"><Link href="/" className="back-link">{copy.supportBack}</Link><div className="language-switch" aria-label={copy.languageLabel}><button className={locale === "en" ? "active" : ""} onClick={() => switchLocale("en")}>{copy.languageEnglish}</button><button className={locale === "zh" ? "active" : ""} onClick={() => switchLocale("zh")}>{copy.languageChinese}</button></div></div><p className="eyebrow">{copy.supportEyebrow}</p><h1>{copy.supportTitle}</h1><p>{copy.supportCopy}</p>{supportUrl ? <a className="coffee-button large" href={supportUrl} target="_blank" rel="noreferrer">{copy.buyCoffee}</a> : <p className="pending-support">{copy.supportPending}</p>}</main>;
}
