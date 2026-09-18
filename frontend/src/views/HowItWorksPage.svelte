<script lang="ts">
  interface Props {
    onNavigateHome: () => void;
  }

  let { onNavigateHome }: Props = $props();
</script>

<div class="w-full max-w-[1200px] mx-auto px-gutter py-12 flex flex-col gap-12">
  <!-- Breadcrumb & Back button -->
  <div class="flex items-center justify-between">
    <button
      type="button"
      onclick={onNavigateHome}
      class="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-brand-violet-hover transition-colors cursor-pointer"
    >
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      <span>Kembali ke Pemeriksaan</span>
    </button>
    <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
      Cara Kerja
    </span>
  </div>

  <!-- Hero Header -->
  <div class="text-center max-w-2xl mx-auto flex flex-col gap-4">
    <div class="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-brand-violet-vibrant shadow-inner">
      <span class="material-symbols-outlined text-[36px]">manage_search</span>
    </div>
    <h1 class="text-3xl sm:text-5xl font-extrabold text-brand-indigo-hero tracking-tight leading-tight">
      Bagaimana KrosCheck Bekerja
    </h1>
    <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
      Sistem intelijen kami menganalisis setiap detail mencurigakan secara multidimensi, menggabungkan heuristik siber nasional dan AI multimodal untuk memberikan vonis cepat serta panduan langkah penyelamatan.
    </p>
  </div>

  <!-- 4-Step Process Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Step 1 -->
    <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm flex flex-col gap-4 relative overflow-hidden">
      <div class="w-10 h-10 rounded-full bg-brand-indigo-hero text-white text-sm font-extrabold flex items-center justify-center">
        1
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-bold text-brand-indigo-hero">Pemasukan Bukti Multimodal</h3>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Unggah tangkapan layar chat WA/SMS, tempel tautan mencurigakan, masukkan transkrip suara, atau tuliskan kronologi yang Anda alami.
        </p>
      </div>
      <div class="mt-auto pt-3 border-t border-border-subtle text-[11px] font-semibold text-primary flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">photo_camera</span>
        <span>Mendukung OCR gambar instan</span>
      </div>
    </div>

    <!-- Step 2 -->
    <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm flex flex-col gap-4 relative overflow-hidden">
      <div class="w-10 h-10 rounded-full bg-brand-violet-vibrant text-white text-sm font-extrabold flex items-center justify-center">
        2
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-bold text-brand-indigo-hero">Sensor Privasi PII &amp; Sandboxing</h3>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Sebelum dievaluasi, nomor kartu bank 16-digit, nomor HP, dan kode OTP otomatis disensor (*Client-Side Masking*). Tautan diuji di lingkungan terisolasi anti-SSRF.
        </p>
      </div>
      <div class="mt-auto pt-3 border-t border-border-subtle text-[11px] font-semibold text-status-safe-green flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">lock</span>
        <span>Privasi Zero-Log terjamin</span>
      </div>
    </div>

    <!-- Step 3 -->
    <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm flex flex-col gap-4 relative overflow-hidden">
      <div class="w-10 h-10 rounded-full bg-secondary text-white text-sm font-extrabold flex items-center justify-center">
        3
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-bold text-brand-indigo-hero">Analisis Heuristik &amp; AI</h3>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Basis data intelijen siber Indonesia memeriksa pola pemalsuan institusi (BCA, Mandiri, BRI), manipulasi urgensi waktu, dan tanda malware file .APK.
        </p>
      </div>
      <div class="mt-auto pt-3 border-t border-border-subtle text-[11px] font-semibold text-primary flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">psychology</span>
        <span>Google Gemini + Fallback Engine</span>
      </div>
    </div>

    <!-- Step 4 -->
    <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm flex flex-col gap-4 relative overflow-hidden">
      <div class="w-10 h-10 rounded-full bg-status-scam-red text-white text-sm font-extrabold flex items-center justify-center">
        4
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-bold text-brand-indigo-hero">Respon Cepat &amp; Mitigasi</h3>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Sistem menyajikan skor risiko 3D (*Content Risk, Confidence, Exposure*), hotline darurat perbankan 1-sentuhan, serta format laporan polisi/bank ber-kop resmi.
        </p>
      </div>
      <div class="mt-auto pt-3 border-t border-border-subtle text-[11px] font-semibold text-status-scam-red flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">emergency</span>
        <span>Direct dial HaloBCA 1500888</span>
      </div>
    </div>
  </div>

  <!-- Deep Dive Showcase: Matriks 3-Dimensi -->
  <div class="p-8 rounded-3xl bg-brand-indigo-hero text-white flex flex-col gap-8 shadow-xl">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <span class="text-xs font-bold text-primary-fixed-dim uppercase tracking-wider">Inovasi Khusus</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
          Penilaian Risiko Tiga Dimensi (3D Risk Matrix)
        </h2>
      </div>
      <span class="text-xs text-surface-variant/80 max-w-sm">
        Kami menolak vonis biner sederhana (Aman/Bahaya) karena korban sering kali berada di antara kepanikan dan keraguan.
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-5 rounded-2xl bg-white/10 border border-white/15 flex flex-col gap-2">
        <span class="text-xs uppercase font-bold text-status-scam-red">Dimensi 1</span>
        <h4 class="text-lg font-bold">Content Risk (0–100%)</h4>
        <p class="text-xs text-white/80 leading-relaxed">
          Menilai tingkat racun teknis konten: apakah menggunakan domain phising, script tersembunyi, kalimat pemerasan, atau file APK berbahaya.
        </p>
      </div>

      <div class="p-5 rounded-2xl bg-white/10 border border-white/15 flex flex-col gap-2">
        <span class="text-xs uppercase font-bold text-status-safe-green">Dimensi 2</span>
        <h4 class="text-lg font-bold">Confidence Score (0–100%)</h4>
        <p class="text-xs text-white/80 leading-relaxed">
          Menunjukkan derajat kepastian bukti: semakin lengkap gambar atau tautan yang diserahkan, semakin tinggi tingkat keyakinan analisis sistem.
        </p>
      </div>

      <div class="p-5 rounded-2xl bg-white/10 border border-white/15 flex flex-col gap-2">
        <span class="text-xs uppercase font-bold text-yellow-400">Dimensi 3</span>
        <h4 class="text-lg font-bold">User Exposure (0–100%)</h4>
        <p class="text-xs text-white/80 leading-relaxed">
          Dievaluasi melalui wawancara adaptif: apakah korban sekadar menerima pesan (10%), mengklik link (35%), memasukkan password (70%), atau menyerahkan OTP (90%).
        </p>
      </div>
    </div>
  </div>

  <!-- Bottom Action Card -->
  <div class="text-center p-8 rounded-3xl bg-surface-container-low border border-border-subtle flex flex-col items-center gap-4">
    <h3 class="text-xl font-bold text-brand-indigo-hero">Ingin Menguji Pesan atau Tautan Mencurigakan?</h3>
    <p class="text-xs sm:text-sm text-on-surface-variant max-w-md">
      Layanan ini 100% gratis, bebas registrasi, dan privasi Anda terlindungi dengan enkripsi client-side.
    </p>
    <button
      type="button"
      onclick={onNavigateHome}
      class="px-6 py-3 rounded-full bg-brand-violet-vibrant hover:bg-brand-violet-hover text-white text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
    >
      <span class="material-symbols-outlined text-[18px]">search</span>
      <span>Mulai Pemeriksaan Sekarang</span>
    </button>
  </div>
</div>
