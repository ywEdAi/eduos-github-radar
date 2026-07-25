import "./globals.css";

export const metadata = {
  title: "EduOS GitHub Radar",
  description: "Open-source education and future-capability projects, refreshed from a curated GitHub metadata registry.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
