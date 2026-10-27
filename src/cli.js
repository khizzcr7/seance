/**
 * Interactive seance terminal. Run: npm run seance
 * Pick a spirit, ask questions, or type: ofrenda <retired technology>
 * Type: quit to leave the circle.
 */
import readline from "node:readline";

import { channel, ofrenda, MODEL_ID, MODEL_DTYPE, MODEL_LABEL } from "./model.js";
import { SPIRITS, getSpirit } from "./spirits.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("Welcome to the Seance Terminal.");
  console.log(`The model runs locally: ${MODEL_LABEL} (${MODEL_ID}, ${MODEL_DTYPE}).`);
  console.log("No API key, no account, no cloud. First run downloads the model once.\n");
  console.log("Spirits you may summon:");
  SPIRITS.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.fullName} - ${s.era}`);
    console.log(`     ${s.voice}`);
  });
  const pick = await ask("\nChoose a spirit by number (or name): ");
  const spirit =
    getSpirit(pick.trim()) ||
    SPIRITS[Number.parseInt(pick.trim(), 10) - 1];
  if (!spirit) {
    console.log("No such spirit. The circle closes.");
    rl.close();
    return;
  }
  console.log(`\nThe spirit of ${spirit.name} joins the circle.`);
  console.log("Ask anything. Type: ofrenda <technology> for a remembrance, quit to leave.\n");
  for (;;) {
    const line = (await ask(`${spirit.name} > `)).trim();
    if (!line) continue;
    if (/^(quit|exit|leave)$/i.test(line)) break;
    const m = line.match(/^ofrenda\s+(.+)$/i);
    try {
      if (m) {
        console.log(`\nA remembrance for ${m[1]}:\n`);
        console.log(await ofrenda(m[1]));
      } else {
        console.log("");
        console.log(await channel(spirit.system, line));
      }
    } catch (err) {
      console.error("The spirit faltered:", err.message);
    }
    console.log("");
  }
  console.log("The circle closes. The spirits return to the archives.");
  rl.close();
}

main().catch((err) => {
  console.error("Seance failed:", err);
  process.exit(1);
});
