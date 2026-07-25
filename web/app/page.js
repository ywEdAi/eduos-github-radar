import registry from "../data/registry.json";
import RadarClient from "./radar-client";

export default function Home() {
  return <RadarClient payload={registry} supportUrl={process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL || ""} />;
}
