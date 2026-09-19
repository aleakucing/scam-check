<script lang="ts">
  interface Props {
    onNavigateHome: () => void;
  }

  let { onNavigateHome }: Props = $props();
</script>

<div class="w-full max-w-[1100px] mx-auto px-gutter py-12 flex flex-col gap-12">
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
    <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
      Multi-Kanal &amp; Aplikasi
    </span>
  </div>

  <!-- Hero Header -->
  <div class="text-center max-w-2xl mx-auto flex flex-col gap-3">
    <div class="w-16 h-16 rounded-full bg-surface-ice-blue mx-auto flex items-center justify-center text-primary shadow-inner">
      <span class="material-symbols-outlined text-[36px]">devices</span>
    </div>
    <h1 class="text-3xl sm:text-5xl font-extrabold text-brand-indigo-hero tracking-tight">
      Akses KrosCheck di Mana Saja
    </h1>
    <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
      Lindungi keluarga Anda dari penipuan digital 24/7. Gunakan KrosCheck langsung melalui Web, Bot WhatsApp, Telegram, maupun dipasang di layar utama ponsel Anda.
    </p>
  </div>

  <!-- Channels Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Channel 1: WhatsApp Bot -->
    <div class="p-6 rounded-3xl bg-white border border-border-subtle shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
        <span class="material-symbols-outlined text-[28px]">chat</span>
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-bold text-brand-indigo-hero">Bot WhatsApp Resmi</h3>
          <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Resmi</span>
        </div>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Cukup teruskan (*forward*) screenshot chat atau link mencurigakan dari grup keluarga ke WhatsApp Bot kami untuk audit instan.
        </p>
      </div>

      <div class="mt-auto pt-4 border-t border-border-subtle flex flex-col gap-2">
        <a
          href="https://wa.me/?text=Halo%20KrosCheck,%20saya%20ingin%20memeriksa%20pesan%20ini"
          target="_blank"
          rel="noreferrer"
          class="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Buka di WhatsApp</span>
          <span class="material-symbols-outlined text-[16px]">arrow_outward</span>
        </a>
        <span class="text-[11px] text-center text-on-surface-variant/70">Tersedia 24 Jam Nonstop</span>
      </div>
    </div>

    <!-- Channel 2: Telegram Bot -->
    <div class="p-6 rounded-3xl bg-white border border-border-subtle shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
        <span class="material-symbols-outlined text-[28px]">send</span>
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-bold text-brand-indigo-hero">Bot Telegram Cerdas</h3>
          <span class="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">Cepat</span>
        </div>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Kirimkan foto surat tilang atau APK ke bot Telegram untuk verifikasi OCR real-time dengan menu keyboard interaktif.
        </p>
      </div>

      <div class="mt-auto pt-4 border-t border-border-subtle flex flex-col gap-2">
        <a
          href="#"
          onclick={(e) => e.preventDefault()}
          title="Bot Telegram segera hadir"
          rel="noreferrer"
          class="w-full py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Buka di Telegram</span>
          <span class="material-symbols-outlined text-[16px]">arrow_outward</span>
        </a>
        <span class="text-[11px] text-center text-on-surface-variant/70">Respon dalam hitungan detik</span>
      </div>
    </div>

    <!-- Channel 3: PWA / Mobile Web App -->
    <div class="p-6 rounded-3xl bg-white border border-border-subtle shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div class="w-12 h-12 rounded-2xl bg-purple-50 text-brand-violet-vibrant flex items-center justify-center">
        <span class="material-symbols-outlined text-[28px]">install_mobile</span>
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-bold text-brand-indigo-hero">Pasang Web App (PWA)</h3>
          <span class="px-2 py-0.5 rounded-full bg-purple-100 text-brand-violet-vibrant text-[10px] font-bold">Ringan</span>
        </div>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Tambahkan KrosCheck ke Layar Utama (*Home Screen*) HP Anda tanpa perlu unduhan berat dari App Store atau Play Store.
        </p>
      </div>

      <div class="mt-auto pt-4 border-t border-border-subtle flex flex-col gap-2">
        <button
          type="button"
          onclick={() => {
            alert('Untuk memasang di ponsel:\n1. Buka menu browser (ikon titik tiga atau tombol bagikan)\n2. Pilih "Tambahkan ke Layar Utama" (Add to Home Screen)');
          }}
          class="w-full py-2.5 rounded-full bg-brand-indigo-hero hover:bg-brand-violet-vibrant text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Cara Pasang di HP</span>
          <span class="material-symbols-outlined text-[16px]">touch_app</span>
        </button>
        <span class="text-[11px] text-center text-on-surface-variant/70">Hemat memori &lt; 1MB</span>
      </div>
    </div>
  </div>

  <!-- QR Code & Quick Scan Zone -->
  <div class="p-8 rounded-3xl bg-surface-ice-blue/60 border border-border-subtle flex flex-col md:flex-row items-center justify-between gap-8">
    <div class="flex flex-col gap-3 max-w-lg text-center md:text-left">
      <span class="text-xs font-bold text-primary uppercase tracking-wider">Akses Cepat Ponsel</span>
      <h2 class="text-2xl font-extrabold text-brand-indigo-hero">
        Pindai Kode QR untuk Membuka di Ponsel
      </h2>
      <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
        Buka kamera ponsel Anda dan arahkan ke kode QR ini untuk langsung mengakses KrosCheck PRO di smartphone keluarga Anda saat membutuhkan verifikasi darurat.
      </p>
      <div class="flex items-center justify-center md:justify-start gap-4 pt-2">
        <div class="flex items-center gap-1 text-xs font-semibold text-brand-indigo-hero">
          <span class="material-symbols-outlined text-status-safe-green text-[18px]">verified</span>
          <span>Gratis</span>
        </div>
        <div class="flex items-center gap-1 text-xs font-semibold text-brand-indigo-hero">
          <span class="material-symbols-outlined text-status-safe-green text-[18px]">verified</span>
          <span>Zero-Log</span>
        </div>
        <div class="flex items-center gap-1 text-xs font-semibold text-brand-indigo-hero">
          <span class="material-symbols-outlined text-status-safe-green text-[18px]">verified</span>
          <span>Tanpa Akun</span>
        </div>
      </div>
    </div>

    <!-- Stylized QR Code Visual -->
    <div class="w-40 h-40 rounded-2xl bg-white p-3 shadow-md flex items-center justify-center shrink-0 border border-border-subtle">
      <span class="text-xs font-bold text-center text-on-surface-variant px-2">Buka di browser smartphone:<br/><span class="text-primary mt-1 block">kroscheck.id</span></span>
    </div>
  </div>
</div>
