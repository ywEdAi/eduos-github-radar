import Link from "next/link";

export const metadata = {
  title: "Support · EduOS GitHub Radar",
};

export default function Support() {
  const supportUrl = process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL || "";

  return (
    <main className="support-page">
      <Link href="/" className="back-link">← Back to the Radar</Link>
      <p className="eyebrow">KEEP THE SIGNAL FRESH</p>
      <h1>Help keep the Radar alive.</h1>
      <p>
        Support helps cover daily metadata refreshes, thumbnail maintenance, and
        future deep-dive research. The Radar remains openly browseable.
      </p>
      {supportUrl ? (
        <a className="coffee-button large" href={supportUrl} target="_blank" rel="noreferrer">
          Buy me a coffee ↗
        </a>
      ) : (
        <p className="pending-support">The support link will appear here once its creator page is configured.</p>
      )}
    </main>
  );
}
