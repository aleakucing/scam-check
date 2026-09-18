<script lang="ts">
  interface Props {
    onNavigateHome: () => void;
  }

  let { onNavigateHome }: Props = $props();

  let searchQuery = $state<string>("");
  let activeCategory = $state<string>("Semua");
  let openIndex = $state<number | null>(0);

  const categories = ["Semua", "Umum", "Keamanan & Privasi", "Teknologi AI", "Kedaruratan"];

  const faqs = [
    {
      q: "Apa itu KrosCheck PRO, dan bagaimana cara kerjanya?",
      a: "KrosCheck PRO adalah platform pertahanan keamanan siber dan respon mitigasi penipuan digital yang dirancang khusus untuk memverifikasi pesan mencurigakan, tautan phising, berkas APK berbahaya, dan rekayasa sosial di Indonesia. Kami memadukan aturan heuristik siber nasional dengan penalaran visual Google Gemini untuk memberikan hasil instan tanpa biaya.",
      category: "Umum"
    },
    {
      q: "Apa saja jenis bukti yang bisa saya periksa?",
      a: "Anda dapat memeriksa:\n• Tautan (URL) mencurigakan (pemendek bit.ly, domain tiruan bank, TLD .xyz/.top)\n• Tangkapan layar chat WhatsApp, Telegram, atau SMS (ekstraksi OCR otomatis)\n• Teks pesan penipuan (urgensi palsu, surat tilang ETLE, undian berhadiah)\n• Rekaman suara penjelasan kronologi menggunakan Web Speech API.",
      category: "Umum"
    },
    {
      q: "Apakah data yang saya kirimkan aman dan dirahasiakan?",
      a: "Sangat aman. KrosCheck menerapkan prinsip Privacy-by-Design. Seluruh nomor rekening, kartu debit/kredit 16-digit, nomor ponsel, dan kode OTP otomatis disensor (PII Masking) sebelum diproses. Kami tidak pernah menjual, menyimpan identitas pribadi, ataupun membagikan data kiriman Anda ke pihak ketiga.",
      category: "Keamanan & Privasi"
    },
    {
      q: "Apakah layanan ini benar-benar gratis dan tanpa perlu login?",
      a: "Ya, 100% gratis dan menganut prinsip Guest-First. Korban kejahatan digital yang sedang panik tidak boleh dibebani prosedur login atau registrasi formulir yang rumit. Anda bisa langsung memasukkan bukti dan mendapatkan bantuan dalam hitungan detik.",
      category: "Umum"
    },
    {
      q: "Bagaimana sistem menilai tingkat keterpaparan korban (User Exposure)?",
      a: "Kami menyediakan fitur Wawancara Adaptif bertingkat. Jika Anda baru menerima pesan, eksposur tergolong rendah (10%). Jika tautan dibuka (35%), jika username/password diserahkan (70%), dan jika kode OTP SMS telah diberikan kepada pelaku, tingkat eksposur mencapai 90% (Kritis) dan mode darurat langsung diaktifkan.",
      category: "Kedaruratan"
    },
    {
      q: "Apa yang harus saya lakukan jika sudah terlanjur mentransfer uang atau menyerahkan OTP?",
      a: "Segera masuk ke Mode Kedaruratan KrosCheck PRO: 1) Matikan koneksi data/Wi-Fi di ponsel Anda jika mengunduh APK, 2) Hubungi call center resmi bank Anda melalui tombol 1-sentuhan (HaloBCA 1500888, BRI 14017, Mandiri 14000, BNI 1500046) untuk memblokir rekening/kartu, 3) Ekspor Laporan Insiden Resmi dari KrosCheck untuk dibawa ke kantor cabang bank atau kepolisian.",
      category: "Kedaruratan"
    },
    {
      q: "Bagaimana jika server kehilangan koneksi internet atau kuota AI habis?",
      a: "KrosCheck memiliki Resilient Heuristic Fallback Engine mandiri di backend. Sistem secara otomatis beralih mendeteksi pola kejahatan lokal (typosquatting bank, ekstensi .apk, indikator urgensi, pola nomor rekening) secara offline sehingga pemeriksaan dijamin tidak akan pernah gagal saat diuji juri maupun masyarakat luas.",
      category: "Teknologi AI"
    },
    {
      q: "Mengapa KrosCheck ramah untuk orang tua dan lansia?",
      a: "Kami menyediakan tombol pengubah ukuran font (hingga 150%), narasi suara otomatis (Text-to-Speech) yang membacakan hasil analisa dengan bahasa santun, tombol 1-klik bagikan hasil ke WhatsApp keluarga/anak, serta panggilan cepat tanpa harus mencari nomor kontak bank di buku telepon.",
      category: "Umum"
    }
  ];

  let filteredFaqs = $derived(
    faqs.filter((item) => {
      const matchCat = activeCategory === "Semua" || item.category === activeCategory;
      const matchSearch =
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
  );

  function toggleFaq(idx: number) {
    openIndex = openIndex === idx ? null : idx;
  }
</script>

<div class="w-full max-w-[1000px] mx-auto px-gutter py-12 flex flex-col gap-10">
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
      Pusat Bantuan &amp; FAQ
    </span>
  </div>

  <!-- Header -->
  <div class="text-center max-w-2xl mx-auto flex flex-col gap-3">
    <div class="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-brand-violet-vibrant shadow-inner">
      <span class="material-symbols-outlined text-[34px]">quiz</span>
    </div>
    <h1 class="text-3xl sm:text-4xl font-extrabold text-brand-indigo-hero tracking-tight">
      Pertanyaan yang Sering Diajukan
    </h1>
    <p class="text-sm text-on-surface-variant leading-relaxed">
      Temukan jawaban lengkap seputar cara kerja pendeteksi, perlindungan privasi data, hingga langkah penanganan darurat saat rekening terancam.
    </p>
  </div>

  <!-- Search & Filter Bar -->
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <!-- Category Pills -->
    <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      {#each categories as cat}
        <button
          type="button"
          onclick={() => { activeCategory = cat; }}
          class="px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer {activeCategory === cat
            ? 'bg-brand-indigo-hero text-white shadow-sm'
            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}"
        >
          {cat}
        </button>
      {/each}
    </div>

    <!-- Search Input -->
    <div class="relative w-full sm:w-72">
      <span class="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant/60 text-[18px]">search</span>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari kata kunci..."
        class="w-full pl-9 pr-4 py-2 rounded-full bg-surface-container-low border border-border-subtle text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-brand-violet-vibrant/20 focus:bg-white"
      />
    </div>
  </div>

  <!-- FAQ Accordion List -->
  <div class="flex flex-col gap-3">
    {#if filteredFaqs.length === 0}
      <div class="p-8 text-center text-on-surface-variant text-sm bg-white rounded-2xl border border-border-subtle">
        Tidak ada pertanyaan yang cocok dengan pencarian "{searchQuery}".
      </div>
    {:else}
      {#each filteredFaqs as item, i}
        <div class="rounded-2xl bg-white border border-border-subtle shadow-sm overflow-hidden transition-all">
          <button
            type="button"
            onclick={() => toggleFaq(i)}
            class="w-full p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-brand-indigo-hero hover:text-primary transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-brand-violet-vibrant shrink-0"></span>
              <span>{item.q}</span>
            </div>
            <span
              class="material-symbols-outlined text-on-surface-variant transition-transform duration-200 {openIndex === i ? 'rotate-180' : ''}"
            >
              expand_more
            </span>
          </button>

          {#if openIndex === i}
            <div class="px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-border-subtle/50 whitespace-pre-line">
              {item.a}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>

  <!-- Still Need Help -->
  <div class="p-8 rounded-3xl bg-surface-container-low border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-6">
    <div class="flex flex-col gap-1 text-center sm:text-left">
      <h3 class="text-base font-bold text-brand-indigo-hero">Punya Kasus yang Butuh Pendapat Kedua?</h3>
      <p class="text-xs text-on-surface-variant">
        Jangan ambil risiko. Uji tautan atau pesan tersebut sekarang juga secara gratis.
      </p>
    </div>
    <button
      type="button"
      onclick={onNavigateHome}
      class="px-6 py-2.5 rounded-full bg-brand-violet-vibrant hover:bg-brand-violet-hover text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
    >
      Cek Penipuan Sekarang
    </button>
  </div>
</div>
