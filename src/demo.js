/**
 * Non-interactive demo: a fixed 2-question seance with COBOL plus one
 * ofrenda remembrance for the floppy disk. Writes the real transcript to
 * out/transcript.md, then refreshes viewer/index.html with that transcript
 * so the static viewer always shows a genuine run.
 *
 * Run: npm run demo
 * First run downloads the model once (about 840 MB for Gemma 3 1B q4)
 * into ./.cache. After that it works offline.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { channel, ofrenda, MODEL_ID, MODEL_DTYPE, MODEL_LABEL } from "./model.js";
import { getSpirit } from "./spirits.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const outDir = path.join(root, "out");
const transcriptPath = path.join(outDir, "transcript.md");
const viewerPath = path.join(root, "viewer", "index.html");

const cobol = getSpirit("cobol");
const questions = [
  "What do you miss most about the mainframe days?",
  "Give a young programmer one piece of advice, in your own voice.",
];
const ofrendaTech = "the floppy disk";

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function main() {
  console.log(`Seance demo: loading ${MODEL_LABEL} (${MODEL_ID}, ${MODEL_DTYPE})...`);
  console.log("First run downloads the model once. Later runs work offline.");
  const started = Date.now();
  const answers = [];
  for (const q of questions) {
    console.log(`\nAsking COBOL: ${q}`);
    const a = await channel(cobol.system, q);
    console.log(a);
    answers.push({ q, a });
  }
  console.log(`\nOfrenda: a remembrance for ${ofrendaTech}`);
  const remembrance = await ofrenda(ofrendaTech);
  console.log(remembrance);

  const stamp = new Date().toISOString();
  const lines = [
    "# Seance demo transcript",
    "",
    `Generated: ${stamp} (UTC)`,
    `Model: ${MODEL_LABEL} - ${MODEL_ID} at dtype ${MODEL_DTYPE}`,
    "Run: `npm run demo` in this project. Everything below the header is verbatim model output from that run.",
    "",
    "## Spirit: COBOL, the Spirit of Business",
    "",
  ];
  for (const { q, a } of answers) {
    lines.push(`### Question: ${q}`, "", a, "");
  }
  lines.push(
    `## Ofrenda: a remembrance for ${ofrendaTech}`,
    "",
    remembrance,
    "",
    "---",
    "",
    "Notes: a small local model speaks in character, so answers can ramble or " +
      "repeat themselves. That is the honest output of the run, kept verbatim here.",
  );
  fs.mkdirSync(outDir, { recursive: true });
  const transcript = lines.join("\n");
  fs.writeFileSync(transcriptPath, transcript);
  console.log(`\nWrote ${transcriptPath}`);

  // Refresh the static viewer with this exact transcript.
  const viewer = fs.readFileSync(viewerPath, "utf8");
  const next = viewer.replace(
    /<!-- TRANSCRIPT-START -->[\s\S]*?<!-- TRANSCRIPT-END -->/,
    `<!-- TRANSCRIPT-START -->\n${escapeHtml(transcript)}\n<!-- TRANSCRIPT-END -->`,
  );
  if (next === viewer) {
    console.warn("Viewer transcript markers not found; viewer left unchanged.");
  } else {
    fs.writeFileSync(viewerPath, next);
    console.log(`Updated ${viewerPath}`);
  }
  console.log(`Done in ${Math.round((Date.now() - started) / 1000)}s.`);
}

main().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
