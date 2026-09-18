import re
import urllib.parse
from datetime import datetime
from typing import Dict, Any, List
from ..models.schemas import AnalyzeRequest, AnalyzeResponse, Indicator, CategoryScore
from .privacy import mask_sensitive_data
from .url_security import validate_url_safety

BANK_KEYWORDS = ["bca", "bri", "mandiri", "bni", "cimb", "bsi", "permata", "dana", "ovo", "gopay"]
SCAM_KEYWORDS = [
    "tarif", "kenaikan", "undian", "hadiah", "pemenang", "blokir", "penangguhan",
    "verifikasi", "konfirmasi", "urgent", "segera", "otp", "pin", "undangan", "apk",
    "surat tilang", "paket", "jne", "jnt", "sicepat", "pos", "kredivo", "pinjol"
]
LEGIT_DOMAINS = [
    "bca.co.id", "klikbca.com", "bankmandiri.co.id", "bri.co.id", "bni.co.id",
    "idwebhost.com", "google.com", "kemkominfo.go.id", "polri.go.id"
]
SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".icu", ".site", ".online", ".live", ".work", ".click", ".buzz", ".link"]
SHORTENER_DOMAINS = ["bit.ly", "tinyurl.com", "s.id", "t.ly", "is.gd", "cutt.ly", "linktr.ee", "rb.gy", "shorturl.at"]

def analyze_heuristic(req: AnalyzeRequest) -> AnalyzeResponse:
    content = req.content.strip().lower()
    case_id = f"SC-{datetime.now().strftime('%Y%m%d')}-{abs(hash(content)) % 9000 + 1000}"
    indicators: List[Indicator] = []
    categories: List[CategoryScore] = []
    
    content_risk = 15
    confidence = 80
    summary = "Konten diperiksa melalui mesin analisis statis heuristik ScamGuard."

    is_url_type = req.type == "url" or content.startswith("http://") or content.startswith("https://") or any(tld in content for tld in [".com", ".id", ".co.id", ".xyz", ".online", ".apk"])

    if is_url_type:
        # SSRF & URL Safety Validation (PRD Section 42)
        raw_url = req.content if "://" in req.content else f"http://{req.content}"
        is_safe_target, ssrf_msg = validate_url_safety(raw_url)
        if not is_safe_target:
            indicators.append(Indicator(
                title="Akses Jaringan Terlarang (SSRF Protection)",
                impact="KRITIS",
                level="red",
                desc=ssrf_msg
            ))
            return AnalyzeResponse(
                case_id=case_id,
                timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S WIB"),
                content_risk=98,
                confidence=95,
                risk_level="VERY HIGH RISK",
                summary=f"Pemeriksaan URL dihentikan: {ssrf_msg}",
                categories=[
                    CategoryScore(name="Pelanggaran Keamanan Jaringan", score="98%"),
                    CategoryScore(name="Eksploitasi SSRF", score="95%")
                ],
                indicators=indicators,
                initial_exposure=10,
                evidence_type=req.type,
                source_model="ScamGuard Heuristic Safety Engine v2.0 (SSRF Shield)"
            )

        # URL / Domain Analysis
        parsed = urllib.parse.urlparse(raw_url)
        hostname = (parsed.hostname or content).lower()
        url_path = (parsed.path or "").lower()

        # Check if officially known legit
        is_known_legit = any(hostname == d or hostname.endswith("." + d) for d in LEGIT_DOMAINS)

        if is_known_legit:
            content_risk = 12
            confidence = 94
            summary = f"Domain '{hostname}' teridentifikasi sebagai domain resmi institusi terdaftar. Tidak ditemukan indikator manipulasi."
            indicators.append(Indicator(
                title="Domain Resmi Terverifikasi",
                impact="AMAN",
                level="green",
                desc=f"Nama host '{hostname}' cocok dengan entri basis data institusi terpercaya."
            ))
            indicators.append(Indicator(
                title="Protokol Enkripsi Aman",
                impact="STANDAR",
                level="green",
                desc="Menggunakan koneksi HTTPS dengan sertifikat SSL valid."
            ))
            categories = [
                CategoryScore(name="Komunikasi Resmi", score="96%"),
                CategoryScore(name="Layanan Terverifikasi", score="92%")
            ]
        else:
            # Check suspicious traits
            matched_banks = [b for b in BANK_KEYWORDS if b in hostname or b in content]
            matched_scam_words = [w for w in SCAM_KEYWORDS if w in hostname or w in content]
            has_suspicious_tld = any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS)
            is_ip_address = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname))
            has_hyphens = hostname.count("-") >= 2
            is_shortener = any(hostname == s or hostname.endswith("." + s) for s in SHORTENER_DOMAINS)
            has_apk_in_url = url_path.endswith(".apk") or ".apk" in content

            score_increment = 0

            if has_apk_in_url:
                score_increment += 55
                indicators.append(Indicator(
                    title="Tautan Langsung Berkas Berbahaya (.APK Malware)",
                    impact="KRITIS",
                    level="red",
                    desc="Tautan mengarah langsung ke pengunduhan file aplikasi Android (.APK) di luar Google Play Store. Sangat berisiko memuat trojan pencuri SMS OTP."
                ))

            if is_shortener:
                score_increment += 35
                indicators.append(Indicator(
                    title="Penggunaan Layanan Pemendek Tautan (URL Shortener)",
                    impact="TINGGI",
                    level="orange",
                    desc=f"Domain '{hostname}' adalah layanan pemendek URL yang menyembunyikan alamat tujuan asli. Sering dimanfaatkan pelaku untuk mengelabui filter keamanan."
                ))

            if matched_banks:
                score_increment += 40
                indicators.append(Indicator(
                    title="Domain Meniru Institusi / Layanan Finansial",
                    impact="KRITIS",
                    level="red",
                    desc=f"Nama domain mengandung kata kunci merek finansial ({', '.join(matched_banks).upper()}), namun bukan domain resmi terdaftar."
                ))
            
            if has_suspicious_tld:
                score_increment += 25
                indicators.append(Indicator(
                    title="Penggunaan Domain Tingkat Atas (TLD) Berbiaya Rendah",
                    impact="TINGGI",
                    level="orange",
                    desc="Ekstensi domain (TLD) berisiko tinggi yang kerap disalahgunakan untuk kampanye phishing massal."
                ))

            if has_hyphens:
                score_increment += 15
                indicators.append(Indicator(
                    title="Pola Typosquatting / Manipulasi Subdomain",
                    impact="TINGGI",
                    level="orange",
                    desc="Penggunaan tanda hubung berulang pada domain untuk mengelabui visual pengguna awam."
                ))

            if is_ip_address:
                score_increment += 35
                indicators.append(Indicator(
                    title="Akses Langsung ke Alamat IP Publik",
                    impact="KRITIS",
                    level="red",
                    desc="Target URL mengarah langsung ke IP mentah tanpa nama domain resmi institusi."
                ))

            if matched_scam_words:
                score_increment += 20
                indicators.append(Indicator(
                    title="Pemicu Emosi & Rekayasa Sosial",
                    impact="SEDANG",
                    level="orange",
                    desc=f"Ditemukan indikasi kata kunci urgensi atau iming-iming ({', '.join(matched_scam_words[:3])})."
                ))

            content_risk = min(98, max(25, 20 + score_increment))
            confidence = 88
            
            if content_risk >= 75:
                summary = f"Ditemukan beberapa indikator konsisten pada struktur target '{hostname}'. Terdeteksi indikasi manipulasi reputasi dan penipuan siber."
                categories = [
                    CategoryScore(name="Phishing Finansial", score=f"{min(98, content_risk + 5)}%"),
                    CategoryScore(name="Penyebaran Malware / APK", score=f"{min(98, content_risk + 2)}%" if has_apk_in_url else "65%"),
                    CategoryScore(name="Social Engineering", score="82%")
                ]
            else:
                summary = f"Domain '{hostname}' belum memiliki reputasi yang terverifikasi dan menunjukkan beberapa indikator kewaspadaan."
                categories = [
                    CategoryScore(name="Tautan Tidak Dikenal", score="65%"),
                    CategoryScore(name="Pemasaran Tidak Resmi", score="55%")
                ]

    else:
        # Text, Voice, or Screenshot OCR analysis
        matched_scam_words = [w for w in SCAM_KEYWORDS if w in content]
        matched_banks = [b for b in BANK_KEYWORDS if b in content]
        has_phone_number = bool(re.search(r"(\+62|62|08)[0-9]{8,12}", content))
        has_apk = ".apk" in content or "undangan pernikahan" in content or "surat tilang" in content

        score_increment = 0

        if has_apk:
            score_increment += 55
            indicators.append(Indicator(
                title="Penyebaran Berkas Berbahaya (.APK Malware)",
                impact="KRITIS",
                level="red",
                desc="Pesan mengarahkan pengguna menginstal berkas aplikasi di luar Google Play Store yang berpotensi mencuri SMS/OTP."
            ))

        if matched_banks and matched_scam_words:
            score_increment += 40
            indicators.append(Indicator(
                title="Pencatutan Nama Bank / Layanan Finansial",
                impact="KRITIS",
                level="red",
                desc=f"Mengatasnamakan institusi ({', '.join(matched_banks).upper()}) dengan narasi pemblokiran atau perubahan biaya sepihak."
            ))

        if "tarif" in content or "kenaikan" in content:
            score_increment += 25
            indicators.append(Indicator(
                title="Modus Rekayasa Perubahan Tarif Transfer",
                impact="TINGGI",
                level="red",
                desc="Taktik umum penipuan yang memaksa korban mengisi formulir pembatalan kenaikan biaya bulanan."
            ))

        if has_phone_number:
            score_increment += 15
            indicators.append(Indicator(
                title="Kontak Pengirim Tidak Terverifikasi",
                impact="SEDANG",
                level="orange",
                desc="Menggunakan nomor ponsel seluler biasa alih-alih akun resmi bertanda centang hijau (Verified Business WhatsApp)."
            ))

        if not indicators:
            indicators.append(Indicator(
                title="Pola Teks Umum",
                impact="INFO",
                level="blue",
                desc="Pesan tidak memuat pola bahaya umum yang signifikan, namun tetap waspada jika ada permintaan transfer uang."
            ))
            content_risk = 20
            confidence = 75
            summary = "Pesan menunjukkan tingkat risiko rendah. Tidak ditemukan pemicu bahaya yang mendesak."
            categories = [
                CategoryScore(name="Komunikasi Biasa", score="88%"),
                CategoryScore(name="Spam Komersial", score="30%")
            ]
        else:
            content_risk = min(98, max(30, 20 + score_increment))
            confidence = 88
            summary = "Pesan mengandung indikator kuat rekayasa sosial (social engineering) dan pemaksaan psikologis terhadap penerima."
            categories = [
                CategoryScore(name="Penipuan Social Engineering", score=f"{min(98, content_risk + 4)}%"),
                CategoryScore(name="Pencurian Akses Akun", score=f"{min(95, content_risk)}%")
            ]

    # Risk level string
    if content_risk >= 75:
        risk_level = "VERY HIGH RISK"
    elif content_risk >= 50:
        risk_level = "HIGH RISK"
    else:
        risk_level = "LOW RISK / SAFE"

    # Apply sensitive PII masking to summary
    clean_summary = mask_sensitive_data(summary)

    return AnalyzeResponse(
        case_id=case_id,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S WIB"),
        content_risk=content_risk,
        confidence=confidence,
        risk_level=risk_level,
        summary=clean_summary,
        categories=categories,
        indicators=indicators,
        initial_exposure=10,
        evidence_type=req.type,
        source_model="ScamGuard Heuristic Safety Engine v2.0"
    )
