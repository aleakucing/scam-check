<script lang="ts">
  import type { EvidenceType } from "../types";

  interface Props {
    onNavigate?: (route: string, hash?: string) => void;
    onTestScenario?: (content: string, type: EvidenceType) => void;
  }

  let { onNavigate, onTestScenario }: Props = $props();
  const currentYear = new Date().getFullYear();

  function handleScenario(content: string, type: EvidenceType) {
    if (onTestScenario) {
      onTestScenario(content, type);
    } else if (onNavigate) {
      onNavigate("/");
    }
  }
</script>

<footer class="w-full bg-brand-indigo-hero text-on-primary pt-space-xl pb-space-lg mt-auto">
  <div class="max-w-[1200px] mx-auto px-gutter">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl pb-space-xl">
      <!-- Company Info Column -->
      <div class="lg:col-span-4 flex flex-col gap-space-md">
        <button
          type="button"
          onclick={() => onNavigate && onNavigate("/")}
          class="flex items-center gap-space-sm text-left cursor-pointer group"
        >
          <div class="w-9 h-9 rounded-full bg-brand-violet-vibrant flex items-center justify-center group-hover:scale-105 transition-transform">
            <span class="material-symbols-outlined text-on-primary text-[20px]">verified_user</span>
          </div>
          <div>
            <span class="font-headline-sm text-lg font-bold text-on-primary leading-none block">KrosCheck</span>
            <span class="font-label-sm text-xs text-primary-fixed-dim leading-tight">by ITK Industries</span>
          </div>
        </button>

        <p class="text-xs sm:text-sm text-surface-variant/80 max-w-sm leading-relaxed">
          Melindungi kehidupan digital masyarakat Indonesia dengan kecerdasan tingkat institusi. KrosCheck secara aktif menyaring SMS mencurigakan, akun perbankan tiruan, tautan phising, dan malware APK sebelum musibah penipuan terjadi.
        </p>
        
        <!-- Badges -->
        <div class="flex flex-wrap items-center gap-space-sm pt-space-xs">
          <div class="px-3 py-1.5 rounded-lg bg-surface-variant/10 flex items-center gap-2">
            <span class="material-symbols-outlined text-status-safe-green text-[18px]">verified</span>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-primary">IDwebhost HackFest</span>
              <span class="text-[11px] text-surface-variant/70">Cyber Security 2026</span>
            </div>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-surface-variant/10 flex items-center gap-2">
            <span class="material-symbols-outlined text-status-safe-green text-[18px]">lock</span>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-primary">Privacy-by-Design</span>
              <span class="text-[11px] text-surface-variant/70">Zero-Log &amp; PII Masking</span>
            </div>
          </div>
        </div>

        <!-- App Store / Mobile Access -->
        <div class="flex items-center gap-space-sm pt-space-xs">
          <button
            type="button"
            onclick={() => onNavigate && onNavigate("/download")}
            class="px-3 py-1.5 rounded-full bg-surface-variant/10 flex items-center gap-1.5 hover:bg-surface-variant/20 transition-colors cursor-pointer text-xs font-semibold text-white"
          >
            <span class="material-symbols-outlined text-[16px]">phone_iphone</span>
            <span>Akses Ponsel</span>
          </button>

          <a
            href="#"
            onclick={(e) => e.preventDefault()}
            title="Bot Telegram segera hadir"
            rel="noreferrer"
            class="px-3 py-1.5 rounded-full bg-surface-variant/10 flex items-center gap-1.5 hover:bg-surface-variant/20 transition-colors cursor-pointer text-xs font-semibold text-white"
          >
            <span class="material-symbols-outlined text-[16px]">send</span>
            <span>Telegram Bot</span>
          </a>

          <a
            href="#"
            onclick={(e) => e.preventDefault()}
            title="Bot WhatsApp segera hadir"
            rel="noreferrer"
            class="px-3 py-1.5 rounded-full bg-surface-variant/10 flex items-center gap-1.5 hover:bg-surface-variant/20 transition-colors cursor-pointer text-xs font-semibold text-white"
          >
            <span class="material-symbols-outlined text-[16px]">chat</span>
            <span>WhatsApp Bot</span>
          </a>
        </div>
      </div>

      <!-- Links Columns -->
      <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-space-lg">
        <!-- Col 1: Tools -->
        <div class="flex flex-col gap-2">
          <span class="text-xs uppercase font-bold tracking-wider text-primary-fixed-dim">Alat Cek Penipuan</span>
          <ul class="flex flex-col gap-1.5 text-xs text-surface-variant/75">
            <li>
              <button
                type="button"
                onclick={() => handleScenario("Pemberitahuan: Nomor WA Anda memenangkan Grand Prize. Hubungi bendahara di https://wa-hadiah-resmi.xyz", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Cek penipuan WhatsApp
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => handleScenario("Pemberitahuan SMS Bank: Transaksi Rp 5.000.000 berhasil didebit. Jika bukan Anda, batalkan di: https://batal-transaksi-bank.xyz", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Cek SMS perbankan palsu
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => handleScenario("https://id-bca-verifikasi-keamanan.xyz/login", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Cek tautan phishing .xyz
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => handleScenario("https://bit.ly/Surat-Undangan-Pernikahan-Digital.apk", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Cek malware berkas APK
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => handleScenario("Pemberitahuan ETLE: Kendaraan Anda tertangkap kamera melanggar marka jalan. Silakan unduh bukti tilang pada berkas Surat_Tilang_ETLE.apk berikut: https://tilang-etle-polri.top/download", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Deteksi surat tilang ETLE
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => handleScenario("https://member.idwebhost.com/clientarea.php", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left text-status-safe-green font-semibold"
              >
                Verifikasi domain resmi
              </button>
            </li>
          </ul>
        </div>

        <!-- Col 2: Threat Trends -->
        <div class="flex flex-col gap-2">
          <span class="text-xs uppercase font-bold tracking-wider text-primary-fixed-dim">Tren Penipuan Siber</span>
          <ul class="flex flex-col gap-1.5 text-xs text-surface-variant/75">
            <li>
              <button
                type="button"
                onclick={() => handleScenario("https://id-bca-verifikasi-keamanan.xyz/login", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Kenaikan Tarif Transfer BCA
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => handleScenario("https://livin-mandiri-verifikasi.xyz", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Phishing Bank Mandiri Livin
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => handleScenario("Pemberitahuan BRImo: Akun Anda dinonaktifkan sementara. Buka tautan untuk aktivasi: https://brimo-aktivasi-rekening.xyz", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Palsu BRImo Akun Terblokir
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => handleScenario("Selamat siang, kurir J&T paket tertahan. Cek foto paket di file LIHAT_FOTO_PAKET.apk", "text")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Resi Palsu Kurir J&amp;T/JNE
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => handleScenario("https://bit.ly/Surat-Undangan-Pernikahan-Digital.apk", "url")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                APK Undangan Pernikahan
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => onNavigate && onNavigate("/trends")}
                class="text-primary-fixed-dim font-bold hover:text-white cursor-pointer transition-colors text-left pt-1 flex items-center gap-1"
              >
                <span>Lihat semua tren siber</span>
                <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Col 3: Company & Information -->
        <div class="flex flex-col gap-2">
          <span class="text-xs uppercase font-bold tracking-wider text-primary-fixed-dim">Informasi &amp; Edukasi</span>
          <ul class="flex flex-col gap-1.5 text-xs text-surface-variant/75">
            <li>
              <button
                type="button"
                onclick={() => onNavigate && onNavigate("/about")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Tentang KrosCheck PRO
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => onNavigate && onNavigate("/how-it-works")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Cara Kerja Sistem
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => onNavigate && onNavigate("/faq")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Tanya Jawab (FAQ)
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => onNavigate && onNavigate("/download")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Pemasangan &amp; Bot Chat
              </button>
            </li>
            <li>
              <button
                type="button"
                onclick={() => onNavigate && onNavigate("/trends")}
                class="hover:text-on-primary cursor-pointer transition-colors text-left"
              >
                Pusat Intelijen Ancaman
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="pt-space-lg border-t border-surface-variant/10 flex flex-col md:flex-row items-center justify-between gap-space-sm text-surface-variant/60 text-xs">
      <p>© {currentYear} ITK Industries • ScamGuard AI. Dikembangkan untuk IDwebhost AI HackFest 2026.</p>
      <div class="flex items-center gap-space-md">
        <button
          type="button"
          onclick={() => onNavigate && onNavigate("/privacy")}
          class="hover:text-on-primary cursor-pointer transition-colors"
        >
          Kebijakan Privasi
        </button>
        <button
          type="button"
          onclick={() => onNavigate && onNavigate("/terms")}
          class="hover:text-on-primary cursor-pointer transition-colors"
        >
          Ketentuan Layanan
        </button>
        <button
          type="button"
          onclick={() => onNavigate && onNavigate("/how-it-works")}
          class="hover:text-on-primary cursor-pointer transition-colors"
        >
          Pusat Keamanan Siber
        </button>
      </div>
    </div>
  </div>
</footer>
