/**
 * Masks sensitive personal data (PII) including phone numbers, credit card numbers,
 * bank accounts, and OTP/PIN codes according to PRD Section 41.
 */
export function maskSensitiveData(text: string): string {
  if (!text) return text;

  let masked = text;

  // 1. Mask OTP / PIN patterns (e.g. OTP: 123456, PIN 1234)
  masked = masked.replace(
    /\b(otp\s*[:=]?\s*|pin\s*[:=]?\s*|kode\s*verifikasi\s*[:=]?\s*)(\d{4,6})\b/gi,
    (_match, prefix, digits) => {
      return `${prefix}${"*".repeat(digits.length)}`;
    }
  );

  // 2. Mask 16-digit Card Numbers (e.g. 4111 2222 3333 4444 or 4111222233334444)
  masked = masked.replace(
    /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
    (match) => {
      const digits = match.replace(/\D/g, "");
      if (digits.length === 16) {
        if (match.includes(" ") || match.includes("-")) {
          const sep = match.includes(" ") ? " " : "-";
          return `${digits.slice(0, 4)}${sep}****${sep}****${sep}${digits.slice(-4)}`;
        }
        return `${digits.slice(0, 4)}********${digits.slice(-4)}`;
      }
      return match;
    }
  );

  // 3. Mask Indonesian Mobile Phone Numbers (e.g. 081234567890 or +6281234567890)
  masked = masked.replace(
    /(?:\+62|62|08)(?:[0-9][ -]?){7,11}[0-9]\b/g,
    (match) => {
      const clean = match.replace(/[ -]/g, "");
      if (clean.length >= 10) {
        const prefixLen = clean.startsWith("+62") ? 4 : clean.startsWith("62") ? 3 : 4;
        const suffixLen = 2;
        const starsCount = Math.max(4, clean.length - prefixLen - suffixLen);
        return `${clean.slice(0, prefixLen)}${"*".repeat(starsCount)}${clean.slice(-suffixLen)}`;
      }
      return match;
    }
  );

  // 4. Mask 10-12 digit Bank Account Numbers (standalone numbers)
  masked = masked.replace(/\b\d{10,12}\b/g, (match) => {
    if (match.length >= 10 && match.length <= 12) {
      return `${match.slice(0, 4)}${"*".repeat(match.length - 6)}${match.slice(-2)}`;
    }
    return match;
  });

  return masked;
}
