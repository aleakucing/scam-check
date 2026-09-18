<script lang="ts">
  interface Props {
    initialTab?: "privacy" | "terms";
    onNavigateHome: () => void;
  }

  let { initialTab = "privacy", onNavigateHome }: Props = $props();

  let activeTab = $state<"privacy" | "terms">("privacy");

  $effect(() => {
    activeTab = initialTab;
  });
</script>

<div class="w-full max-w-[900px] mx-auto px-gutter py-12 flex flex-col gap-10">
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
    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick={() => { activeTab = "privacy"; }}
        class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer {activeTab === 'privacy'
          ? 'bg-brand-indigo-hero text-white'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}"
      >
        Kebijakan Privasi
      </button>
      <button
        type="button"
        onclick={() => { activeTab = "terms"; }}
        class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer {activeTab === 'terms'
          ? 'bg-brand-indigo-hero text-white'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}"
      >
        Ketentuan Layanan
      </button>
    </div>
  </div>

  {#if activeTab === "privacy"}
    <!-- Privacy Content -->
    <div class="p-8 rounded-3xl bg-white border border-border-subtle shadow-sm flex flex-col gap-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-status-safe-green flex items-center justify-center">
          <span class="material-symbols-outlined text-[24px]">verified_user</span>
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-brand-indigo-hero">Kebijakan Privasi &amp; Perlindungan Data</h1>
          <span class="text-xs text-on-surface-variant">Terakhir diperbarui: September 2026 • Versi 2.0.0</span>
        </div>
      </div>

      <div class="space-y-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
        <h3 class="text-base font-bold text-brand-indigo-hero">1. Komitmen Prinsip Zero-Log</h3>
        <p>
          KrosCheck PRO (ScamGuard AI) beroperasi dengan prinsip dasar bahwa privasi korban adalah prioritas tertinggi. Kami tidak melacak alamat IP asli Anda, tidak memasang pelacak iklan (*ad trackers*), dan tidak membuat profil pengguna untuk tujuan komersial.
        </p>

        <h3 class="text-base font-bold text-brand-indigo-hero">2. Sensor Data Pribadi Sensitif (PII Masking)</h3>
        <p>
          Setiap teks, tangkapan layar, atau tautan yang Anda kirimkan melalui peramban atau bot terlebih dahulu melewati modul penyaring PII (*Personally Identifiable Information*). Nomor telepon Indonesia (+62 / 08xx), nomor kartu ATM/debit/kredit 16-digit, dan kode OTP otomatis disensor menjadi karakter bertopeng (misal: <code>****-****-****-1234</code>) sebelum dikirimkan ke mesin analisis AI.
        </p>

        <h3 class="text-base font-bold text-brand-indigo-hero">3. Perlindungan Jaringan (Anti-SSRF Sandbox)</h3>
        <p>
          Pemeriksaan tautan URL dilakukan dalam lingkungan terisolasi dengan proteksi Anti-SSRF (*Server-Side Request Forgery*). Sistem secara otomatis menolak dan memblokir permintaan ke alamat IP lokal (localhost, private IP 192.168.x.x, 10.x.x.x) serta metadata cloud untuk menjamin integritas server dan pengguna.
        </p>

        <h3 class="text-base font-bold text-brand-indigo-hero">4. Penggunaan Data Kasus Anonim</h3>
        <p>
          Data kasus kejahatan yang telah disensor sepenuhnya dari identitas pribadi dapat dikompilasi ke dalam basis data pola ancaman publik untuk memperkuat perlindungan masyarakat luas dari modus penipuan serupa.
        </p>
      </div>
    </div>
  {:else}
    <!-- Terms Content -->
    <div class="p-8 rounded-3xl bg-white border border-border-subtle shadow-sm flex flex-col gap-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
          <span class="material-symbols-outlined text-[24px]">gavel</span>
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-brand-indigo-hero">Ketentuan Layanan (Terms of Service)</h1>
          <span class="text-xs text-on-surface-variant">Pedoman Penggunaan Layanan KrosCheck PRO</span>
        </div>
      </div>

      <div class="space-y-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
        <h3 class="text-base font-bold text-brand-indigo-hero">1. Sifat Bantuan &amp; Batasan Tanggung Jawab</h3>
        <p>
          KrosCheck PRO adalah alat asisten intelijen dan pendeteksi risiko siber awal. Analisis yang dihasilkan merupakan rekomendasi berbasis model kecerdasan buatan dan aturan heuristik. Layanan ini bukan pengganti otoritas penegak hukum (Kepolisian RI), instansi perbankan, atau lembaga regulasi keuangan (OJK / Bank Indonesia).
        </p>

        <h3 class="text-base font-bold text-brand-indigo-hero">2. Penggunaan yang Diperbolehkan</h3>
        <p>
          Layanan ini disediakan secara gratis untuk kepentingan personal, keluarga, dan edukasi publik guna memitigasi kerugian dari penipuan digital. Dilarang keras menyalahgunakan API KrosCheck PRO untuk serangan DoS/DDoS, memindai jaringan secara ilegal, atau tujuan melawan hukum.
        </p>

        <h3 class="text-base font-bold text-brand-indigo-hero">3. Kedaruratan Finansial</h3>
        <p>
          Jika Anda telah terlanjur menyerahkan kode OTP atau informasi perbankan penting ke pihak penipu, kami sangat mendesak Anda untuk segera menggunakan tombol kontak darurat di aplikasi untuk menghubungi Call Center bank resmi Anda guna melakukan pemblokiran rekening.
        </p>
      </div>
    </div>
  {/if}
</div>
