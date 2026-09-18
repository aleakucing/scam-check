<script lang="ts">
  interface Props {
    historyCount?: number;
    onOpenHistory?: () => void;
    onNavigateHome?: () => void;
  }

  let { historyCount = 0, onOpenHistory, onNavigateHome }: Props = $props();
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
      <button type="button" onclick={onNavigateHome} class="text-primary font-bold hover:text-brand-violet-hover transition-colors">Cara kerja</button>
      <a href="#faq" class="text-on-surface-variant hover:text-primary transition-colors">Tanya Jawab</a>
      <a href="#download" class="text-on-surface-variant hover:text-primary transition-colors">Unduh aplikasi</a>
      <a href="#trends" class="text-on-surface-variant hover:text-primary transition-colors">Tren Penipuan</a>
      <a href="#about" class="text-on-surface-variant hover:text-primary transition-colors">Tentang Kami</a>
    </nav>

    <!-- Header Actions -->
    <div class="flex items-center gap-space-sm">
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
        href="https://t.me"
        target="_blank"
        rel="noreferrer"
        class="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-brand-violet-vibrant text-on-primary text-xs font-bold hover:bg-brand-violet-hover transition-colors shadow-sm"
      >
        Telegram
      </a>

      <!-- WhatsApp Bot Link -->
      <a
        href="https://wa.me"
        target="_blank"
        rel="noreferrer"
        class="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-brand-violet-vibrant text-on-primary text-xs font-bold hover:bg-brand-violet-hover transition-colors shadow-sm"
      >
        WhatsApp Bot
      </a>
    </div>
  </div>
</header>
