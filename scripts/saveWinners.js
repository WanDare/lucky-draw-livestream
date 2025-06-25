import fs from "fs";
import fetch from "node-fetch";
import path from "path";

const API_URL =
  "http://68.183.177.52:5000/api/mobile/v1/contest/winners?pageNumber=1&pageSize=100";

async function saveWinners() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : [];

    const outputDir = path.resolve("public/data");
    const outputFile = path.join(outputDir, "winners.json");

    // Ensure folder exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log("✅ Saved to public/data/winners.json");
  } catch (err) {
    console.error("❌ Failed to fetch or save:", err);
  }
}

saveWinners();
