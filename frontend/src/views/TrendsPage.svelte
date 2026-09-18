<script lang="ts">
  import type { EvidenceType } from "../types";

  interface Props {
    onNavigateHome: () => void;
    onTestScenario: (content: string, type: EvidenceType) => void;
  }

  let { onNavigateHome, onTestScenario }: Props = $props();

  const trends = [
    {
      id: "bca-tarif",
      title: "Kenaikan Tarif Transaksi Bank BCA",
      category: "Perbankan / Phishing",
      level: "KRITIS",
      levelColor: "bg-status-scam-red text-white",
      target: "Nasabah BCA & Pengguna m-BCA",
      desc: "Pelaku mengirim surat pengumuman palsu bahwa tarif transfer antar-bank naik menjadi Rp150.000/bulan. Korban diminta menekan link untuk 'menolak kenaikan tarif', yang berujung ke web tiruan untuk mencuri nomor kartu dan OTP.",
      sampleContent: "Pemberitahuan Resmi Bank BCA: Perubahan tarif transfer antar bank menjadi Rp 150.000 per bulan. Jika tidak setuju, silakan batalkan di tautan berikut: https://id-bca-verifikasi-keamanan.xyz/login",
      type: "url" as EvidenceType
    },
    {
      id: "etle-apk",
      title: "Surat Tilang Elektronik (ETLE) Palsu",
      category: "Malware .APK",
      level: "KRITIS",
      levelColor: "bg-status-scam-red text-white",
      target: "Pengemudi & Pemilik Kendaraan",
      desc: "Pesan WhatsApp dari nomor tak dikenal mencatut Kepolisian RI, mengklaim nomor plat kendaraan melanggar aturan, dan melampirkan file 'Surat_Tilang_ETLE.apk' yang mencuri seluruh isi SMS perbankan.",
      sampleContent: "Pemberitahuan ETLE: Kendaraan Anda tertangkap kamera melanggar marka jalan. Silakan unduh bukti tilang pada berkas Surat_Tilang_ETLE.apk berikut: https://tilang-etle-polri.top/download",
      type: "url" as EvidenceType
    },
    {
      id: "undangan-apk",
      title: "Undangan Pernikahan Digital (.APK)",
      category: "Malware .APK / Social Eng",
      level: "KRITIS",
      levelColor: "bg-status-scam-red text-white",
      target: "Masyarakat Umum & Grup WA Keluarga",
      desc: "Pelaku mengirim berkas aplikasi dengan ikon surat undangan dan meminta penerima membukanya untuk melihat lokasi resepsi, yang ternyata menginstal spyware pembaca OTP SMS.",
      sampleContent: "Halo kami mengundang Anda ke acara pernikahan kami, silakan buka undangan digital: https://bit.ly/Surat-Undangan-Pernikahan-Digital.apk",
      type: "url" as EvidenceType
    },
    {
      id: "mandiri-livin",
      title: "Phishing Pemblokiran Livin' by Mandiri",
      category: "Perbankan / Kredensial",
      level: "TINGGI",
      levelColor: "bg-amber-500 text-white",
      target: "Nasabah Bank Mandiri",
      desc: "Pesan SMS peringatan bahwa akun mobile banking Anda akan dibekukan karena tidak melakukan pembaruan data sebelum pukul 24.00, mengarahkan korban ke formulir pencuri PIN 6-digit.",
      sampleContent: "PERINGATAN: Akun Livin Mandiri Anda terindikasi login di perangkat tidak dikenal. Segera konfirmasi pembatalan blokir akun di: https://livin-mandiri-verifikasi.xyz",
      type: "url" as EvidenceType
    },
    {
      id: "paket-kurir",
      title: "Resi Kurir Paket Ekspedisi J&T / JNE",
      category: "Malware .APK / Kurir",
      level: "TINGGI",
      levelColor: "bg-amber-500 text-white",
      target: "Pelanggan Belanja Online",
      desc: "Mengaku sebagai kurir pengantar paket yang tidak menemukan alamat rumah dan meminta korban mengecek foto resi paket dalam format berkas APK.",
      sampleContent: "Selamat siang kak, saya kurir J&T paket kakak tertahan di gudang karena alamat tidak jelas. Mohon cek foto paket di file LIHAT_FOTO_PAKET.apk berikut.",
      type: "text" as EvidenceType
    },
    {
      id: "undian-palsu",
      title: "Undian Berhadiah Mengatasnamakan BUMN",
      category: "Rekayasa Sosial",
      level: "SEDANG",
      levelColor: "bg-blue-600 text-white",
      target: "Masyarakat Umum & Lansia",
      desc: "Pesan ucapan selamat memenangkan hadiah uang tunai ratusan juta rupiah dengan syarat mentransfer biaya administrasi atau pajak pemenang terlebih dahulu.",
      sampleContent: "Selamat! Nomor Anda terpilih memenangkan Grand Prize Rp 175 Juta dari Gebyar BUMN 2026. Hubungi WhatsApp Bendahara untuk pencairan dana.",
      type: "text" as EvidenceType
    }
  ];
</script>

<div class="w-full max-w-[1100px] mx-auto px-gutter py-12 flex flex-col gap-10">
  <!-- Breadcrumb & Back button -->
  <div class="flex items-center justify-between">
    <button
      type="button"
      onclick={onNavigateHome}
      class="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-brand-violet-hover transition-colors cursor-pointer"
    >
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      <span>Kembali ke Beranda</span>
    </button>
    <span class="px-3 py-1 rounded-full bg-status-scam-bg text-status-scam-red text-xs font-bold uppercase tracking-wider">
      Papan Ancaman Siber Aktif
    </span>
  </div>

  <!-- Header -->
  <div class="text-center max-w-2xl mx-auto flex flex-col gap-3">
    <div class="w-16 h-16 rounded-full bg-status-scam-bg mx-auto flex items-center justify-center text-status-scam-red shadow-inner">
      <span class="material-symbols-outlined text-[36px]">security_update_warning</span>
    </div>
    <h1 class="text-3xl sm:text-5xl font-extrabold text-brand-indigo-hero tracking-tight">
      Tren Penipuan Siber di Indonesia
    </h1>
    <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
      Pantauan modus kejahatan rekayasa sosial, tautan phising, dan dokumen APK perusak yang paling sering memakan korban dalam beberapa bulan terakhir.
    </p>
  </div>

  <!-- Trends Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each trends as item}
      <div class="p-6 rounded-3xl bg-white border border-border-subtle shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
        <!-- Top Badges -->
        <div class="flex items-center justify-between gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider {item.levelColor}">
            {item.level}
          </span>
          <span class="text-[11px] font-bold text-on-surface-variant/70">
            {item.category}
          </span>
        </div>

        <!-- Title & Target -->
        <div class="flex flex-col gap-1">
          <h3 class="text-base font-bold text-brand-indigo-hero group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <span class="text-[11px] text-primary font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">person_alert</span>
            Target: {item.target}
          </span>
        </div>

        <!-- Description -->
        <p class="text-xs text-on-surface-variant leading-relaxed">
          {item.desc}
        </p>

        <!-- Sample Preview Snippet -->
        <div class="p-2.5 rounded-xl bg-surface-container-low border border-border-subtle/80 text-[11px] font-mono text-on-surface-variant/90 break-all leading-relaxed">
          {item.sampleContent}
        </div>

        <!-- 1-Click Test Button -->
        <div class="mt-auto pt-2">
          <button
            type="button"
            onclick={() => onTestScenario(item.sampleContent, item.type)}
            class="w-full py-2.5 px-4 rounded-full bg-brand-indigo-hero hover:bg-brand-violet-vibrant text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <span class="material-symbols-outlined text-[16px]">play_arrow</span>
            <span>Uji Kasus Ini Sekarang</span>
          </button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Educational Alert -->
  <div class="p-6 rounded-3xl bg-status-scam-bg/60 border border-status-scam-red/20 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-start gap-3">
      <span class="material-symbols-outlined text-status-scam-red text-[28px] mt-0.5">warning</span>
      <div class="flex flex-col gap-0.5">
        <h4 class="text-sm font-bold text-status-scam-red">Penting: Jangan Pernah Menginstal Berkas .APK dari WhatsApp</h4>
        <p class="text-xs text-on-surface-variant">
          Pihak kepolisian, perbankan, dan ekspedisi resmi di Indonesia tidak pernah mengirimkan berkas aplikasi melalui chat pribadi.
        </p>
      </div>
    </div>
    <button
      type="button"
      onclick={onNavigateHome}
      class="px-5 py-2 rounded-full bg-brand-indigo-hero text-white text-xs font-bold hover:bg-brand-violet-vibrant transition-all cursor-pointer shrink-0"
    >
      Periksa Pesan Lain
    </button>
  </div>
</div>
