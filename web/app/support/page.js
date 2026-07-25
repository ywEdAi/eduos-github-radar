import SupportClient from "./support-client";

export const metadata = { title: "Support · EduOS GitHub Radar" };

export default function Support() { return <SupportClient supportUrl={process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL || ""} />; }
