<script lang="ts">
  interface Props {
    onNavigateHome: () => void;
    channel?: string;
  }

  let { onNavigateHome, channel = "" }: Props = $props();

  const channelLabel = $derived(
    channel === "whatsapp" ? "Bot WhatsApp" : channel === "telegram" ? "Bot Telegram" : "Saluran ini"
  );
</script>

<div class="w-full max-w-[760px] mx-auto px-gutter py-16 flex flex-col gap-8">
  <button
    type="button"
    onclick={onNavigateHome}
    class="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-brand-violet-hover transition-colors cursor-pointer self-start"
  >
    <span class="material-symbols-outlined text-[18px]">arrow_back</span>
    <span>Kembali ke Beranda</span>
  </button>

  <div class="p-8 sm:p-12 rounded-3xl bg-white border border-border-subtle flex flex-col items-center text-center gap-4">
    <div class="w-16 h-16 rounded-full bg-surface-ice-blue flex items-center justify-center text-primary">
      <span class="material-symbols-outlined text-[36px]">schedule</span>
    </div>
    <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
      Coming Soon
    </span>
    <h1 class="text-3xl sm:text-4xl font-extrabold text-brand-indigo-hero tracking-tight">
      {channelLabel} segera hadir
    </h1>
    <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-lg">
      KrosCheck lewat {channelLabel} masih dalam pengembangan. Pemeriksaan bukti digital tetap bisa dilakukan sekarang melalui situs web.
    </p>
    <button
      type="button"
      onclick={onNavigateHome}
      class="mt-2 px-6 py-3 rounded-full bg-brand-indigo-hero hover:bg-brand-violet-vibrant text-white text-sm font-bold cursor-pointer"
    >
      Periksa lewat web
    </button>
  </div>
</div>
