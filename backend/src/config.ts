import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

// Bun exposes import.meta.dir; Node 20.11+ exposes import.meta.dirname.
// Bundlers that compile to CommonJS may leave neither, so fall back to cwd.
function getModuleDir(): string {
  try {
    const meta = import.meta as any;
    if (meta?.dir) return meta.dir;
    if (meta?.dirname) return meta.dirname;
  } catch {
    // import.meta is not available in this runtime
  }
  return process.cwd();
}

const moduleDir = getModuleDir();

function resolveGeminiKey(): string {
  // Never exhaust API quota during automated test runner execution
  if (process.env.NODE_ENV === "test" || process.env.BUN_ENV === "test") {
    return "";
  }
  const envKey = (process.env.GEMINI_API_KEY || "").trim();
  if (envKey && envKey !== "your_gemini_api_key_here") {
    return envKey;
  }
  // Check parent root .env if running from backend folder
  const rootEnvPath = resolve(moduleDir, "../../.env");
  if (existsSync(rootEnvPath)) {
    try {
      const content = readFileSync(rootEnvPath, "utf8");
      const match = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
      if (match) {
        const found = match[1].trim();
        if (found && found !== "your_gemini_api_key_here") {
          return found;
        }
      }
    } catch {
      // Ignore read error
    }
  }
  return "";
}

const resolvedKey = resolveGeminiKey();

export const config = {
  PORT: Number(process.env.PORT || 8000),
  HOST: process.env.HOST || "0.0.0.0",
  GEMINI_API_KEY: resolvedKey,
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  GEMINI_TTS_MODEL: process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts",
  GEMINI_TTS_VOICE: process.env.GEMINI_TTS_VOICE || "Kore",
  PROJECT_NAME: "KrosCheck",
  VERSION: "2.0.0",
  DATABASE_PATH: process.env.DATABASE_PATH || resolve(moduleDir, "../data/scamguard_cases.db")
};
