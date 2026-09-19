<script lang="ts">
  interface Props {
    historyCount?: number;
    currentRoute?: string;
    onOpenHistory?: () => void;
    onNavigateHome?: () => void;
    onNavigate?: (route: string, hash?: string) => void;
  }

  let { historyCount = 0, currentRoute = "/", onOpenHistory, onNavigateHome, onNavigate }: Props = $props();

  let isMobileMenuOpen = $state<boolean>(false);
  let fontScale = $state<"normal" | "large" | "xlarge">("normal");

  $effect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kroscheck_font_scale") as "normal" | "large" | "xlarge";
      if (saved && (saved === "normal" || saved === "large" || saved === "xlarge")) {
        setFontScale(saved);
      }
    }
  });

  function setFontScale(scale: "normal" | "large" | "xlarge") {
    fontScale = scale;
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("font-scale-lg", "font-scale-xl");
      if (scale === "large") document.documentElement.classList.add("font-scale-lg");
      if (scale === "xlarge") document.documentElement.classList.add("font-scale-xl");
      try {
        localStorage.setItem("kroscheck_font_scale", scale);
      } catch {}
    }
  }

  function handleNavClick(route: string, hash: string) {
    isMobileMenuOpen = false;
    if (onNavigate) {
      onNavigate(route, hash);
    } else if (onNavigateHome) {
      onNavigateHome();
    }
  }
</script>

<header class="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(28,0,79,0.04)]">
  <div class="h-20 max-w-[1200px] mx-auto px-gutter flex items-center justify-between gap-space-md">
    <!-- Brand Logo -->
    <button 
      type="button" 
      onclick={onNavigateHome}
      class="flex items-center gap-space-sm text-left focus:outline-none cursor-pointer group"
    >
      <div class="w-9 h-9 rounded-full bg-brand-violet-vibrant text-on-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
        <span class="material-symbols-outlined text-[20px]">verified_user</span>
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="font-headline-sm text-headline-sm text-brand-indigo-hero leading-none tracking-tight font-extrabold">KrosCheck</span>
          <span class="px-1.5 py-0.5 rounded bg-surface-container text-primary font-label-sm text-[10px] font-bold leading-none">PRO</span>
        </div>
        <span class="font-label-sm text-[11px] text-on-surface-variant leading-tight">by ITK Industries</span>
      </div>
    </button>

    <!-- Desktop Navigation -->
    <nav class="hidden lg:flex items-center gap-space-lg text-sm font-semibold">
      <button
        type="button"
        onclick={() => handleNavClick("/how-it-works", "how-it-works")}
        class="transition-colors cursor-pointer {currentRoute === '/how-it-works' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}"
      >
        Cara kerja
      </button>

      <button
        type="button"
        onclick={() => handleNavClick("/faq", "faq")}
        class="transition-colors cursor-pointer {currentRoute === '/faq' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}"
      >
        Tanya Jawab
      </button>

      <button
        type="button"
        onclick={() => handleNavClick("/download", "download")}
        class="transition-colors cursor-pointer {currentRoute === '/download' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}"
      >
        Unduh aplikasi
      </button>

      <button
        type="button"
        onclick={() => handleNavClick("/trends", "trends")}
        class="transition-colors cursor-pointer {currentRoute === '/trends' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}"
      >
        Tren Penipuan
      </button>

      <button
        type="button"
        onclick={() => handleNavClick("/about", "about")}
        class="transition-colors cursor-pointer {currentRoute === '/about' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}"
      >
        Tentang Kami
      </button>
    </nav>

    <!-- Header Actions -->
    <div class="flex items-center gap-2 sm:gap-space-sm">
      <!-- Elderly Accessibility Font Scaler [A] [A+] [A++] -->
      <div class="inline-flex items-center p-0.5 rounded-full bg-surface-container border border-border-subtle/80 text-[11px] font-bold" title="Ukuran Teks (Ramah Lansia)">
        <button
          type="button"
          onclick={() => setFontScale("normal")}
          class="px-2 py-0.5 rounded-full transition-all cursor-pointer {fontScale === 'normal' ? 'bg-brand-violet-vibrant text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          title="Ukuran Font Normal"
          aria-label="Ukuran font normal"
        >
          A
        </button>
        <button
          type="button"
          onclick={() => setFontScale("large")}
          class="px-2 py-0.5 rounded-full transition-all cursor-pointer {fontScale === 'large' ? 'bg-brand-violet-vibrant text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          title="Ukuran Font Besar (+12%)"
          aria-label="Ukuran font besar"
        >
          A+
        </button>
        <button
          type="button"
          onclick={() => setFontScale("xlarge")}
          class="px-2 py-0.5 rounded-full transition-all cursor-pointer {fontScale === 'xlarge' ? 'bg-brand-violet-vibrant text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}"
          title="Ukuran Font Ekstra Besar (+25% Ramah Lansia)"
          aria-label="Ukuran font ekstra besar"
        >
          A++
        </button>
      </div>

      <!-- History Vault Trigger -->
      <button
        type="button"
        onclick={onOpenHistory}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-brand-indigo-hero text-xs font-semibold hover:bg-surface-container-high transition-colors relative cursor-pointer"
        title="Riwayat Pemeriksaan Kasus"
      >
        <span class="material-symbols-outlined text-[16px]">history</span>
        <span class="hidden sm:inline">Riwayat</span>
        {#if historyCount > 0}
          <span class="px-1.5 py-0.2 rounded-full bg-brand-violet-vibrant text-white text-[10px] font-bold leading-tight">
            {historyCount}
          </span>
        {/if}
      </button>

      <!-- Telegram Bot Link -->
      <a
        href="#"
        onclick={(e) => e.preventDefault()}
        title="Bot Telegram segera hadir"
        rel="noreferrer"
        class="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-full bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors shadow-sm"
      >
        Telegram
      </a>

      <!-- WhatsApp Bot Link -->
      <a
        href="#"
        onclick={(e) => e.preventDefault()}
        title="Bot WhatsApp segera hadir"
        rel="noreferrer"
        class="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
      >
        WhatsApp
      </a>

      <!-- Mobile Hamburger Toggle -->
      <button
        type="button"
        onclick={() => { isMobileMenuOpen = !isMobileMenuOpen; }}
        class="lg:hidden p-2 rounded-xl text-brand-indigo-hero hover:bg-surface-container transition-colors cursor-pointer"
        aria-label="Menu Navigasi"
      >
        <span class="material-symbols-outlined text-[24px]">
          {isMobileMenuOpen ? 'close' : 'menu'}
        </span>
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown Menu -->
  {#if isMobileMenuOpen}
    <div class="lg:hidden w-full bg-surface-container-lowest border-b border-border-subtle px-gutter py-4 flex flex-col gap-3 shadow-lg animate-in fade-in duration-200">
      <button
        type="button"
        onclick={() => handleNavClick("/how-it-works", "how-it-works")}
        class="text-left py-2 px-3 rounded-lg text-sm font-bold text-brand-indigo-hero hover:bg-surface-container transition-colors"
      >
        Cara kerja
      </button>
      <button
        type="button"
        onclick={() => handleNavClick("/faq", "faq")}
        class="text-left py-2 px-3 rounded-lg text-sm font-bold text-brand-indigo-hero hover:bg-surface-container transition-colors"
      >
        Tanya Jawab
      </button>
      <button
        type="button"
        onclick={() => handleNavClick("/download", "download")}
        class="text-left py-2 px-3 rounded-lg text-sm font-bold text-brand-indigo-hero hover:bg-surface-container transition-colors"
      >
        Unduh aplikasi
      </button>
      <button
        type="button"
        onclick={() => handleNavClick("/trends", "trends")}
        class="text-left py-2 px-3 rounded-lg text-sm font-bold text-brand-indigo-hero hover:bg-surface-container transition-colors"
      >
        Tren Penipuan
      </button>
      <button
        type="button"
        onclick={() => handleNavClick("/about", "about")}
        class="text-left py-2 px-3 rounded-lg text-sm font-bold text-brand-indigo-hero hover:bg-surface-container transition-colors"
      >
        Tentang Kami
      </button>
      
      <div class="py-2 px-3 flex items-center justify-between border-t border-border-subtle text-xs">
        <span class="font-bold text-on-surface-variant flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-brand-violet-vibrant">format_size</span>
          <span>Ukuran Teks:</span>
        </span>
        <div class="inline-flex items-center p-0.5 rounded-full bg-surface-container border border-border-subtle/80 text-xs font-bold">
          <button
            type="button"
            onclick={() => setFontScale("normal")}
            class="px-2.5 py-1 rounded-full cursor-pointer {fontScale === 'normal' ? 'bg-brand-violet-vibrant text-white' : 'text-on-surface-variant'}"
          >
            A
          </button>
          <button
            type="button"
            onclick={() => setFontScale("large")}
            class="px-2.5 py-1 rounded-full cursor-pointer {fontScale === 'large' ? 'bg-brand-violet-vibrant text-white' : 'text-on-surface-variant'}"
          >
            A+
          </button>
          <button
            type="button"
            onclick={() => setFontScale("xlarge")}
            class="px-2.5 py-1 rounded-full cursor-pointer {fontScale === 'xlarge' ? 'bg-brand-violet-vibrant text-white' : 'text-on-surface-variant'}"
          >
            A++
          </button>
        </div>
      </div>

      <div class="pt-2 border-t border-border-subtle flex items-center gap-2">
        <a
          href="#"
          onclick={(e) => e.preventDefault()}
          title="Bot Telegram segera hadir"
          rel="noreferrer"
          class="flex-1 py-2 rounded-full bg-sky-600 text-white text-xs font-bold text-center"
        >
          Telegram Bot
        </a>
        <a
          href="#"
          onclick={(e) => e.preventDefault()}
          title="Bot WhatsApp segera hadir"
          rel="noreferrer"
          class="flex-1 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold text-center"
        >
          WhatsApp Bot
        </a>
      </div>
    </div>
  {/if}
</header>
