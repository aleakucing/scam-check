import { config } from "../config";

export interface SynthesizedSpeech {
  audioBase64: string;
  mimeType: string;
}

export type TtsResult =
  | { ok: true; audio: SynthesizedSpeech }
  | { ok: false; reason: "quota" | "failed" };

const MAX_CHARS = 2000;
const CACHE_LIMIT = 30;
const MODEL_TIMEOUT_MS = 15000;

// Cache audio per teks (teks sudah disamarkan di endpoint) — kuota TTS
// gratis sangat kecil, jadi pertanyaan yang sama tidak boleh menghabiskan
// kuota berulang kali.
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

/**
 * Bungkus PCM mentah (mono 16-bit) dari Gemini TTS ke kontainer WAV
 * agar bisa diputar langsung oleh elemen <audio> browser.
 */
function pcmToWavBase64(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16): string {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE((sampleRate * channels * bitsPerSample) / 8, 28);
  header.writeUInt16LE((channels * bitsPerSample) / 8, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]).toString("base64");
}

function parseSampleRate(mimeType: string): number {
  const match = mimeType.match(/rate=(\d+)/);
  const rate = match ? parseInt(match[1], 10) : 24000;
  return Number.isFinite(rate) && rate > 0 ? rate : 24000;
}

/**
 * Generate suara Bahasa Indonesia via Gemini TTS.
 * Return { ok:false, reason:"quota" } jika kuota habis (429) agar pemanggil
 * tidak memboroskan kuota dengan mencoba model lain — semua model memakai
 * pool kuota yang sama. Frontend lalu fallback ke suara browser bawaan.
 */
export async function synthesizeSpeechIndonesian(text: string): Promise<TtsResult> {
  const clean = text.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
  if (!clean || !config.GEMINI_API_KEY) return { ok: false, reason: "failed" };

  const hit = getCached(clean);
  if (hit) return { ok: true, audio: hit };

  const candidateModels = Array.from(
    new Set([config.GEMINI_TTS_MODEL, "gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"])
  );

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.GEMINI_API_KEY}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: clean }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: config.GEMINI_TTS_VOICE }
              }
            }
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.status === 429) {
        console.warn(`Gemini TTS model ${modelName} kehabisan kuota (429) — stop, hemat sisa kuota.`);
        return { ok: false, reason: "quota" };
      }
      if (!resp.ok) {
        console.warn(`Gemini TTS model ${modelName} returned status ${resp.status}, trying next candidate.`);
        continue;
      }

      const data: any = await resp.json();
      const parts: any[] = data.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find((p) => p?.inlineData?.data);
      if (!audioPart) {
        console.warn(`Gemini TTS model ${modelName} returned no audio data, trying next candidate.`);
        continue;
      }

      const mimeType: string = audioPart.inlineData.mimeType || "";
      const raw = Buffer.from(audioPart.inlineData.data, "base64");

      // Gemini mengembalikan PCM mentah (audio/L16) — bungkus ke WAV.
      // Jika suatu saat sudah WAV, teruskan apa adanya.
      let audio: SynthesizedSpeech;
      if (mimeType.includes("wav")) {
        audio = { audioBase64: raw.toString("base64"), mimeType: "audio/wav" };
      } else {
        audio = { audioBase64: pcmToWavBase64(raw, parseSampleRate(mimeType)), mimeType: "audio/wav" };
      }
      setCached(clean, audio);
      return { ok: true, audio };
    } catch (err: any) {
      console.warn(`Error querying Gemini TTS model ${modelName}: ${err?.message || err}, trying next candidate.`);
    }
  }

  return { ok: false, reason: "failed" };
}
