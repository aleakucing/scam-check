import { resolve } from "path";

const rawApiKey = (process.env.GEMINI_API_KEY || "").trim();
const isPlaceholderKey = rawApiKey === "" || rawApiKey === "your_gemini_api_key_here";

export const config = {
  PORT: Number(process.env.PORT || 8000),
  HOST: process.env.HOST || "0.0.0.0",
  GEMINI_API_KEY: isPlaceholderKey ? "" : rawApiKey,
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  PROJECT_NAME: "ScamGuard AI",
  VERSION: "2.0.0",
  DATABASE_PATH: process.env.DATABASE_PATH || resolve(import.meta.dir, "../data/scamguard_cases.db")
};
