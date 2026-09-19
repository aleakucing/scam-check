<script lang="ts">
  import type { CaseHistoryItem, AnalyzeResponse, EvidenceType } from "../types";
  import { maskSensitiveData } from "../services/api";
  import { speakIndonesian, stopSpeaking } from "../services/tts";

  function getRiskColor(score: number): { text: string; bg: string; border: string } {
    if (score >= 75) {
      return {
        text: "text-status-scam-red",
        bg: "bg-status-scam-bg",
        border: "border-status-scam-border"
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
      border: "border-status-safe-border"
    };
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

  $effect(() => {
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
    link.click();
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

<div class="max-w-[1200px] mx-auto px-gutter py-8 flex flex-col gap-6" id="history-print-area">
  <!-- Top Breadcrumb & Title Bar -->
  <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-subtle">
    <div class="flex items-center gap-3">
      <button
        type="button"
        onclick={onNavigateHome}
        class="sg-btn-secondary hover:bg-surface-container"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Kembali ke Beranda</span>
      </button>

      <div class="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant font-medium">
        <span>Beranda</span>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span class="text-brand-indigo-hero font-bold">Riwayat Pemeriksaan</span>
      </div>
    </div>

    {#if historyItems.length > 0}
      <button
        type="button"
        onclick={clearHistory}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold border border-red-200 transition-colors cursor-pointer"
      >
        <span class="material-symbols-outlined text-[16px]">delete</span>
        <span>Bersihkan Riwayat</span>
      </button>
    {/if}
  </div>

  <!-- Page Header Title -->
  <div class="flex flex-col gap-1.5">
    <div class="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
      <span class="material-symbols-outlined text-[18px]">history_edu</span>
      <span>Arsip Bukti Digital Lokal</span>
    </div>
    <h1 class="text-2xl sm:text-3xl font-extrabold text-brand-indigo-hero tracking-tight">
      Riwayat Pemeriksaan Siber
    </h1>
    <p class="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
      Seluruh pemeriksaan yang Anda lakukan tersimpan secara privat di peramban lokal perangkat ini. Anda dapat mengunduh dokumen laporan, mencetak PDF, atau mendengarkan ringkasan audio.
    </p>
  </div>

  {#if historyItems.length === 0}
    <!-- Empty State -->
    <div class="sg-card p-12 text-center flex flex-col items-center justify-center gap-4 border border-border-subtle my-8">
      <div class="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/70">
        <span class="material-symbols-outlined text-4xl">find_in_page</span>
      </div>
      <div class="flex flex-col gap-1 max-w-md">
        <h3 class="text-lg font-bold text-brand-indigo-hero">Belum Ada Riwayat Pemeriksaan</h3>
        <p class="text-xs sm:text-sm text-on-surface-variant">
          Pemeriksaan tautan, pesan teks, atau tangkapan layar yang Anda kirimkan akan otomatis terarsip rapi di halaman ini.
        </p>
      </div>
      <button
        type="button"
        onclick={onNavigateHome}
        class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
      >
        <span class="material-symbols-outlined text-[18px]">search</span>
        <span>Mulai Periksa Sekarang</span>
      </button>
    </div>
  {:else}
    <!-- Main Content: Master-Detail Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Case List (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-3">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Daftar Kasus ({historyItems.length})
          </span>
          <span class="text-[11px] text-on-surface-variant/70 font-mono">Tersimpan di Lokal</span>
        </div>

        <div class="flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
          {#each historyItems as item}
            {@const isSelected = selectedItem?.case_id === item.case_id}
            {@const riskBadge = getRiskColor(item.risk)}
            <button
              type="button"
              onclick={() => handleSelect(item)}
              class="w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 {isSelected ? 'bg-blue-50/70 border-primary shadow-sm' : 'bg-white hover:bg-surface-container-low border-border-subtle'}"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono text-xs font-bold {isSelected ? 'text-primary' : 'text-brand-indigo-hero'}">
                  {item.case_id}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold {riskBadge.bg} {riskBadge.text}">
                  {item.risk}% RISIKO
                </span>
              </div>

              <p class="text-xs text-brand-indigo-hero font-medium line-clamp-2 break-all">
                {item.content}
              </p>

              <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-border-subtle/50">
                <span class="font-mono text-[10px]">{item.timestamp}</span>
                <span class="uppercase font-bold text-[10px] text-primary">{item.evidence_type || 'URL'}</span>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Right Column: Case Detail & Action Toolbar (7 cols) -->
      {#if selectedItem}
        {@const riskInfo = getRiskColor(selectedItem.risk)}
        <div class="lg:col-span-7 flex flex-col gap-5">
          <!-- Detail Card -->
          <div class="sg-card p-6 border-2 {riskInfo.border} flex flex-col gap-5 bg-white">
            
            <!-- Header Meta -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-subtle">
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Nomor Berkas Laporan</span>
                <span class="font-mono text-base font-extrabold text-brand-indigo-hero">{selectedItem.case_id}</span>
                <span class="text-xs text-on-surface-variant">Dianalisis: {selectedItem.timestamp}</span>
              </div>

              <div class="flex flex-col items-end gap-1">
                <span class="px-3 py-1 rounded-full text-xs font-extrabold {riskInfo.bg} {riskInfo.text}">
                  {selectedItem.risk >= 75 ? 'VERY HIGH RISK' : selectedItem.risk >= 50 ? 'HIGH RISK' : selectedItem.risk >= 25 ? 'MEDIUM RISK' : 'LOW RISK / SAFE'}
                </span>
                <span class="text-xs font-mono font-bold text-on-surface-variant">Tingkat Risiko: {selectedItem.risk}%</span>
              </div>
            </div>

            <!-- 3 Required Buttons Toolbar -->
            <div class="flex flex-wrap items-center gap-2 p-3 bg-surface-container-low rounded-xl border border-border-subtle">
              <button
                type="button"
                onclick={downloadReportDocument}
                class="sg-btn-secondary"
                title="Unduh berkas laporan teks"
              >
                <span class="material-symbols-outlined text-[18px]">description</span>
                <span>Unduh Dokumen</span>
              </button>

              <button
                type="button"
                onclick={printReportPdf}
                class="sg-btn-secondary"
                title="Cetak berkas atau simpan sebagai PDF"
              >
                <span class="material-symbols-outlined text-[18px]">print</span>
                <span>Cetak PDF</span>
              </button>

              <button
                type="button"
                onclick={togglePlayAudio}
                class="sg-btn-secondary {isSpeaking ? 'border-primary text-primary bg-blue-50' : ''}"
                title="Dengarkan ringkasan laporan lewat suara"
              >
                <span class="material-symbols-outlined text-[18px]">
                  {isSpeaking ? "volume_off" : "volume_up"}
                </span>
                <span>{isSpeaking ? "Hentikan Audio" : "Dengarkan Audio"}</span>
              </button>
            </div>

            <!-- Evidence Content -->
            <div class="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-container-low border border-border-subtle">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Bukti Digital yang Diperiksa ({selectedItem.evidence_type?.toUpperCase() || 'URL'})
                </span>
                <button
                  type="button"
                  onclick={() => copyEvidence(selectedItem?.content || '')}
                  class="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>{copyFeedback ? "Tersalin!" : "Salin"}</span>
                </button>
              </div>
              <p class="font-mono text-xs sm:text-sm text-brand-indigo-hero font-semibold break-all">
                {selectedItem.content}
              </p>
            </div>

            <!-- Summary -->
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Ringkasan Temuan Investigasi
              </span>
              <p class="text-xs sm:text-sm text-brand-indigo-hero leading-relaxed p-4 rounded-xl bg-surface-container-low border border-border-subtle">
                {selectedItem.summary || "Pemeriksaan selesai. Tidak ditemukan anomali kritis tambahan pada arsip ini."}
              </p>
            </div>

            <!-- Action to open full Result Analysis -->
            <div class="pt-2 flex justify-end">
              <button
                type="button"
                onclick={() => {
                  if (selectedItem) onSelectCase(selectedItem);
                }}
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                <span>Buka Analisis Lengkap</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
