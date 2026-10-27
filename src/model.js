/**
 * Model layer: a local open-weight model running entirely on this machine
 * via Transformers.js (the @huggingface/transformers package).
 *
 * Primary model: onnx-community/gemma-3-1b-it-ONNX
 *   Google Gemma 3 1B, instruction-tuned, open weights under the Gemma
 *   licence, loaded at dtype q4 (quantised, so it runs on an ordinary
 *   laptop CPU). No API key, no account, no cloud call.
 *
 * Cache: env.cacheDir is ./.cache by default. SEANCE_CACHE_DIR overrides
 * it. After the one-time download, everything works offline.
 *
 * If Gemma genuinely fails to load or generate, set MODEL_ID to
 * onnx-community/Qwen2.5-0.5B-Instruct (also dtype q4) and note the switch
 * in the transcript header. Do not silently swap models.
 */
import { pipeline, env } from "@huggingface/transformers";
import path from "node:path";

export const MODEL_ID =
  process.env.MODEL_ID || "onnx-community/gemma-3-1b-it-ONNX";
export const MODEL_DTYPE = process.env.MODEL_DTYPE || "q4";
export const MODEL_LABEL = "Gemma 3 1B IT (local, open-weight)";

env.cacheDir = path.resolve(
  process.cwd(),
  process.env.SEANCE_CACHE_DIR || ".cache",
);
env.allowLocalModels = true;

let generatorPromise = null;

export function getGenerator() {
  if (!generatorPromise) {
    generatorPromise = pipeline("text-generation", MODEL_ID, {
      dtype: MODEL_DTYPE,
    });
  }
  return generatorPromise;
}

/** Ask the model one question in one spirit's voice. Returns raw model text. */
export async function channel(system, user, maxNewTokens = 220) {
  const gen = await getGenerator();
  const out = await gen(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { max_new_tokens: maxNewTokens, do_sample: false },
  );
  const messages = out[0]?.generated_text ?? [];
  const reply = messages[messages.length - 1]?.content ?? "";
  return reply.trim();
}

/** An ofrenda remembrance for a retired technology, in a warm plain voice. */
export async function ofrenda(technology) {
  const system =
    "You are a warm, plain-spoken storyteller at a Day of the Dead ofrenda " +
    "for retired technology. Write a short remembrance, under about 150 words, " +
    "for the technology named by the user: what it did, what it meant to the " +
    "people who used it, and a fond farewell. Be sincere, not spooky. " +
    "Never claim to be a real person and never invent dates, sales figures, " +
    "or other facts you are not sure of; keep to what the technology was for.";
  return channel(
    system,
    `Write a short remembrance for: ${technology}`,
    220,
  );
}
