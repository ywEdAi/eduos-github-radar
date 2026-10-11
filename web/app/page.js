import registry from "../data/registry.json";
import skills from "../data/skills.json";
import builders from "../data/builder-resources.json";
import RadarClient from "./radar-client";

export default function Home() {
  return <RadarClient builderPayload={builders} payload={registry} skillsPayload={skills} supportUrl={process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL || ""} />;
}
