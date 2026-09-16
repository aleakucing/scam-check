from typing import List
from ..models.schemas import InterviewRequest, InterviewResponse, ActionItem

def evaluate_exposure(req: InterviewRequest) -> InterviewResponse:
    exposure = 10
    is_emergency = False
    exposure_level = "PAPARAN MINIMAL"
    status_desc = "Anda baru menerima pesan dan belum berinteraksi lanjut."
    emergency_title = "Langkah Pencegahan (Normal)"
    emergency_subtitle = "Tingkat paparan akun masih rendah. Amankan perangkat Anda dengan langkah berikut:"

    # Evaluation logic based on answers
    if req.opened_link is False:
        exposure = 10
        exposure_level = "PAPARAN MINIMAL"
        status_desc = "Tautan belum dibuka. Risiko paparan akun saat ini berada pada level aman."
    elif req.opened_link is True:
        exposure = 35
        exposure_level = "MEDIUM EXPOSURE"
        status_desc = "Tautan sempat dibuka, namun belum ada kredensial atau formulir yang diisi."
        
        if req.entered_credentials is False:
            exposure = 35
            exposure_level = "MEDIUM EXPOSURE"
            status_desc = "Tautan dibuka, namun data kredensial tidak dimasukkan."
        elif req.entered_credentials is True:
            exposure = 70
            exposure_level = "HIGH EXPOSURE"
            is_emergency = True
            status_desc = "Password atau kredensial akun telah dimasukkan pada formulir tidak resmi!"
            
            if req.entered_otp is True:
                exposure = 90
                exposure_level = "CRITICAL EXPOSURE"
                is_emergency = True
                status_desc = "Kredensial dan kode OTP/SMS telah diserahkan ke pihak tidak resmi! Akun terancam pengambilalihan (Account Takeover)."
            elif req.entered_otp is False:
                exposure = 70
                exposure_level = "HIGH EXPOSURE"
                is_emergency = True
                status_desc = "Password telah diserahkan, namun penyerahan OTP berhasil digagalkan."

    # Build action items based on emergency status
    if is_emergency:
        emergency_title = "Tindakan Penyelamatan Darurat (Segera)"
        emergency_subtitle = "Data otentikasi telah diberikan pada tautan mencurigakan. Lakukan pengamanan akun berikut sekarang:"
        actions = [
            ActionItem(
                step=1,
                title="Tolak seluruh konfirmasi OTP yang masuk ke perangkat Anda",
                desc="Pelaku sedang mencoba mengautentikasi sesi baru. Jangan setujui notifikasi transaksi apapun.",
                is_urgent=True
            ),
            ActionItem(
                step=2,
                title="Kunci sementara rekening atau kartu debit/kredit",
                desc="Gunakan menu Pengaturan Kartu pada aplikasi mobile banking resmi untuk memblokir transaksi keluar.",
                is_urgent=True
            ),
            ActionItem(
                step=3,
                title="Ubah password dari kanal resmi yang terpercaya",
                desc="Segera lakukan reset password dan PIN transaksi hanya melalui aplikasi atau situs resmi perbankan.",
                is_urgent=True
            ),
            ActionItem(
                step=4,
                title="Hubungi pusat kontak resmi institusi terkait",
                desc="Halo BCA (1500888), Mandiri Call (14000), Kontak BRI (14017), BNI Call (1500046).",
                is_urgent=False
            )
        ]
    else:
        actions = [
            ActionItem(
                step=1,
                title="Jangan membuka atau menyebarkan tautan tersebut",
                desc="Hapus atau tandai percakapan sebagai spam untuk mencegah akses tidak disengaja oleh orang lain.",
                is_urgent=False
            ),
            ActionItem(
                step=2,
                title="Konfirmasi informasi melalui kanal resmi",
                desc="Kunjungi website resmi institusi secara mandiri untuk memverifikasi program promo atau pemberitahuan.",
                is_urgent=False
            ),
            ActionItem(
                step=3,
                title="Simpan dokumen kasus sebagai catatan bukti",
                desc="Gunakan ringkasan laporan kasus ScamGuard bila sewaktu-waktu diperlukan pelaporan aduan resmi ke pihak berwajib.",
                is_urgent=False
            )
        ]

    return InterviewResponse(
        case_id=req.case_id,
        user_exposure=exposure,
        exposure_level=exposure_level,
        is_emergency=is_emergency,
        status_desc=status_desc,
        emergency_title=emergency_title,
        emergency_subtitle=emergency_subtitle,
        actions=actions
    )
