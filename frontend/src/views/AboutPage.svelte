<script lang="ts">
  interface Props {
    onNavigateHome: () => void;
  }

  let { onNavigateHome }: Props = $props();
</script>

<div class="w-full max-w-[1000px] mx-auto px-gutter py-12 flex flex-col gap-12">
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
      Tentang Kami
    </span>
  </div>

  <!-- Hero Header -->
  <div class="text-center max-w-2xl mx-auto flex flex-col gap-3">
    <div class="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-primary shadow-inner">
      <span class="material-symbols-outlined text-[36px]">shield_with_heart</span>
    </div>
    <h1 class="text-3xl sm:text-5xl font-extrabold text-brand-indigo-hero tracking-tight">
      Misi Perlindungan Siber Keluarga
    </h1>
    <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
      Penipuan digital di Indonesia berkembang semakin canggih dan masif. Kami percaya pertahanan siber harus dapat diakses oleh semua kalangan, terutama orang tua kita yang paling rentan.
    </p>
  </div>

  <!-- Story Section -->
  <div class="p-8 rounded-3xl bg-white border border-border-subtle shadow-sm flex flex-col gap-6">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-blue-50 text-brand-violet-vibrant flex items-center justify-center">
        <span class="material-symbols-outlined text-[24px]">history_edu</span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-brand-indigo-hero">Latar Belakang &amp; Inisiatif</h2>
        <span class="text-xs text-on-surface-variant">IDwebhost AI HackFest 2026 • Kategori Cyber Security &amp; Anti Scam</span>
      </div>
    </div>

    <p class="text-sm text-on-surface-variant leading-relaxed">
      Berdasarkan laporan Kementerian Kominfo dan kepolisian, kerugian masyarakat Indonesia akibat penipuan online (rekayasa sosial, phising perbankan, dan malware APK) telah menembus puluhan triliun rupiah per tahun. Mayoritas korban adalah orang tua dan lansia yang panik saat menerima ancaman pemblokiran rekening atau tawaran hadiah palsu.
    </p>

    <p class="text-sm text-on-surface-variant leading-relaxed">
      KrosCheck PRO lahir dari kepedulian terhadap situasi tersebut. Alih-alih membuat pemeriksa tautan (*link checker*) biasa yang kaku dan penuh bahasa teknis rumit, kami membangun asisten cerdas yang memposisikan diri sebagai operator siber keluarga: membimbing dengan sabar, membacakan hasil analisa secara suara, dan langsung menyediakan nomor telepon darurat bank saat musibah terlanjur terjadi.
    </p>
  </div>

  <!-- Core Pillars -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="p-6 rounded-2xl bg-surface-container-low border border-border-subtle flex flex-col gap-3">
      <span class="material-symbols-outlined text-primary text-[28px]">accessibility_new</span>
      <h3 class="text-base font-bold text-brand-indigo-hero">Ramah Lansia &amp; Keluarga</h3>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        Antarmuka tanpa istilah teknis asing, skala font hingga 150%, pembacaan suara Web Speech TTS, dan tombol 1-sentuhan untuk membagikan peringatan ke WhatsApp anak/keluarga.
      </p>
    </div>

    <div class="p-6 rounded-2xl bg-surface-container-low border border-border-subtle flex flex-col gap-3">
      <span class="material-symbols-outlined text-status-safe-green text-[28px]">lock</span>
      <h3 class="text-base font-bold text-brand-indigo-hero">Privasi &amp; Zero-Log</h3>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        Seluruh data pribadi (nomor rekening, nomor ponsel, kartu kredit, OTP) disensor otomatis sebelum diproses. Kami tidak menyimpan atau memperjualbelikan riwayat bukti Anda.
      </p>
    </div>

    <div class="p-6 rounded-2xl bg-surface-container-low border border-border-subtle flex flex-col gap-3">
      <span class="material-symbols-outlined text-brand-violet-vibrant text-[28px]">bolt</span>
      <h3 class="text-base font-bold text-brand-indigo-hero">Arsitektur Tangguh &amp; Mandiri</h3>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        Didukung Bun 1.4, Hono, Svelte 5, dan basis data SQLite persisten berkecepatan tinggi, dilengkapi mesin heuristik cadangan yang 100% tahan uji tanpa bergantung koneksi API luar.
      </p>
    </div>
  </div>

  <!-- Tech Stack & Deployment Badge -->
  <div class="p-6 rounded-2xl bg-brand-indigo-hero text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
    <div class="flex flex-col gap-1 text-center sm:text-left">
      <span class="text-xs uppercase tracking-wider text-primary-fixed-dim font-bold">Infrastruktur</span>
      <h4 class="text-base font-bold">Di-host pada IDwebhost Cloud VPS</h4>
      <p class="text-xs text-white/80">
        Performa tinggi, latensi rendah lokal Indonesia, aman, dan siap melayani puluhan ribu permohonan audit siber.
      </p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <span class="px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold">Bun 1.4</span>
      <span class="px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold">Svelte 5</span>
      <span class="px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold">Gemini Flash</span>
    </div>
  </div>
</div>
