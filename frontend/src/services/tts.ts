/**
 * ScamGuard AI & KrosCheck - Indonesian TTS (Text-to-Speech) Audio Engine
 *
 * Memastikan suara yang keluar adalah suara ORANG INDONESIA asli
 * (Google Bahasa Indonesia / Microsoft Gadis / Ardi / Dimas),
 * bukan suara Inggris/bule bawaan browser.
 *
 * Strategi:
 * 1. Scoring prioritas suara Indonesia (perempuan hangat diutamakan)
 * 2. Menunggu voiceschanged secara async (Chrome memuat voice terlambat)
 * 3. Rate 0.88 + pitch 1.05 agar terdengar ramah seperti operator keluarga
 * 4. Pecah kalimat panjang agar tidak terpotong
 */

export interface VoicePick {
  voice: SpeechSynthesisVoice | null;
  label: string;
  isIndonesian: boolean;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesReadyPromise: Promise<SpeechSynthesisVoice[]> | null = null;

function readVoicesSync(): SpeechSynthesisVoice[] {
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cachedVoices = v;
      }
    }
  } catch {
    // abaikan
  }
  return cachedVoices;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  readVoicesSync();
  try {
    window.speechSynthesis.onvoiceschanged = () => {
      readVoicesSync();
    };
  } catch {
    // abaikan
  }
}

/**
 * Menunggu daftar suara browser siap (penting di Chrome/Edge).
 */
export function ensureVoicesLoaded(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }
  const current = readVoicesSync();
  if (current.length > 0) return Promise.resolve(current);

  if (!voicesReadyPromise) {
    voicesReadyPromise = new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        voicesReadyPromise = null;
        resolve(readVoicesSync());
      };
      try {
        const synth = window.speechSynthesis;
        const handler = () => {
          readVoicesSync();
          if (cachedVoices.length > 0) finish();
        };
        synth.onvoiceschanged = handler;
        // Polling fallback karena sebagian browser tidak memicu event dengan andal
        const started = Date.now();
        const timer = window.setInterval(() => {
          readVoicesSync();
          if (cachedVoices.length > 0 || Date.now() - started > timeoutMs) {
            window.clearInterval(timer);
            finish();
          }
        }, 100);
        window.setTimeout(() => {
          window.clearInterval(timer);
          finish();
        }, timeoutMs + 200);
      } catch {
        finish();
      }
    });
  }
  return voicesReadyPromise;
}

/** Preload agar suara Indonesia siap sebelum modal dibuka. */
export function preloadIndonesianVoice(): void {
  try {
    void ensureVoicesLoaded().then((voices) => {
      if (import.meta.env.DEV) {
        console.info(
          "[TTS-ID] Suara tersedia:",
          voices.map((v) => `${v.name} (${v.lang})`)
        );
        const pick = pickBestIndonesianVoice(voices);
        console.info("[TTS-ID] Pilihan terbaik:", pick.label);
      }
    });
  } catch {
    // abaikan
  }
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const lang = (v.lang || "").toLowerCase().replace("_", "-");
  const name = (v.name || "").toLowerCase();
  let score = 0;

  const isId = lang === "id" || lang.startsWith("id-") || name.includes("indonesia") || name.includes("bahasa");
  const isMs = lang === "ms" || lang.startsWith("ms-");
  if (isId) score += 50;
  else if (isMs) score += 8;
  else return -100; // suara Inggris / lainnya langsung didiskualifikasi

  // Prioritas utama: suara Google Bahasa Indonesia (perempuan, paling jernih di Chrome/Android)
  if (name.includes("google") && (name.includes("indonesia") || name.includes("bahasa") || lang.startsWith("id"))) score += 100;
  // Microsoft Natural hangat
  if (name.includes("gadis")) score += 85;
  if (name.includes("damayanti")) score += 80;
  if (name.includes("ardi")) score += 75;
  if (name.includes("dimas")) score += 70;
  // Kualitas neural / natural / online
  if (name.includes("natural")) score += 20;
  if (name.includes("online")) score += 12;
  if (name.includes("neural") || name.includes("wavenet") || name.includes("standard")) score += 10;
  // Suara perempuan Indonesia cenderung lebih jelas untuk lansia
  if (name.includes("female") || name.includes("perempuan")) score += 6;
  // Hindari suara anak / robotik bila ada labelnya
  if (name.includes("child") || name.includes("robot")) score -= 10;

  return score;
}

function pickBestIndonesianVoice(voices: SpeechSynthesisVoice[]): VoicePick {
  if (!voices || voices.length === 0) {
    return { voice: null, label: "Tidak ada suara", isIndonesian: false };
  }
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;
  for (const v of voices) {
    const s = scoreVoice(v);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  if (!best || bestScore < 0) {
    return { voice: null, label: "Suara Indonesia tidak ditemukan", isIndonesian: false };
  }
  const lang = (best.lang || "").toLowerCase();
  const isIndonesian = lang.startsWith("id") || (best.name || "").toLowerCase().includes("indonesia");
  return { voice: best, label: `${best.name} (${best.lang})`, isIndonesian };
}

/**
 * Finds the best authentic Indonesian voice installed in the browser/OS.
 */
export function getIndonesianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = readVoicesSync();
  if (voices.length === 0) return null;
  return pickBestIndonesianVoice(voices).voice;
}

/** Info suara terpilih untuk ditampilkan di UI / debugging. */
export function getIndonesianVoiceInfo(): VoicePick {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { voice: null, label: "TTS tidak didukung", isIndonesian: false };
  }
  return pickBestIndonesianVoice(readVoicesSync());
}

/** Pecah teks panjang menjadi potongan kalimat agar tidak terpotong di Chrome. */
function chunkText(text: string, maxLen = 200): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return [clean];
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + " " + s).trim().length > maxLen && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current = (current + " " + s).trim();
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [clean];
}

/**
 * Speaks text using an Indonesian voice with optimal cadence and pitch for clarity.
 * Tetap sinkron dari sisi pemanggil (tidak perlu await), tapi di dalam
 * menunggu daftar voice siap dulu agar tidak jatuh ke suara Inggris.
 */
export function speakIndonesian(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (err?: unknown) => void;
  }
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const cleanText = (text || "").trim();
  if (!cleanText) return;

  void ensureVoicesLoaded(1200).then(() => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();

      // Chrome butuh jeda kecil setelah cancel agar voice tidak tertelan
      window.setTimeout(() => {
        try {
          const pick = pickBestIndonesianVoice(readVoicesSync());
          const chunks = chunkText(cleanText);
          let index = 0;

          const speakNext = () => {
            if (index >= chunks.length) {
              options?.onEnd?.();
              return;
            }
            const utterance = new SpeechSynthesisUtterance(chunks[index]);
            // Kunci ke Bahasa Indonesia — inilah yang mencegah aksen bule
            utterance.lang = pick.voice?.lang || "id-ID";
            if (pick.voice) utterance.voice = pick.voice;
            utterance.rate = options?.rate ?? 0.88; // pelan & jelas untuk orang tua
            utterance.pitch = options?.pitch ?? 1.05; // sedikit hangat (perempuan operator)
            utterance.volume = 1.0;

            utterance.onend = () => {
              index += 1;
              speakNext();
            };
            utterance.onerror = (e) => {
              // Jika error 'interrupted' karena cancel manual, jangan dianggap gagal
              const err = e as { error?: string };
              if (err?.error === "interrupted" || err?.error === "canceled") return;
              options?.onError?.(e);
            };

            synth.speak(utterance);
          };

          speakNext();
        } catch (err) {
          console.warn("TTS speak failed:", err);
          options?.onError?.(err);
        }
      }, 60);
    } catch (err) {
      console.warn("TTS speak failed:", err);
      options?.onError?.(err);
    }
  });
}

/**
 * Cancels any active speech synthesis immediately.
 */
export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
