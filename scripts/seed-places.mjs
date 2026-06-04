import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function rowsFromSeed(data) {
  const rows = [];
  for (const [area, categories] of Object.entries(data)) {
    if (!categories || typeof categories !== "object" || Array.isArray(categories)) {
      continue;
    }
    for (const [category, places] of Object.entries(categories)) {
      if (!Array.isArray(places)) {
        continue;
      }
      for (const name of places) {
        if (name) {
          rows.push({ name, area, category, active: true });
        }
      }
    }
  }
  return rows;
}

function readConfig() {
  const configPath = path.join(root, "supabase", "supabase-config.js");
  const source = fs.readFileSync(configPath, "utf8");
  const urlMatch = source.match(/url:\s*"([^"]+)"/);
  const keyMatch = source.match(/anonKey:\s*"([^"]+)"/);
  return {
    url: process.env.PLACES_SUPABASE_URL ?? urlMatch?.[1],
    anonKey: process.env.PLACES_SUPABASE_ANON_KEY ?? keyMatch?.[1],
  };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node scripts/seed-places.mjs <places.json>");
    console.error("JSON shape: { \"Area\": { \"category\": [\"Place name\"] }, \"Everywhere\": {} }");
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), inputPath);
  const seedData = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const rows = rowsFromSeed(seedData);

  if (rows.length === 0) {
    console.error("No places found in JSON.");
    process.exit(1);
  }

  const { url, anonKey } = readConfig();
  const placeholder = "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  if (!url || !anonKey || anonKey === placeholder) {
    console.error(
      "Set your anon key in supabase/supabase-config.js or PLACES_SUPABASE_ANON_KEY, then run again."
    );
    process.exit(1);
  }

  const response = await fetch(`${url}/rest/v1/places?on_conflict=name,area,category`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Seed failed (${response.status}): ${body}`);
    process.exit(1);
  }

  const inserted = await response.json();
  console.log(`Seeded ${inserted.length} place rows from ${resolved}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
