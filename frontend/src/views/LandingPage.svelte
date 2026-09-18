<script lang="ts">
  import type { EvidenceType } from "../types";

  interface Props {
    onSubmit: (payload: { content: string; type: EvidenceType; image_base64?: string | null }) => void;
  }

  let { onSubmit }: Props = $props();

  let scamInput = $state<string>("");
  let isExpanded = $state<boolean>(false);
  let isUploading = $state<boolean>(false);
  let errorMessage = $state<string>("");
  let fileInputElement = $state<HTMLInputElement | null>(null);

  function handleInputChange() {
    isExpanded = scamInput.trim().length > 0;
    if (errorMessage) errorMessage = "";
  }

  function handleUploadClick() {
    fileInputElement?.click();
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      isUploading = true;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64 = result ? result.split(",")[1] : null;
        isUploading = false;
        onSubmit({
          type: "screenshot",
          content: file.name,
          image_base64: base64
        });
      };
      reader.onerror = () => {
        isUploading = false;
        errorMessage = "Gagal memproses berkas gambar.";
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit() {
    const val = scamInput.trim();
    if (!val) {
      errorMessage = "Silakan tempel teks atau tautan mencurigakan terlebih dahulu.";
      return;
    }

    const isUrl = val.startsWith("http://") || val.startsWith("https://") || val.includes(".com") || val.includes(".id") || val.includes(".xyz");
    onSubmit({
      type: isUrl ? "url" : "text",
      content: val,
      image_base64: null
    });
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && scamInput.trim().length > 0) {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="flex flex-col w-full">
  <!-- Hero Scan & Submission Section (Height padded so input is prominent) -->
  <section
    id="top-input-hero"
    class="w-full max-w-[1200px] mx-auto px-gutter pt-12 pb-24 md:pt-16 md:pb-36 flex flex-col items-center text-center min-h-[78vh] justify-center"
  >
    <!-- Stylized Emblem -->
    <div class="relative mb-6 flex items-center justify-center">
      <div class="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center shadow-inner">
        <span class="material-symbols-outlined text-brand-violet-vibrant text-[44px]">search_check</span>
      </div>
      <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-violet-vibrant text-on-primary flex items-center justify-center shadow-md">
        <span class="material-symbols-outlined text-[18px]">verified_user</span>
      </div>
    </div>

    <!-- Hero Title & Subtitle -->
    <h1 class="text-3xl md:text-5xl font-extrabold text-brand-indigo-hero max-w-2xl tracking-tight leading-tight mb-4">
      Apakah ini penipuan?<br />Cek dengan cepat.
    </h1>

    <div class="flex flex-col items-center gap-1.5 mb-8">
      <span class="text-xs sm:text-sm text-brand-violet-vibrant font-bold tracking-wide uppercase">
        GRATIS. TANPA PERLU DAFTAR.
      </span>
      <p class="text-sm sm:text-base text-on-surface-variant max-w-xl">
        Tempel teks, unggah gambar, jelaskan situasinya, atau periksa nomor rekening secara instan.
      </p>
    </div>

    <!-- Submission Box -->
    <div class="w-full max-w-xl rounded-2xl bg-surface-container-lowest p-4 sm:p-5 shadow-xl flex flex-col gap-4 border border-border-subtle">
      <!-- Upload File Trigger -->
      <button
        type="button"
        onclick={handleUploadClick}
        disabled={isUploading}
        class="w-full py-3 px-6 rounded-full bg-brand-violet-vibrant hover:bg-brand-violet-hover text-on-primary font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-60"
      >
        {#if isUploading}
          <span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          <span>Memproses berkas...</span>
        {:else}
          <span class="material-symbols-outlined text-[20px]">add_photo_alternate</span>
          <span>Unggah gambar atau tangkapan layar</span>
        {/if}
      </button>

      <input
        bind:this={fileInputElement}
        onchange={handleFileChange}
        accept="image/*"
        type="file"
        class="hidden"
      />

      <div class="flex items-center gap-3">
        <div class="h-[1px] flex-1 bg-surface-container-high"></div>
        <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">ATAU JELASKAN DI BAWAH</span>
        <div class="h-[1px] flex-1 bg-surface-container-high"></div>
      </div>

      <!-- Text Input & Submit Action -->
      <div
        class="relative flex flex-col rounded-xl bg-surface-container-low p-2.5 sm:p-3 border transition-all duration-300 ease-out {errorMessage
          ? 'border-status-scam-red ring-2 ring-status-scam-red/20'
          : 'border-surface-container-high/60 focus-within:border-brand-violet-vibrant/40 focus-within:bg-surface-container-lowest focus-within:shadow-md'}"
      >
        <textarea
          bind:value={scamInput}
          oninput={handleInputChange}
          onkeydown={handleKeyDown}
          placeholder="Tempel teks/tautan atau ceritakan apa yang terjadi..."
          rows={isExpanded ? 3 : 1}
          class="w-full bg-transparent resize-none p-1 text-on-surface placeholder:text-on-surface-variant/70 text-sm focus:outline-none transition-all duration-300 ease-out leading-relaxed"
        ></textarea>

        <!-- Dynamic Expandable Footer -->
        <div
          class="transition-all duration-300 ease-out flex items-center justify-between {isExpanded
            ? 'opacity-100 min-h-[38px] pt-2.5'
            : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'}"
        >
          <span class="text-[11px] text-on-surface-variant/75 flex items-center gap-1.5 font-medium">
            <span class="material-symbols-outlined text-[16px] text-brand-violet-vibrant/70">lock</span>
            Terenkripsi &amp; privat
          </span>

          <button
            type="button"
            onclick={handleSubmit}
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-brand-indigo-hero text-on-primary text-xs font-bold hover:bg-brand-violet-vibrant transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Periksa sekarang</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {#if errorMessage}
        <div class="p-2.5 rounded-lg bg-status-scam-bg text-status-scam-red text-xs font-semibold flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">error</span>
          <span>{errorMessage}</span>
        </div>
      {/if}

      <!-- Bottom Hint -->
      <div class="flex items-center justify-center pt-1 text-xs text-on-surface-variant/70">
        <span>Didukung AI Multimodal &amp; Basis Data Intelijen Siber Indonesia</span>
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
        <!-- Feature 1 -->
        <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm flex flex-col gap-3">
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-brand-violet-vibrant flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">network_check</span>
          </div>
          <h3 class="text-base font-bold text-brand-indigo-hero">Deteksi Tautan Phishing &amp; SSRF</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Menyaring domain tiruan (typosquatting), shortener URL, dan percobaan eksploitasi jaringan internal secara realtime.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm flex flex-col gap-3">
          <div class="w-12 h-12 rounded-xl bg-red-50 text-status-scam-red flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">apk_install</span>
          </div>
          <h3 class="text-base font-bold text-brand-indigo-hero">Pemeriksaan Berkas Malware APK</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Mendeteksi virus pembobol rekening berkedok undangan pernikahan digital, surat tilang ETLE, maupun resi kurir pengiriman.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="p-6 rounded-2xl bg-white border border-border-subtle shadow-sm flex flex-col gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
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
</div>
