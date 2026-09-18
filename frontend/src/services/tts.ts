/**
 * ScamGuard AI & KrosCheck - Indonesian TTS (Text-to-Speech) Audio Engine
 * 
 * Specifically selects authentic Indonesian voices (e.g. Google Bahasa Indonesia,
 * Microsoft Gadis / Ardi) to prevent browsers from using default English synthesizer
 * engines that pronounce Indonesian with an English/bule accent.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const loadVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      cachedVoices = [];
    }
  };

  loadVoices();
  if ("onvoiceschanged" in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Finds the best authentic Indonesian voice installed in the browser/OS.
 */
export function getIndonesianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  if (!cachedVoices || cachedVoices.length === 0) {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      cachedVoices = [];
    }
  }

  // 1. First priority: High-quality natural Indonesian voices
  // (e.g. "Google Bahasa Indonesia", "Microsoft Gadis Online (Natural)", "Microsoft Ardi Online")
  const naturalId = cachedVoices.find((v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const name = (v.name || "").toLowerCase();
    const isId = lang === "id" || lang.startsWith("id-") || name.includes("indonesia") || name.includes("bahasa");
    const isNatural = name.includes("natural") || name.includes("google") || name.includes("gadis") || name.includes("ardi");
    return isId && isNatural;
  });
  if (naturalId) return naturalId;

  // 2. Second priority: Any Indonesian voice
  const anyId = cachedVoices.find((v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const name = (v.name || "").toLowerCase();
    return lang === "id" || lang.startsWith("id-") || name.includes("indonesia") || name.includes("bahasa");
  });
  if (anyId) return anyId;

  // 3. Third priority: Malay voice as closest phonetic fallback if Indonesian isn't installed
  const msVoice = cachedVoices.find((v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    return lang === "ms" || lang.startsWith("ms-");
  });
  if (msVoice) return msVoice;

  return null;
}

/**
 * Speaks text using an Indonesian voice with optimal cadence and pitch for clarity.
 */
export function speakIndonesian(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (err?: any) => void;
  }
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();

    const cleanText = text.trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "id-ID";
    utterance.rate = options?.rate ?? 0.90; // Slower, clearer pace for clarity and seniors
    utterance.pitch = options?.pitch ?? 1.0;

    const voice = getIndonesianVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      options?.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("TTS speak failed:", err);
    options?.onError?.(err);
  }
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
