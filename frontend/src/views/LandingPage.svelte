<script lang="ts">
  import type { EvidenceType } from "../types";
  import { validateEvidenceInput } from "../services/inputValidator";

  interface Props {
    onSubmit: (payload: { content: string; type: EvidenceType; image_base64?: string | null }) => void;
    onNavigate?: (route: string, hash?: string) => void;
    apiError?: string;
  }

  let { onSubmit, onNavigate, apiError = "" }: Props = $props();

  let urlInput = $state<string>("");
  let errorMessage = $state<string>("");

  $effect(() => {
    if (apiError) {
      errorMessage = apiError;
    }
  });

  // FAQ Accordion state in landing page
  let activeFaqIndex = $state<number | null>(0);

  function handleInputChange() {
    if (errorMessage) errorMessage = "";
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        urlInput = text.trim();
        errorMessage = "";
      }
    } catch {
      // clipboard access denied or unsupported
    }
  }

  // Real-time URL inspector derived info
  let liveInspector = $derived.by(() => {
    const val = urlInput.trim();
    if (!val || val.length < 4 || !val.includes(".")) return null;
    try {
      const urlToParse = val.startsWith("http://") || val.startsWith("https://") ? val : `http://${val}`;
      const parsed = new URL(urlToParse);
      const isHttps = parsed.protocol === "https:";
      const hostname = parsed.hostname.toLowerCase();
      const hasApk = val.toLowerCase().includes(".apk");
      const suspiciousTlds = [".xyz", ".top", ".club", ".icu", ".site", ".online", ".live", ".work", ".click", ".buzz", ".link"];
      const isSuspiciousTld = suspiciousTlds.some(tld => hostname.endsWith(tld));
      return {
        protocol: parsed.protocol.replace(":", ""),
        isHttps,
        hostname,
        hasApk,
        isSuspiciousTld
      };
    } catch {
      return null;
    }
  });

  function handleSubmit() {
    const val = urlInput.trim();

    if (!val) {
      errorMessage = "Silakan masukkan atau tempel tautan yang ingin diperiksa.";
      return;
    }

    const validation = validateEvidenceInput(val, "url", false);
    if (!validation.valid || validation.normalizedType !== "url") {
      errorMessage = validation.error || "Format tautan tidak valid. Masukkan URL lengkap (contoh: https://contoh-domain.com).";
      return;
    }

    errorMessage = "";
    const cleanUrl = val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
    onSubmit({
      type: "url",
      content: cleanUrl,
      image_base64: null
    });
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function triggerPreset(presetType: "bca" | "tilang" | "apk" | "idweb") {
    if (presetType === "bca") {
      onSubmit({
        type: "url",
        content: "https://id-bca-verifikasi-keamanan.xyz/login",
        image_base64: null
      });
    } else if (presetType === "tilang") {
      onSubmit({
        type: "url",
        content: "Pemberitahuan ETLE: Kendaraan Anda tertangkap kamera melanggar marka jalan. Silakan unduh bukti tilang pada berkas Surat_Tilang_ETLE.apk berikut: https://tilang-etle-polri.top/download",
        image_base64: null
      });
    } else if (presetType === "apk") {
      onSubmit({
        type: "url",
        content: "https://bit.ly/Surat-Undangan-Pernikahan-Digital.apk",
        image_base64: null
      });
    } else if (presetType === "idweb") {
      onSubmit({
        type: "url",
        content: "https://member.idwebhost.com/clientarea.php",
        image_base64: null
      });
    }
  }

  function toggleFaq(index: number) {
    activeFaqIndex = activeFaqIndex === index ? null : index;
  }
</script>

<div class="flex flex-col w-full">
  <!-- Hero Scan & Submission Section -->
  <section
    id="top-input-hero"
    class="relative w-full max-w-[1200px] mx-auto px-gutter pt-12 pb-16 md:pt-16 md:pb-24 flex flex-col items-center text-center justify-center overflow-hidden"
  >
    <!-- Ambient Glowing Background Auras -->
    <div class="absolute top-6 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-gradient-to-tr from-brand-violet-vibrant/15 via-purple-300/20 to-sky-300/25 rounded-full blur-3xl pointer-events-none -z-10 animate-float"></div>
    <div class="absolute top-36 left-1/3 -translate-x-1/2 w-[320px] h-[220px] bg-gradient-to-br from-sky-400/15 to-transparent rounded-full blur-2xl pointer-events-none -z-10 animate-pulse-glow" style="animation-duration: 6s;"></div>

    <!-- Stylized Animated Emblem with Pulsing Ripple -->
    <div class="relative mb-6 flex items-center justify-center">
      <div class="absolute -inset-3 rounded-full bg-brand-violet-vibrant/20 animate-pulse-purple"></div>
      <div class="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center shadow-inner relative z-10 animate-float">
        <span class="material-symbols-outlined text-brand-violet-vibrant text-[44px]">search_check</span>
      </div>
      <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-violet-vibrant text-on-primary flex items-center justify-center shadow-md z-20 hover:scale-110 transition-transform">
        <span class="material-symbols-outlined text-[18px]">verified_user</span>
      </div>
    </div>

    <!-- Hero Title & Subtitle with Shimmer Effect -->
    <h1 class="text-3xl md:text-5xl font-extrabold shimmer-text max-w-2xl tracking-tight leading-tight mb-4">
      Apakah tautan ini penipuan?<br />Cek keamanannya sekarang.
    </h1>

    <div class="flex flex-col items-center gap-1.5 mb-8">
      <span class="text-xs sm:text-sm text-brand-violet-vibrant font-bold tracking-wide uppercase">
        GRATIS. TANPA PERLU DAFTAR.
      </span>
      <p class="text-sm sm:text-base text-on-surface-variant max-w-xl">
        Tempel tautan atau alamat website mencurigakan dari WhatsApp, SMS, atau Email untuk mendeteksi indikasi phishing, typosquatting, dan malware APK berbahaya.
      </p>
    </div>

    <!-- Single URL Scanner Capsule -->
    <div class="w-full max-w-2xl rounded-2xl bg-surface-container-lowest p-3 sm:p-4 shadow-xl flex flex-col gap-3 border border-border-subtle hover:shadow-2xl transition-all duration-300">
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="flex flex-col sm:flex-row items-center gap-2">
        <div
          class="relative flex-1 w-full flex items-center rounded-xl bg-surface-container-low px-3 py-2.5 sm:py-3 border transition-all duration-200 {errorMessage
            ? 'border-status-scam-red ring-2 ring-status-scam-red/20'
            : 'border-surface-container-high/60 focus-within:border-brand-violet-vibrant/60 focus-within:bg-white focus-within:shadow-md'}"
        >
          <span class="material-symbols-outlined text-brand-violet-vibrant/80 text-[22px] mr-2 shrink-0">link</span>
          <input
            type="url"
            bind:value={urlInput}
            oninput={handleInputChange}
            onkeydown={handleKeyDown}
            placeholder="Tempel tautan di sini (contoh: https://contoh-link.xyz/login)..."
            class="w-full bg-transparent text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
          />
          {#if urlInput}
            <button
              type="button"
              onclick={() => { urlInput = ""; errorMessage = ""; }}
              class="text-on-surface-variant/60 hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer mr-1"
              title="Hapus"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          {:else}
            <button
              type="button"
              onclick={handlePaste}
              class="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-container text-brand-indigo-hero hover:bg-brand-violet-vibrant hover:text-white transition-all cursor-pointer mr-1"
              title="Tempel dari Clipboard"
            >
              <span class="material-symbols-outlined text-[14px]">content_paste</span>
              <span>Tempel</span>
            </button>
          {/if}
        </div>

        <button
          type="submit"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-violet-vibrant hover:bg-brand-violet-hover text-on-primary font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <span>Periksa Tautan</span>
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </form>

      {#if liveInspector}
        <div class="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low text-xs border border-border-subtle/60 text-left">
          <span class="font-bold text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px] text-brand-violet-vibrant">travel_explore</span>
            Inspector:
          </span>
          <span class="px-2 py-0.5 rounded-full {liveInspector.isHttps ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} font-semibold text-[11px]">
            {liveInspector.protocol.toUpperCase()}
          </span>
          <span class="font-mono text-[11px] text-on-surface font-semibold truncate max-w-[240px]">
            {liveInspector.hostname}
          </span>
          {#if liveInspector.hasApk}
            <span class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px] animate-pulse">
              .APK MALWARE
            </span>
          {/if}
          {#if liveInspector.isSuspiciousTld}
            <span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px]">
              TLD RISIKO TINGGI
            </span>
          {/if}
        </div>
      {/if}

      {#if errorMessage}
        <div class="p-3 rounded-xl bg-status-scam-bg text-status-scam-red text-xs font-semibold flex items-center gap-2 border border-status-scam-red/30 animate-shake">
          <span class="material-symbols-outlined text-[18px] shrink-0">error</span>
          <span>{errorMessage}</span>
        </div>
      {/if}

      <!-- Bottom Hint -->
      <div class="flex items-center justify-between pt-1 px-1 text-xs text-on-surface-variant/70">
        <span class="flex items-center gap-1 text-[11px]">
          <span class="material-symbols-outlined text-[14px] text-brand-violet-vibrant">verified_user</span>
          Proteksi SSRF &amp; URL Shortener Expansion
        </span>
        <span class="text-[11px] hidden sm:inline">Didukung Intelijen Keamanan Siber Indonesia</span>
      </div>
    </div>
  </section>

  <!-- Feature Grid Section -->
  <section class="w-full bg-surface-bright py-16 border-t border-border-subtle">
    <div class="max-w-[1200px] mx-auto px-gutter">
      <div class="text-center max-w-xl mx-auto mb-12">
        <h2 class="text-2xl md:text-3xl font-extrabold text-brand-indigo-hero mb-3">
          Perlindungan Siber Menyeluruh
        </h2>
        <p class="text-sm text-on-surface-variant">
          Menggabungkan analisis heuristik statis, verifikasi institusi finansial, dan audit AI canggih untuk memitigasi kerugian finansial.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col gap-3">
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-brand-violet-vibrant flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <span class="material-symbols-outlined text-[26px]">network_check</span>
          </div>
          <h3 class="text-base font-bold text-brand-indigo-hero">Deteksi Tautan Phishing &amp; SSRF</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Menyaring domain tiruan (typosquatting), shortener URL, dan percobaan eksploitasi jaringan internal secara realtime.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col gap-3">
          <div class="w-12 h-12 rounded-xl bg-red-50 text-status-scam-red flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <span class="material-symbols-outlined text-[26px]">apk_install</span>
          </div>
          <h3 class="text-base font-bold text-brand-indigo-hero">Pemeriksaan Berkas Malware APK</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Mendeteksi virus pembobol rekening berkedok undangan pernikahan digital, surat tilang ETLE, maupun resi kurir pengiriman.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <span class="material-symbols-outlined text-[26px]">support_agent</span>
          </div>
          <h3 class="text-base font-bold text-brand-indigo-hero">Operator Telepon Ramah Lansia</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Dilengkapi narasi audio ramah orang tua dengan tombol tindakan darurat 1-klik untuk menghubungi bank terkait.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS Section (Deep Indigo Navy Zone) -->
  <section id="how-it-works" class="w-full bg-brand-indigo-hero text-on-primary py-20 px-gutter scroll-mt-20">
    <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <!-- Left Column: Steps -->
      <div class="lg:col-span-6 flex flex-col gap-8">
        <div>
          <span class="text-xs tracking-widest text-secondary-container uppercase block mb-2 font-bold">
            CARA KERJA
          </span>
          <h2 class="text-2xl md:text-4xl font-extrabold text-on-primary tracking-tight">
            Pemeriksaan penipuan gratis, kapan pun Anda butuh pendapat kedua
          </h2>
        </div>
        <div class="flex flex-col gap-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 shrink-0 rounded-full bg-surface-container/10 flex items-center justify-center text-primary-fixed-dim font-bold">
              1
            </div>
            <div class="flex flex-col gap-1">
              <h3 class="text-base font-bold text-on-primary">Kirim pesan atau tautan yang mencurigakan</h3>
              <p class="text-xs text-surface-variant/80">
                Tempel teks SMS/WA, unggah foto bukti, atau ceritakan situasi yang membuat Anda ragu.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-10 h-10 shrink-0 rounded-full bg-surface-container/10 flex items-center justify-center text-primary-fixed-dim font-bold">
              2
            </div>
            <div class="flex flex-col gap-1">
              <h3 class="text-base font-bold text-on-primary">KrosCheck memeriksa sinyal penipuan</h3>
              <p class="text-xs text-surface-variant/80">
                Mesin deteksi kami menganalisis pola rekayasa sosial, reputasi domain, dan struktur file APK.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-10 h-10 shrink-0 rounded-full bg-surface-container/10 flex items-center justify-center text-primary-fixed-dim font-bold">
              3
            </div>
            <div class="flex flex-col gap-1">
              <h3 class="text-base font-bold text-on-primary">Dapatkan skor 3D dan langkah penyelamatan</h3>
              <p class="text-xs text-surface-variant/80">
                KrosCheck menyajikan vonis tegas, wawancara adaptif keterpaparan akun, dan hotline resmi bank.
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onclick={() => onNavigate && onNavigate("/how-it-works")}
            class="inline-flex items-center gap-2 text-xs font-bold text-primary-fixed-dim hover:text-white transition-colors cursor-pointer"
          >
            <span>Pelajari arsitektur sistem selengkapnya</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Right Column: Sample Verdict Card -->
      <div class="lg:col-span-6 flex justify-center">
        <div class="w-full max-w-md bg-white rounded-2xl text-on-surface p-6 sm:p-7 shadow-2xl flex flex-col gap-4 border border-border-subtle">
          <div class="flex flex-col items-center text-center gap-2">
            <div class="w-12 h-12 rounded-full bg-status-scam-bg flex items-center justify-center">
              <span class="material-symbols-outlined text-status-scam-red text-[28px]">error</span>
            </div>
            <h3 class="text-xl font-bold text-brand-indigo-hero">Pasti Penipuan (95%)</h3>
            <p class="text-xs text-on-surface-variant">
              Tautan mengarah ke domain tiruan perbankan yang dirancang mencuri kredensial login dan kode OTP Anda.
            </p>
          </div>
          <div class="w-full h-[1px] bg-surface-container-high"></div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-brand-indigo-hero">Tindakan Darurat Rekomendasi:</span>
            <div class="p-2.5 rounded-lg bg-status-scam-bg text-[11px] font-semibold text-status-scam-red flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">phone_in_talk</span>
              <span>Hubungi Call Center HaloBCA di 1500888 untuk blokir rekening</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TRENDS Section -->
  <section id="trends" class="w-full py-20 px-gutter bg-surface scroll-mt-20">
    <div class="max-w-[1200px] mx-auto flex flex-col gap-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-status-scam-red uppercase tracking-wider">Intelijen Siber Terkini</span>
          <h2 class="text-2xl md:text-3xl font-extrabold text-brand-indigo-hero mt-1">
            Tren Penipuan Siber di Indonesia
          </h2>
          <p class="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-xl">
            Modus kejahatan yang paling sering dilaporkan masyarakat dan beredar di grup percakapan keluarga.
          </p>
        </div>
        <button
          type="button"
          onclick={() => onNavigate && onNavigate("/trends")}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-xs font-bold text-brand-indigo-hero hover:bg-surface-container-high transition-colors cursor-pointer self-start md:self-auto"
        >
          <span>Buka Papan Tren Lengkap</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Trend 1 -->
        <div class="p-5 rounded-2xl bg-white border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-full bg-status-scam-bg text-status-scam-red text-[10px] font-extrabold animate-pulse">KRITIS</span>
            <span class="text-[11px] text-on-surface-variant font-medium">Phishing Bank</span>
          </div>
          <h4 class="text-sm font-bold text-brand-indigo-hero">Kenaikan Tarif Transfer BCA Rp150.000</h4>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Surat edaran palsu yang meminta korban mengisi data di situs phishing untuk membatalkan tarif bulanan.
          </p>
          <button
            type="button"
            onclick={() => triggerPreset("bca")}
            class="interactive-pill mt-auto py-2 rounded-full bg-surface-container hover:bg-brand-violet-vibrant hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
          >
            Uji Kasus Ini
          </button>
        </div>

        <!-- Trend 2 -->
        <div class="p-5 rounded-2xl bg-white border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-full bg-status-scam-bg text-status-scam-red text-[10px] font-extrabold animate-pulse">KRITIS</span>
            <span class="text-[11px] text-on-surface-variant font-medium">Malware APK</span>
          </div>
          <h4 class="text-sm font-bold text-brand-indigo-hero">Surat Tilang ETLE Berkas .APK</h4>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Mencatut kepolisian mengabarkan pelanggaran lalu lintas dan melampirkan spyware pembobol SMS OTP.
          </p>
          <button
            type="button"
            onclick={() => triggerPreset("tilang")}
            class="interactive-pill mt-auto py-2 rounded-full bg-surface-container hover:bg-brand-violet-vibrant hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
          >
            Uji Kasus Ini
          </button>
        </div>

        <!-- Trend 3 -->
        <div class="p-5 rounded-2xl bg-white border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">TINGGI</span>
            <span class="text-[11px] text-on-surface-variant font-medium">Social Engineering</span>
          </div>
          <h4 class="text-sm font-bold text-brand-indigo-hero">Undangan Pernikahan Digital .APK</h4>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Mengaku kenalan yang mengirim surat undangan resepsi untuk memancing korban memasang aplikasi berbahaya.
          </p>
          <button
            type="button"
            onclick={() => triggerPreset("apk")}
            class="interactive-pill mt-auto py-2 rounded-full bg-surface-container hover:bg-brand-violet-vibrant hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
          >
            Uji Kasus Ini
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- DOWNLOAD / MULTI-CHANNEL Section -->
  <section id="download" class="w-full bg-surface-ice-blue/60 py-20 px-gutter scroll-mt-20">
    <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-6 flex flex-col gap-6">
        <span class="text-xs font-bold text-primary uppercase tracking-wider">Akses Fleksibel</span>
        <h2 class="text-2xl md:text-4xl font-extrabold text-brand-indigo-hero">
          Gunakan KrosCheck di Mana Saja
        </h2>
        <p class="text-sm text-on-surface-variant leading-relaxed">
          Pemeriksaan penipuan instan dapat diakses tanpa hambatan melalui Web browser, Bot Telegram, maupun Bot WhatsApp resmi.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <a
            href="https://wa.me"
            target="_blank"
            rel="noreferrer"
            class="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
          >
            <span class="material-symbols-outlined text-[18px]">chat</span>
            <span>WhatsApp Bot</span>
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            class="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
          >
            <span class="material-symbols-outlined text-[18px]">send</span>
            <span>Telegram Bot</span>
          </a>
          <button
            type="button"
            onclick={() => onNavigate && onNavigate("/download")}
            class="px-5 py-2.5 rounded-full bg-brand-indigo-hero hover:bg-brand-violet-vibrant text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span class="material-symbols-outlined text-[18px]">qr_code</span>
            <span>Pindai QR Ponsel</span>
          </button>
        </div>
      </div>

      <div class="lg:col-span-6 flex justify-center">
        <div class="p-6 rounded-3xl bg-white shadow-xl border border-border-subtle flex flex-col sm:flex-row items-center gap-6 max-w-md">
          <div class="w-32 h-32 rounded-xl bg-surface-container-lowest p-2 shadow-sm flex items-center justify-center shrink-0 border">
            <svg class="w-full h-full text-brand-indigo-hero" fill="currentColor" viewBox="0 0 100 100">
              <rect x="10" y="10" width="25" height="25" rx="4"></rect>
              <rect x="15" y="15" width="15" height="15" fill="#FFFFFF"></rect>
              <rect x="19" y="19" width="7" height="7"></rect>
              <rect x="65" y="10" width="25" height="25" rx="4"></rect>
              <rect x="70" y="15" width="15" height="15" fill="#FFFFFF"></rect>
              <rect x="74" y="19" width="7" height="7"></rect>
              <rect x="10" y="65" width="25" height="25" rx="4"></rect>
              <rect x="15" y="70" width="15" height="15" fill="#FFFFFF"></rect>
              <rect x="19" y="74" width="7" height="7"></rect>
              <circle cx="45" cy="22" r="4"></circle>
              <circle cx="55" cy="35" r="4"></circle>
              <circle cx="45" cy="50" r="4"></circle>
              <circle cx="68" cy="65" r="4"></circle>
              <circle cx="85" cy="75" r="4"></circle>
              <circle cx="55" cy="85" r="4"></circle>
            </svg>
          </div>
          <div class="flex flex-col gap-1 text-center sm:text-left">
            <h4 class="text-sm font-bold text-brand-indigo-hero">Pindai dari Smartphone</h4>
            <p class="text-xs text-on-surface-variant">
              Buka kamera HP Anda untuk menggunakan KrosCheck secara cepat di ponsel keluarga Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section id="faq" class="w-full max-w-[900px] mx-auto px-gutter py-20 scroll-mt-20">
    <div class="text-center mb-10">
      <span class="text-xs font-bold text-primary uppercase tracking-wider">Tanya Jawab</span>
      <h2 class="text-2xl md:text-3xl font-extrabold text-brand-indigo-hero mt-1">
        Pertanyaan yang Sering Diajukan
      </h2>
    </div>

    <div class="flex flex-col gap-3">
      <!-- Item 1 -->
      <div class="rounded-xl bg-surface-container-lowest p-5 shadow-sm border border-border-subtle transition-all">
        <button
          type="button"
          onclick={() => toggleFaq(0)}
          class="w-full flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-brand-indigo-hero hover:text-primary transition-colors cursor-pointer"
        >
          <span>Apa itu KrosCheck, dan bagaimana cara kerjanya?</span>
          <span class="material-symbols-outlined text-on-surface-variant transition-transform duration-200 {activeFaqIndex === 0 ? 'rotate-180' : ''}">
            expand_more
          </span>
        </button>
        {#if activeFaqIndex === 0}
          <div class="pt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-border-subtle/50 mt-3">
            KrosCheck adalah situs web pemeriksaan penipuan gratis dan tepercaya yang dirancang untuk membantu Anda mengevaluasi setiap komunikasi mencurigakan (SMS, WhatsApp, tautan, atau APK) dengan analisis cerdas 3-dimensi.
          </div>
        {/if}
      </div>

      <!-- Item 2 -->
      <div class="rounded-xl bg-surface-container-lowest p-5 shadow-sm border border-border-subtle transition-all">
        <button
          type="button"
          onclick={() => toggleFaq(1)}
          class="w-full flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-brand-indigo-hero hover:text-primary transition-colors cursor-pointer"
        >
          <span>Apakah KrosCheck benar-benar gratis dan privat?</span>
          <span class="material-symbols-outlined text-on-surface-variant transition-transform duration-200 {activeFaqIndex === 1 ? 'rotate-180' : ''}">
            expand_more
          </span>
        </button>
        {#if activeFaqIndex === 1}
          <div class="pt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-border-subtle/50 mt-3">
            Ya! 100% gratis tanpa perlu registrasi akun. Kami menerapkan prinsip Zero-Log dan PII Masking otomatis sehingga nomor rekening, kartu bank, nomor HP, dan kode OTP Anda terlindungi aman.
          </div>
        {/if}
      </div>

      <!-- Item 3 -->
      <div class="rounded-xl bg-surface-container-lowest p-5 shadow-sm border border-border-subtle transition-all">
        <button
          type="button"
          onclick={() => toggleFaq(2)}
          class="w-full flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-brand-indigo-hero hover:text-primary transition-colors cursor-pointer"
        >
          <span>Bagaimana jika saya sudah terlanjur mengklik tautan atau mengisi data?</span>
          <span class="material-symbols-outlined text-on-surface-variant transition-transform duration-200 {activeFaqIndex === 2 ? 'rotate-180' : ''}">
            expand_more
          </span>
        </button>
        {#if activeFaqIndex === 2}
          <div class="pt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-border-subtle/50 mt-3">
            Gunakan fitur Wawancara Adaptif kami. Sistem akan langsung mengaktifkan Mode Darurat dan menampilkan tombol telepon langsung ke Call Center resmi bank Anda (HaloBCA 1500888, BRI 14017, Mandiri 14000) untuk memblokir transaksi.
          </div>
        {/if}
      </div>
    </div>

    <div class="text-center pt-8">
      <button
        type="button"
        onclick={() => onNavigate && onNavigate("/faq")}
        class="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-brand-violet-hover transition-colors cursor-pointer"
      >
        <span>Buka semua 8 pertanyaan yang sering diajukan</span>
        <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </div>
  </section>

  <!-- ABOUT Section -->
  <section id="about" class="w-full py-20 px-gutter bg-surface-bright border-t border-border-subtle scroll-mt-20">
    <div class="max-w-[800px] mx-auto flex flex-col items-center text-center gap-6">
      <div class="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center shadow-inner text-primary">
        <span class="material-symbols-outlined text-[28px]">shield_with_heart</span>
      </div>
      <h2 class="text-2xl md:text-4xl font-extrabold text-brand-indigo-hero">
        Penipuan terus berkembang. Perlindungan keluarga Anda pun harus demikian.
      </h2>
      <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
        KrosCheck PRO dibangun oleh tim ITK Industries dalam ajang <strong>IDwebhost AI HackFest 2026</strong> untuk menghadirkan perlindungan siber inklusif, ramah lansia, dan cepat tanggap bagi seluruh masyarakat Indonesia.
      </p>
      <button
        type="button"
        onclick={() => onNavigate && onNavigate("/about")}
        class="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-brand-violet-hover transition-colors cursor-pointer"
      >
        <span>Baca kisah dan misi kami selengkapnya</span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  </section>
</div>
