<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="w-full bg-brand-indigo-hero text-on-primary pt-space-xl pb-space-lg mt-auto">
  <div class="max-w-[1200px] mx-auto px-gutter">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl pb-space-xl">
      <!-- Company Info Column -->
      <div class="lg:col-span-4 flex flex-col gap-space-md">
        <div class="flex items-center gap-space-sm">
          <div class="w-9 h-9 rounded-full bg-brand-violet-vibrant flex items-center justify-center">
            <span class="material-symbols-outlined text-on-primary text-[20px]">verified_user</span>
          </div>
          <div>
            <span class="font-headline-sm text-lg font-bold text-on-primary leading-none block">KrosCheck</span>
            <span class="font-label-sm text-xs text-primary-fixed-dim leading-tight">by ITK Industries</span>
          </div>
        </div>
        <p class="text-sm text-surface-variant/80 max-w-sm leading-relaxed">
          Melindungi kehidupan digital sehari-hari dengan kecerdasan tingkat institusi. KrosCheck secara aktif menyaring SMS mencurigakan, akun pembayaran, tautan, dan nomor penelepon tak dikenal sebelum penipuan terjadi.
        </p>
        
        <!-- Badges -->
        <div class="flex flex-wrap items-center gap-space-sm pt-space-xs">
          <div class="px-3 py-1.5 rounded-lg bg-surface-variant/10 flex items-center gap-2">
            <span class="material-symbols-outlined text-status-safe-green text-[18px]">star</span>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-primary">Trustpilot</span>
              <span class="text-[11px] text-surface-variant/70">Rating 4.9 / 5.0</span>
            </div>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-surface-variant/10 flex items-center gap-2">
            <span class="material-symbols-outlined text-status-safe-green text-[18px]">verified</span>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-primary">BBB Accredited</span>
              <span class="text-[11px] text-surface-variant/70">Keandalan A+</span>
            </div>
          </div>
        </div>

        <!-- App Store Buttons -->
        <div class="flex items-center gap-space-sm pt-space-xs">
          <div class="px-3 py-1.5 rounded-full bg-surface-variant/10 flex items-center gap-1.5 hover:bg-surface-variant/20 transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span class="text-xs font-semibold">App Store</span>
          </div>
          <div class="px-3 py-1.5 rounded-full bg-surface-variant/10 flex items-center gap-1.5 hover:bg-surface-variant/20 transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">shop</span>
            <span class="text-xs font-semibold">Google Play</span>
          </div>
        </div>
      </div>

      <!-- Links Columns -->
      <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-space-lg">
        <div class="flex flex-col gap-2">
          <span class="text-xs uppercase font-bold tracking-wider text-primary-fixed-dim">Alat Cek Penipuan</span>
          <ul class="flex flex-col gap-1.5 text-xs text-surface-variant/75">
            <li class="hover:text-on-primary cursor-pointer transition-colors">Cek penipuan WhatsApp</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Cek SMS perbankan palsu</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Cek tautan phishing .xyz</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Cek malware berkas APK</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Deteksi surat tilang ETLE</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Cek modus undangan pernikahan</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Verifikasi domain resmi</li>
          </ul>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-xs uppercase font-bold tracking-wider text-primary-fixed-dim">Tren Penipuan Siber</span>
          <ul class="flex flex-col gap-1.5 text-xs text-surface-variant/75">
            <li class="hover:text-on-primary cursor-pointer transition-colors">Kenaikan Tarif Transfer BCA</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Phishing Bank Mandiri Livin</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Palsu BRImo Akun Terblokir</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Resi Palsu Kurir Paket JNE/J&T</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">APK Undangan Pernikahan</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Modus Tagihan Pajak PBB</li>
          </ul>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-xs uppercase font-bold tracking-wider text-primary-fixed-dim">Perusahaan</span>
          <ul class="flex flex-col gap-1.5 text-xs text-surface-variant/75">
            <li class="hover:text-on-primary cursor-pointer transition-colors">Tentang ScamGuard</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Mitra Keamanan Siber</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Tanya Jawab (FAQ)</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Pusat Bantuan Darurat</li>
            <li class="hover:text-on-primary cursor-pointer transition-colors">Hubungi Kami</li>
          </ul>
          
          <div class="pt-2 flex items-center gap-2">
            <span class="w-7 h-7 rounded-full bg-surface-variant/10 flex items-center justify-center hover:bg-surface-variant/20 transition-colors cursor-pointer text-on-primary">
              <span class="material-symbols-outlined text-[16px]">share</span>
            </span>
            <span class="w-7 h-7 rounded-full bg-surface-variant/10 flex items-center justify-center hover:bg-surface-variant/20 transition-colors cursor-pointer text-on-primary">
              <span class="material-symbols-outlined text-[16px]">rss_feed</span>
            </span>
            <span class="w-7 h-7 rounded-full bg-surface-variant/10 flex items-center justify-center hover:bg-surface-variant/20 transition-colors cursor-pointer text-on-primary">
              <span class="material-symbols-outlined text-[16px]">shield_person</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="pt-space-lg border-t border-surface-variant/10 flex flex-col md:flex-row items-center justify-between gap-space-sm text-surface-variant/60 text-xs">
      <p>© {currentYear} ITK Industries, Inc. Hak cipta dilindungi undang-undang.</p>
      <div class="flex items-center gap-space-md">
        <span class="hover:text-on-primary cursor-pointer transition-colors">Kebijakan Privasi</span>
        <span class="hover:text-on-primary cursor-pointer transition-colors">Ketentuan Layanan</span>
        <span class="hover:text-on-primary cursor-pointer transition-colors">Pusat Keamanan Siber</span>
      </div>
    </div>
  </div>
</footer>
