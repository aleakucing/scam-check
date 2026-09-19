export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedType?: "url" | "text" | "screenshot";
}

/**
 * Validates user evidence input (URL, text, or screenshot) to filter out
 * empty strings, keystroke mashes, gibberish, invalid URLs, and meaningless text.
 */
export function validateEvidenceInput(
  rawContent: string,
  type?: string,
  hasImage: boolean = false
): ValidationResult {
  const content = (rawContent || "").trim();

  // If user uploaded a valid image, content description is more flexible
  // but still enforce basic safety checks (not a blanket bypass)
  if (hasImage) {
    // Allow empty or short descriptions for image-only uploads
    if (!content || content.length < 5) {
      return { valid: true, normalizedType: "screenshot" };
    }
    // Still check for excessively long content (potential prompt injection payload)
    if (content.length > 2000) {
      return {
        valid: false,
        error: "Deskripsi tangkapan layar terlalu panjang (maks 2.000 karakter). Cukup berikan deskripsi singkat."
      };
    }
    // Allow through — further anti-injection is handled by aiAgent prompt isolation
    return { valid: true, normalizedType: "screenshot" };
  }

  // 1. Empty Check
  if (!content || content.length === 0) {
    return {
      valid: false,
      error: "Konten bukti tidak boleh kosong. Masukkan teks pesan, nomor rekening/telepon, atau tautan yang ingin diperiksa."
    };
  }

  // 2. Minimum length check
  if (content.length < 5) {
    return {
      valid: false,
      error: "Konten terlalu pendek (minimal 5 karakter). Masukkan teks pesan atau tautan yang lengkap."
    };
  }

  // 3. Check for phone number or bank account number (digits only, e.g. 08123456789 or 1234567890123)
  const digitsOnly = content.replace(/[\s+-]/g, "");
  if (/^\d{8,20}$/.test(digitsOnly)) {
    return { valid: true, normalizedType: "text" };
  }

  // 4. Check for known keyboard mashing (e.g. asdfgh, qwerty, zxcvbn, etc.)
  const lower = content.toLowerCase();
  const keyboardMashes = [
    "asdfgh", "qwerty", "zxcvbn", "qazwsx", "lkjhgf", "mnbvcx", "poiuyt"
  ];
  if (keyboardMashes.some(mash => lower.includes(mash))) {
    return {
      valid: false,
      error: "Input terdeteksi sebagai ketikan keyboard acak (keyboard mash). Masukkan pesan atau tautan penipuan yang sesungguhnya."
    };
  }

  // 5. Check for character repetition (4+ identical letters or 6+ identical numbers)
  if (/([a-z])\1{3,}/.test(lower) || /(\d)\1{5,}/.test(lower)) {
    return {
      valid: false,
      error: "Konten terdeteksi memuat pengulangan karakter yang tidak wajar. Masukkan pesan yang valid."
    };
  }

  // 6. Check character diversity (e.g. "asdasdasd", "hahahaha", "lalalalala")
  const uniqueChars = new Set(lower.replace(/\s/g, "")).size;
  if (content.length >= 8 && uniqueChars <= 3) {
    return {
      valid: false,
      error: "Variasi karakter terlalu sedikit atau terdeteksi teks pengujian acak."
    };
  }

  // 7. Check URL format
  const isUrlType = type === "url" ||
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+(\/.*)?$/i.test(content);

  if (isUrlType) {
    // URL cannot contain whitespace
    if (/\s/.test(content)) {
      return {
        valid: false,
        error: "Tautan (URL) tidak boleh mengandung spasi. Pastikan alamat website ditulis dengan lengkap dan benar."
      };
    }

    try {
      const urlToParse = content.includes("://") ? content : `http://${content}`;
      const parsed = new URL(urlToParse);
      const hostParts = parsed.hostname.split(".");
      
      // Must have domain and TLD, and TLD must be valid letters
      if (hostParts.length < 2 || hostParts[hostParts.length - 1].length < 2) {
        return {
          valid: false,
          error: "Format tautan (URL) tidak valid. Contoh yang benar: https://contoh-domain.com"
        };
      }

      // Check if hostname has at least one vowel or valid word
      const hostnameWithoutDots = parsed.hostname.replace(/[^a-z]/g, "");
      if (hostnameWithoutDots.length >= 6) {
        const vowelCount = (hostnameWithoutDots.match(/[aiueo]/g) || []).length;
        if (vowelCount === 0) {
          return {
            valid: false,
            error: "Nama domain terdeteksi acak tanpa susunan kata yang valid."
          };
        }
      }

      return { valid: true, normalizedType: "url" };
    } catch {
      return {
        valid: false,
        error: "Format tautan (URL) tidak valid. Contoh yang benar: https://contoh-domain.com"
      };
    }
  }

  // 8. Text / Message Validation
  // Single word checks
  const words = content.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 1) {
    const singleWord = words[0].toLowerCase();
    
    // Disallow single short words that aren't phone numbers or URLs
    if (singleWord.length < 8) {
      return {
        valid: false,
        error: "Pesan terlalu singkat atau hanya terdiri dari satu kata. Masukkan kalimat lengkap dari percakapan atau SMS mencurigakan."
      };
    }

    // Check vowel ratio in single long word
    const letters = singleWord.replace(/[^a-z]/g, "");
    if (letters.length >= 7) {
      const vowels = (letters.match(/[aiueo]/g) || []).length;
      if (vowels === 0 || (vowels / letters.length) < 0.12) {
        return {
          valid: false,
          error: "Teks tidak dikenali sebagai format pesan atau kata yang bermakna."
        };
      }
    }
  }

  // Minimum length for multi-word text
  if (content.length < 10) {
    return {
      valid: false,
      error: "Pesan terlalu singkat untuk dianalisis (minimal 10 karakter). Masukkan salinan pesan atau SMS mencurigakan secara lengkap."
    };
  }

  return { valid: true, normalizedType: "text" };
}
