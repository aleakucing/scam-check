import type { SynthesizedSpeech } from "./geminiTts";

const MAX_CHARS = 2000;
const CHUNK_LIMIT = 190;
const CACHE_LIMIT = 30;
const CHUNK_TIMEOUT_MS = 8000;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const audioCache = new Map<string, SynthesizedSpeech>();

function getCached(text: string): SynthesizedSpeech | null {
  return audioCache.get(text) ?? null;
}

function setCached(text: string, audio: SynthesizedSpeech): void {
  if (audioCache.has(text)) audioCache.delete(text);
  audioCache.set(text, audio);
  while (audioCache.size > CACHE_LIMIT) {
    const oldest = audioCache.keys().next();
    if (oldest.done) break;
    audioCache.delete(oldest.value);
  }
}

/** Pecah teks panjang per kalimat agar muat di batas per-request. */
function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= CHUNK_LIMIT) return [clean];
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + " " + s).trim().length > CHUNK_LIMIT && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current = (current + " " + s).trim();
    }
  }
  if (current.trim()) chunks.push(current.trim());
  // Pengaman: potong keras bila satu kalimat masih kepanjangan
  const hard: string[] = [];
  for (const c of chunks) {
    for (let i = 0; i < c.length; i += CHUNK_LIMIT) hard.push(c.slice(i, i + CHUNK_LIMIT));
  }
  return hard.length > 0 ? hard : [clean];
}

async function fetchChunk(chunk: string): Promise<Buffer | null> {
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id-ID&client=tw-ob&q=${encodeURIComponent(chunk)}`;
    const resp = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(CHUNK_TIMEOUT_MS)
    });
    if (!resp.ok) return null;
    const buf = Buffer.from(await resp.arrayBuffer());
    if (buf.length < 500) return null;
    return buf;
  } catch {
    return null;
  }
}

/**
 * Generate suara Bahasa Indonesia via Google Translate TTS.
 * Gratis, tanpa API key. Dipakai sebagai lapis kedua setelah Gemini
 * (mis. saat kuota Gemini habis). Return null bila gagal — pemanggil
 * lalu merespons error agar frontend fallback ke suara browser.
 */
export async function synthesizeSpeechGoogle(text: string): Promise<SynthesizedSpeech | null> {
  const clean = text.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
  if (!clean) return null;

  const hit = getCached(clean);
  if (hit) return hit;

  const parts: Buffer[] = [];
  for (const chunk of chunkText(clean)) {
    const buf = await fetchChunk(chunk);
    if (!buf) return null;
    parts.push(buf);
  }

  const audio: SynthesizedSpeech = { audioBase64: Buffer.concat(parts).toString("base64"), mimeType: "audio/mp3" };
  setCached(clean, audio);
  return audio;
}
