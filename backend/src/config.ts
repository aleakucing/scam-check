import { resolve } from "path";

export const config = {
  PORT: Number(process.env.PORT || 8000),
  HOST: process.env.HOST || "0.0.0.0",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  PROJECT_NAME: "ScamGuard AI",
  VERSION: "2.0.0",
  DATABASE_PATH: process.env.DATABASE_PATH || resolve(import.meta.dir, "../data/scamguard_cases.db")
};
