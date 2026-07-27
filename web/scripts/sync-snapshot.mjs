import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const snapshots = ["registry.json", "skills.json"];

for (const name of snapshots) {
  const source = resolve(webRoot, "..", "site", "data", name);
  const destination = resolve(webRoot, "data", name);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
  console.log(`Copied curated public snapshot to ${destination}`);
}
