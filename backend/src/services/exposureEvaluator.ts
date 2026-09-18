export interface ActionItem {
  step: number;
  title: string;
  desc: string;
  is_urgent: boolean;
}

export interface InterviewInput {
  case_id: string;
  content_risk?: number;
  opened_link?: boolean | null;
  entered_credentials?: boolean | null;
  entered_otp?: boolean | null;
}

export interface InterviewResult {
  case_id: string;
  user_exposure: number;
  exposure_level: string;
  is_emergency: boolean;
  status_desc: string;
  emergency_title: string;
  emergency_subtitle: string;
  actions: ActionItem[];
  recommended_actions?: ActionItem[];
}

export function evaluateExposure(req: InterviewInput): InterviewResult {
  let exposure = 10;
  let isEmergency = false;
  let exposureLevel = "PAPARAN MINIMAL";
  let statusDesc = "Anda baru menerima pesan dan belum berinteraksi lanjut.";
  let emergencyTitle = "Langkah Pencegahan (Normal)";
  let emergencySubtitle = "Tingkat paparan akun masih rendah. Amankan perangkat Anda dengan langkah berikut:";

  if (req.opened_link === false) {
    exposure = 10;
    exposureLevel = "PAPARAN MINIMAL";
    statusDesc = "Tautan belum dibuka. Risiko paparan akun saat ini berada pada level aman.";
  } else if (req.opened_link === true) {
    exposure = 35;
    exposureLevel = "MEDIUM EXPOSURE";
    statusDesc = "Tautan sempat dibuka, namun belum ada kredensial atau formulir yang diisi.";

    if (req.entered_credentials === false) {
      exposure = 35;
      exposureLevel = "MEDIUM EXPOSURE";
      statusDesc = "Tautan dibuka, namun data kredensial tidak dimasukkan.";
    } else if (req.entered_credentials === true) {
      exposure = 70;
      exposureLevel = "HIGH EXPOSURE";
      isEmergency = true;
      statusDesc = "Password atau kredensial akun telah dimasukkan pada formulir tidak resmi!";

      if (req.entered_otp === true) {
        exposure = 90;
        exposureLevel = "CRITICAL EXPOSURE";
        isEmergency = true;
        statusDesc = "Kredensial dan kode OTP/SMS telah diserahkan ke pihak tidak resmi! Akun terancam pengambilalihan (Account Takeover).";
      } else if (req.entered_otp === false) {
        exposure = 70;
        exposureLevel = "HIGH EXPOSURE";
        isEmergency = true;
        statusDesc = "Password telah diserahkan, namun penyerahan OTP berhasil digagalkan.";
      }
    }
  }

  let actions: ActionItem[] = [];

  if (isEmergency) {
    emergencyTitle = "Tindakan Penyelamatan Darurat (Segera)";
    emergencySubtitle = "Data otentikasi telah diberikan pada tautan mencurigakan. Lakukan pengamanan akun berikut sekarang:";
    actions = [
      {
        step: 1,
        title: "Tolak seluruh konfirmasi OTP yang masuk ke perangkat Anda",
        desc: "Pelaku sedang mencoba mengautentikasi sesi baru. Jangan setujui notifikasi transaksi apapun.",
        is_urgent: true
      },
      {
        step: 2,
        title: "Kunci sementara rekening atau kartu debit/kredit",
        desc: "Gunakan menu Pengaturan Kartu pada aplikasi mobile banking resmi untuk memblokir transaksi keluar.",
        is_urgent: true
      },
      {
        step: 3,
        title: "Ubah password dari kanal resmi yang terpercaya",
        desc: "Segera lakukan reset password dan PIN transaksi hanya melalui aplikasi atau situs resmi perbankan.",
        is_urgent: true
      },
      {
        step: 4,
        title: "Hubungi pusat kontak resmi institusi terkait",
        desc: "Halo BCA (1500888), Mandiri Call (14000), Kontak BRI (14017), BNI Call (1500046).",
        is_urgent: false
      }
    ];
  } else {
    actions = [
      {
        step: 1,
        title: "Jangan membuka atau menyebarkan tautan tersebut",
        desc: "Hapus atau tandai percakapan sebagai spam untuk mencegah akses tidak disengaja oleh orang lain.",
        is_urgent: false
      },
      {
        step: 2,
        title: "Konfirmasi informasi melalui kanal resmi",
        desc: "Kunjungi website resmi institusi secara mandiri untuk memverifikasi program promo atau pemberitahuan.",
        is_urgent: false
      },
      {
        step: 3,
        title: "Simpan dokumen kasus sebagai catatan bukti",
        desc: "Gunakan ringkasan laporan kasus ScamGuard bila sewaktu-waktu diperlukan pelaporan aduan resmi ke pihak berwajib.",
        is_urgent: false
      }
    ];
  }

  return {
    case_id: req.case_id,
    user_exposure: exposure,
    exposure_level: exposureLevel,
    is_emergency: isEmergency,
    status_desc: statusDesc,
    emergency_title: emergencyTitle,
    emergency_subtitle: emergencySubtitle,
    actions: actions,
    recommended_actions: actions
  };
}
