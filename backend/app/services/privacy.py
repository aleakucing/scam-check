import re

def mask_sensitive_data(text: str) -> str:
    """
    Masks sensitive personal data (PII) including phone numbers, credit card numbers,
    bank accounts, and OTP/PIN codes according to PRD Section 41.
    """
    if not text:
        return text

    masked = text

    # 1. Mask OTP / PIN patterns (e.g. OTP: 123456, PIN 1234)
    def mask_otp(match):
        prefix = match.group(1)
        digits = match.group(2)
        return f"{prefix}{'*' * len(digits)}"

    masked = re.sub(
        r"(?i)\b(otp\s*[:=]?\s*|pin\s*[:=]?\s*|kode\s*verifikasi\s*[:=]?\s*)(\d{4,6})\b",
        mask_otp,
        masked
    )

    # 2. Mask 16-digit Card Numbers (e.g. 4111 2222 3333 4444 or 4111222233334444)
    def mask_card(match):
        full = match.group(0)
        digits = re.sub(r"\D", "", full)
        if len(digits) == 16:
            if " " in full or "-" in full:
                sep = " " if " " in full else "-"
                return f"{digits[:4]}{sep}****{sep}****{sep}{digits[-4:]}"
            return f"{digits[:4]}********{digits[-4:]}"
        return full

    masked = re.sub(r"\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b", mask_card, masked)

    # 3. Mask Indonesian Mobile Phone Numbers (e.g. 081234567890 or +6281234567890)
    def mask_phone(match):
        phone = match.group(0)
        clean = re.sub(r"[ -]", "", phone)
        if len(clean) >= 10:
            prefix_len = 4 if clean.startswith("+62") else (3 if clean.startswith("62") else 4)
            suffix_len = 2
            stars_count = max(4, len(clean) - prefix_len - suffix_len)
            return f"{clean[:prefix_len]}{'*' * stars_count}{clean[-suffix_len:]}"
        return phone

    masked = re.sub(r"(?:\+62|62|08)(?:[0-9][ -]?){7,11}[0-9]\b", mask_phone, masked)

    # 4. Mask 10-12 digit Bank Account Numbers (standalone numbers)
    def mask_account(match):
        num = match.group(0)
        if 10 <= len(num) <= 12:
            return f"{num[:4]}{'*' * (len(num) - 6)}{num[-2:]}"
        return num

    masked = re.sub(r"\b\d{10,12}\b", mask_account, masked)

    return masked
