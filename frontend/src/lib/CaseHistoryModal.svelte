<script lang="ts">
  import type { CaseHistoryItem } from "../types";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelectCase: (item: CaseHistoryItem) => void;
  }

  let { isOpen, onClose, onSelectCase }: Props = $props();

  let historyItems = $state<CaseHistoryItem[]>([]);

  $effect(() => {
    if (isOpen && typeof window !== "undefined") {
      loadHistory();
    }
  });

  function loadHistory() {
    try {
      const raw = localStorage.getItem("kroscheck_history");
      if (raw) {
        historyItems = JSON.parse(raw);
      } else {
        historyItems = [];
      }
    } catch {
      historyItems = [];
    }
  }

  function clearHistory() {
    if (confirm("Hapus seluruh riwayat pemeriksaan dari perangkat ini?")) {
      localStorage.removeItem("kroscheck_history");
      historyItems = [];
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-indigo-hero/60 backdrop-blur-sm animate-fade-in">
    <div class="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-bright">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">history_edu</span>
          <h3 class="font-bold text-base text-brand-indigo-hero">Riwayat Pemeriksaan Siber</h3>
        </div>
        <button
          type="button"
          onclick={onClose}
          class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant transition-colors"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- List Content -->
      <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
        {#if historyItems.length === 0}
          <div class="py-12 flex flex-col items-center justify-center text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl text-outline-variant mb-2">find_in_page</span>
            <p class="text-sm font-semibold">Belum ada riwayat kasus yang tersimpan.</p>
            <p class="text-xs text-on-surface-variant/70 mt-1">Lakukan pemeriksaan pertama Anda dari beranda.</p>
          </div>
        {:else}
          {#each historyItems as item}
            <div class="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-between gap-3 hover:border-primary/40 transition-colors">
              <div class="truncate flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono text-xs font-bold text-brand-indigo-hero">{item.case_id}</span>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full {item.risk >= 75
                      ? 'bg-status-scam-bg text-status-scam-red'
                      : item.risk >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-status-safe-bg text-status-safe-green'}"
                  >
                    Risiko {item.risk}%
                  </span>
                  <span class="text-[10px] font-mono text-on-surface-variant/70">{item.timestamp}</span>
                </div>
                <p class="text-xs text-on-surface-variant truncate font-medium">{item.content}</p>
              </div>
              <button
                type="button"
                onclick={() => {
                  onSelectCase(item);
                  onClose();
                }}
                class="sg-btn-secondary text-xs py-1.5 px-3 shrink-0 hover:scale-105 transition-transform"
              >
                Buka
              </button>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Footer Actions -->
      <div class="px-6 py-3 border-t border-border-subtle flex items-center justify-between bg-surface-container-low/50">
        {#if historyItems.length > 0}
          <button
            type="button"
            onclick={clearHistory}
            class="text-xs text-error hover:underline flex items-center gap-1 font-semibold"
          >
            <span class="material-symbols-outlined text-[16px]">delete</span>
            Bersihkan Riwayat
          </button>
        {:else}
          <div></div>
        {/if}
        <button
          type="button"
          onclick={onClose}
          class="px-4 py-2 rounded-full bg-surface-container text-brand-indigo-hero text-xs font-bold hover:bg-surface-container-high transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
{/if}
