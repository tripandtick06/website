// Ortak OpenAI ceviri yardimcisi (fetch — paket gerekmez).
// Key: process.env.OPENAI_API_KEY veya ../github key.txt (sk-proj-...).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");

export function loadOpenAIKey(): string {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim();
  for (const p of [path.join(REPO, ".env.local"), path.resolve(REPO, "..", "github key.txt")]) {
    if (fs.existsSync(p)) {
      const m = fs.readFileSync(p, "utf8").match(/sk-proj-[A-Za-z0-9_-]+/);
      if (m) return m[0];
    }
  }
  throw new Error("OPENAI_API_KEY bulunamadi (env / .env.local / ../github key.txt)");
}

const KEY = loadOpenAIKey();
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// JSON deger -> cevrili JSON deger. json_object modu ust-seviye obje ister; deger
// { "_": <node> } icine sarilir, donulurken acilir (dizi/obje farketmez).
export async function translateJson(node: unknown, system: string, langName: string): Promise<unknown> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await translateOnce(node, system, langName);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function translateOnce(node: unknown, system: string, langName: string): Promise<unknown> {
  const wrapped = JSON.stringify({ _: node });
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Translate the JSON values under key "_" to ${langName}. Keep the wrapper key "_" and all inner keys/structure exactly. Return JSON only:\n${wrapped}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = JSON.parse(content) as { _: unknown };
  return parsed._;
}
