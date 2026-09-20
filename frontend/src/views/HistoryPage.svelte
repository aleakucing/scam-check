<script lang="ts">
  import { onMount } from "svelte";
  import type { CaseHistoryItem, AnalyzeResponse, EvidenceType } from "../types";
  import { maskSensitiveData } from "../services/api";
  import { speakIndonesian, stopSpeaking } from "../services/tts";

  function getRiskColor(score: number): { text: string; bg: string; border: string } {
    if (score >= 75) {
      return {
        text: "text-status-scam-red",
        bg: "bg-status-scam-bg",
        border: "border-red-200"
      };
    }
    if (score >= 50) {
      return {
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200"
      };
    }
    if (score >= 25) {
      return {
        text: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200"
      };
    }
    return {
      text: "text-status-safe-green",
      bg: "bg-status-safe-bg",
      border: "border-emerald-200"
    };
  }

  function riskMeta(score: number): { label: string; icon: string; dot: string } {
    if (score >= 75) return { label: "VERY HIGH RISK", icon: "dangerous", dot: "bg-status-scam-red" };
    if (score >= 50) return { label: "HIGH RISK", icon: "warning", dot: "bg-amber-500" };
    if (score >= 25) return { label: "MEDIUM RISK", icon: "info", dot: "bg-blue-600" };
    return { label: "LOW RISK / SAFE", icon: "verified_user", dot: "bg-status-safe-green" };
  }

  function evidenceIcon(type?: string): string {
    const t = (type || "").toLowerCase();
    if (t.includes("image") || t.includes("gambar") || t.includes("screenshot")) return "image";
    if (t.includes("text") || t.includes("teks") || t.includes("chat") || t.includes("pesan")) return "chat";
    if (t.includes("voice") || t.includes("suara") || t.includes("audio")) return "mic";
    return "link";
  }

  interface Props {
    onNavigateHome: () => void;
    onSelectCase: (item: CaseHistoryItem) => void;
    onNavigate?: (route: string) => void;
  }

  let { onNavigateHome, onSelectCase, onNavigate }: Props = $props();

  let historyItems = $state<CaseHistoryItem[]>([]);
  let selectedItem = $state<CaseHistoryItem | null>(null);
  let isSpeaking = $state<boolean>(false);
  let copyFeedback = $state<boolean>(false);

  onMount(() => {
    loadHistory();
    return () => {
      stopSpeaking();
    };
  });

  function loadHistory() {
    try {
      const raw = localStorage.getItem("kroscheck_history");
      if (raw) {
        historyItems = JSON.parse(raw);
        if (historyItems.length > 0 && !selectedItem) {
          selectedItem = historyItems[0];
        }
      } else {
        historyItems = [];
        selectedItem = null;
      }
    } catch {
      historyItems = [];
      selectedItem = null;
    }
  }

  function clearHistory() {
    if (confirm("Hapus seluruh riwayat pemeriksaan dari perangkat ini?")) {
      localStorage.removeItem("kroscheck_history");
      historyItems = [];
      selectedItem = null;
      stopSpeaking();
      isSpeaking = false;
    }
  }

  function handleSelect(item: CaseHistoryItem) {
    selectedItem = item;
    if (isSpeaking) {
      stopSpeaking();
      isSpeaking = false;
    }
  }

  function togglePlayAudio() {
    if (!selectedItem) return;

    if (isSpeaking) {
      stopSpeaking();
      isSpeaking = false;
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const riskText = selectedItem.risk >= 75 ? "Sangat Berbahaya" : selectedItem.risk >= 50 ? "Tinggi" : selectedItem.risk >= 25 ? "Sedang" : "Rendah atau Aman";
      const narration = `Laporan Riwayat Kasus ${selectedItem.case_id}. Skor risiko ${selectedItem.risk} persen, kategori ${riskText}. Ringkasan temuan: ${selectedItem.summary || "Tidak ada rincian tambahan"}.`;
      
      isSpeaking = true;
      speakIndonesian(narration, {
        rate: 0.92,
        onEnd: () => { isSpeaking = false; },
        onError: () => { isSpeaking = false; }
      });
    } else {
      alert("Fitur suara tidak didukung pada peramban ini.");
    }
  }

  function printReportPdf() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  function downloadReportDocument() {
    if (!selectedItem) return;

    const riskLabel = selectedItem.risk >= 75 ? "VERY HIGH RISK (BAHAYA KRITIS)" : selectedItem.risk >= 50 ? "HIGH RISK (BAHAYA TINGGI)" : selectedItem.risk >= 25 ? "MEDIUM RISK (WASPADA)" : "LOW RISK / SAFE (AMAN)";

    const reportText = `===============================================================
LAPORAN INVESTIGASI RISIKO SIBER - KROSCHECK PRO
Platform Keamanan Digital & Intelijen Anti-Scam Indonesia
===============================================================
ID KASUS           : ${selectedItem.case_id}
WAKTU ANALISIS     : ${selectedItem.timestamp}
TIPE BUKTI         : ${(selectedItem.evidence_type || "digital").toUpperCase()}
SKOR RISIKO        : ${selectedItem.risk}/100
TINGKAT STATUS     : ${riskLabel}
---------------------------------------------------------------
BUKTI DIGITAL YANG DIPERIKSA (PII MASKED):
${selectedItem.content}
---------------------------------------------------------------
RINGKASAN TEMUAN SISTEM:
${selectedItem.summary || "Pemeriksaan selesai melalui ScamGuard AI & Heuristic Shield."}
===============================================================
Diverifikasi oleh KrosCheck Cyber Defense System.
Hak Cipta © 2026 KrosCheck PRO - IDwebhost Cyber Security.
===============================================================`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan-Riwayat-${selectedItem.case_id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function copyEvidence(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copyFeedback = true;
      setTimeout(() => { copyFeedback = false; }, 2000);
    } catch {}
  }
</script>

<style>
  @keyframes dossier-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes case-in {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .dossier-enter { animation: dossier-in 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
  .case-enter { animation: case-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @media (prefers-reduced-motion: reduce) {
    .dossier-enter, .case-enter { animation: none; }
  }
</style>

<div class="max-w-[1200px] mx-auto px-gutter py-8 flex flex-col gap-6" id="history-print-area">
  <!-- Breadcrumb + actions -->
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
      <button type="button" onclick={onNavigateHome} class="hover:text-primary font-bold transition-colors cursor-pointer">
        Beranda
      </button>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <span class="text-brand-indigo-hero font-bold">Riwayat</span>
    </div>

    {#if historyItems.length > 0}
      <button
        type="button"
        onclick={clearHistory}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-red-700 hover:bg-red-50 text-xs font-bold border border-red-200 transition-colors cursor-pointer min-h-[40px]"
      >
        <span class="material-symbols-outlined text-[16px]">delete</span>
        <span>Bersihkan Riwayat</span>
      </button>
    {/if}
  </div>

  <!-- Title -->
  <div class="flex flex-col gap-1.5 max-w-2xl">
    <h1 class="text-2xl sm:text-3xl font-extrabold text-brand-indigo-hero tracking-tight">
      Riwayat Pemeriksaan
    </h1>
  </div>

  {#if historyItems.length === 0}
    <!-- Empty State -->
    <div class="p-10 sm:p-14 rounded-3xl border-2 border-dashed border-border-subtle bg-surface-container-low text-center flex flex-col items-center gap-4 my-4">
      <div class="w-16 h-16 rounded-2xl bg-white border border-border-subtle flex items-center justify-center text-primary shadow-sm">
        <span class="material-symbols-outlined text-4xl">history_edu</span>
      </div>
      <div class="flex flex-col gap-1.5 max-w-md">
        <h3 class="text-lg font-extrabold text-brand-indigo-hero">Belum ada yang diperiksa</h3>
        <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Tautan, pesan, atau tangkapan layar yang Anda periksa akan otomatis tersimpan di sini sebagai arsip pribadi.
        </p>
      </div>
      <button
        type="button"
        onclick={onNavigateHome}
        class="mt-1 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-brand-blue-hover text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer min-h-[48px]"
      >
        <span class="material-symbols-outlined text-[18px]">search</span>
        <span>Mulai Periksa</span>
      </button>
    </div>
  {:else}
    <!-- Master-detail -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Timeline list -->
      <div class="lg:col-span-5 flex flex-col gap-3">
        <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
          {historyItems.length} kasus tersimpan lokal
        </span>

        <ol class="relative flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-1 pl-1 py-1">
          {#each historyItems as item, idx}
            {@const isSelected = selectedItem?.case_id === item.case_id}
            {@const meta = riskMeta(item.risk)}
            {@const badge = getRiskColor(item.risk)}
            <li class="relative pl-7 case-enter" style={`animation-delay: ${Math.min(idx, 8) * 40}ms`}>
              <span class={`absolute left-[7px] top-5 bottom-[-12px] w-0.5 rounded-full ${idx === historyItems.length - 1 ? "bg-transparent" : "bg-border-subtle"}`} aria-hidden="true"></span>
              <span class={`absolute left-0 top-5 w-4 h-4 rounded-full border-[3px] border-white shadow-sm ${meta.dot}`} aria-hidden="true"></span>
              <button
                type="button"
                onclick={() => handleSelect(item)}
                aria-current={isSelected ? "true" : undefined}
                class="w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 {isSelected ? 'bg-blue-50/60 border-primary shadow-md' : 'bg-white hover:border-outline-variant hover:shadow-sm border-border-subtle'}"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-brand-indigo-hero">
                    <span class="material-symbols-outlined text-[15px] text-on-surface-variant">{evidenceIcon(item.evidence_type)}</span>
                    {item.case_id}
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap {badge.bg} {badge.text}">
                    {item.risk}%
                  </span>
                </div>
                <p class="text-xs text-brand-indigo-hero/90 font-medium line-clamp-2 break-all leading-relaxed">
                  {item.content}
                </p>
                <span class="font-mono text-[10px] text-on-surface-variant">{item.timestamp}</span>
              </button>
            </li>
          {/each}
        </ol>
      </div>

      <!-- Dossier detail -->
      {#if selectedItem}
        {@const riskInfo = getRiskColor(selectedItem.risk)}
        {@const meta = riskMeta(selectedItem.risk)}
        {#key selectedItem.case_id}
        <div class="lg:col-span-7 flex flex-col">
          <article class="dossier-enter rounded-3xl border-2 {riskInfo.border} bg-white overflow-hidden shadow-sm flex flex-col">
            <!-- Risk band -->
            <div class="p-5 sm:p-6 {riskInfo.bg} border-b {riskInfo.border} flex items-center gap-4">
              <div class="flex flex-col leading-none">
                <span class="font-mono text-4xl sm:text-5xl font-extrabold {riskInfo.text} tabular-nums">{selectedItem.risk}</span>
                <span class="font-mono text-xs font-bold {riskInfo.text}">/ 100</span>
              </div>
              <div class="w-px self-stretch {riskInfo.border} border-l-2" aria-hidden="true"></div>
              <div class="flex flex-col gap-1 min-w-0">
                <span class="inline-flex items-center gap-1.5 text-sm font-extrabold {riskInfo.text}">
                  <span class="material-symbols-outlined text-[20px]">{meta.icon}</span>
                  {meta.label}
                </span>
                <span class="font-mono text-xs font-bold text-brand-indigo-hero truncate">{selectedItem.case_id}</span>
                <span class="text-[11px] text-on-surface-variant">{selectedItem.timestamp}</span>
              </div>
            </div>

            <div class="p-5 sm:p-6 flex flex-col gap-5">
              <!-- Toolbar -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onclick={downloadReportDocument}
                  class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand-indigo-hero hover:opacity-90 text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
                >
                  <span class="material-symbols-outlined text-[18px]">description</span>
                  <span>Unduh</span>
                </button>
                <button
                  type="button"
                  onclick={printReportPdf}
                  class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-surface-container text-brand-indigo-hero text-xs font-bold border-2 border-border-subtle transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
                >
                  <span class="material-symbols-outlined text-[18px]">print</span>
                  <span>Cetak PDF</span>
                </button>
                <button
                  type="button"
                  onclick={togglePlayAudio}
                  class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border-2 transition-all active:scale-[0.98] cursor-pointer min-h-[44px] {isSpeaking ? 'bg-red-600 border-red-600 text-white' : 'bg-white hover:bg-blue-50 text-primary border-blue-200'}"
                >
                  <span class="material-symbols-outlined text-[18px]">{isSpeaking ? "stop" : "volume_up"}</span>
                  <span>{isSpeaking ? "Hentikan" : "Dengarkan"}</span>
                </button>
              </div>

              <!-- Evidence -->
              <section class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <h2 class="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    Bukti diperiksa · {(selectedItem.evidence_type || "URL").toUpperCase()}
                  </h2>
                  <button
                    type="button"
                    onclick={() => copyEvidence(selectedItem?.content || '')}
                    class="text-xs text-primary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer min-h-[32px]"
                  >
                    <span class="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>{copyFeedback ? "Tersalin!" : "Salin"}</span>
                  </button>
                </div>
                <p class="font-mono text-xs sm:text-sm text-brand-indigo-hero font-semibold break-all leading-relaxed p-4 rounded-2xl bg-surface border border-border-subtle">
                  {selectedItem.content}
                </p>
              </section>

              <!-- Summary -->
              <section class="flex flex-col gap-2">
                <h2 class="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                  Ringkasan temuan
                </h2>
                <p class="text-xs sm:text-sm text-brand-indigo-hero leading-relaxed p-4 rounded-2xl {riskInfo.bg} border {riskInfo.border}">
                  {selectedItem.summary || "Pemeriksaan selesai. Tidak ditemukan anomali kritis tambahan pada arsip ini."}
                </p>
              </section>

              <div class="flex justify-end pt-1">
                <button
                  type="button"
                  onclick={() => {
                    if (selectedItem) onSelectCase(selectedItem);
                  }}
                  class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-brand-blue-hover text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer min-h-[48px]"
                >
                  <span>Buka Analisis Lengkap</span>
                  <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </article>
        </div>
        {/key}
      {/if}
    </div>
  {/if}
</div>
