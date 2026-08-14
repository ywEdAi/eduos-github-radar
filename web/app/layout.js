import "./globals.css";

export const metadata = {
  title: "EduOS Radar",
  description: "A bilingual directory of open education apps, skills, datasets and benchmarks, built from source-attributed public metadata.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
