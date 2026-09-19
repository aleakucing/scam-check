<script lang="ts">
  import type {
    AnalyzeResponse,
    InterviewResponse,
    TimelineEvent,
    ActionItem
  } from "../types";
  import {
    submitInterview,
    generateIncidentReport,
    maskSensitiveData
  } from "../services/api";
  import { speakIndonesian, stopSpeaking } from "../services/tts";

  interface Props {
    analysis: AnalyzeResponse;
    evidenceContent: string;
    onBack: () => void;
    onOpenOperator: () => void;
  }

  let { analysis, evidenceContent, onBack, onOpenOperator }: Props = $props();

  // State
  let userExposure = $state<number>(10);
  let exposureLevel = $state<string>("PAPARAN MINIMAL");
  let isEmergency = $state<boolean>(false);
  let statusDesc = $state<string>("Anda baru menerima pesan dan belum berinteraksi lanjut.");

  // Animated Dynamic Counters
  let displayContentRisk = $state<number>(0);
  let displayConfidence = $state<number>(0);
  let displayExposure = $state<number>(0);

  $effect(() => {
    userExposure = analysis.initial_exposure || 10;
  });

  // Animate Content Risk and Confidence on mount or analysis update
  $effect(() => {
    const targetRisk = analysis.content_risk;
    const targetConf = analysis.confidence;
    const duration = 1200;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      displayContentRisk = Math.round(targetRisk * ease);
      displayConfidence = Math.round(targetConf * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        displayContentRisk = targetRisk;
        displayConfidence = targetConf;
      }
    }
    requestAnimationFrame(step);
  });

  // Animate Exposure whenever userExposure changes
  $effect(() => {
    const targetExp = userExposure;
    const startExp = displayExposure;
    const duration = 600;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      displayExposure = Math.round(startExp + (targetExp - startExp) * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        displayExposure = targetExp;
      }
    }
    requestAnimationFrame(step);
  });

  let openedLink = $state<boolean | null>(null);
  let enteredCredentials = $state<boolean | null>(null);
  let enteredOtp = $state<boolean | null>(null);

  let actions = $state<ActionItem[]>([]);
  let completedActions = $state<Record<number, boolean>>({});

  let isSpeaking = $state<boolean>(false);
  let copyFeedback = $state<boolean>(false);

  let timelineEvents = $state<TimelineEvent[]>([
    {
      time: new Date().toLocaleTimeString("id-ID") + " WIB",
      tag: "AUDIT DILUNCURKAN",
      color: "bg-primary",
      text: "Mesin intelijen mendeteksi dan mengkorelasikan bukti digital."
    }
  ]);

  function getRiskColor(score: number): { text: string; bg: string; border: string } {
    if (score >= 75) {
      return { text: "text-status-scam-red", bg: "bg-status-scam-bg", border: "border-status-scam-red" };
    }
    if (score >= 50) {
      return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-400" };
    }
    return { text: "text-status-safe-green", bg: "bg-status-safe-bg", border: "border-status-safe-green" };
  }

  function getIndicatorStyle(level: string) {
    switch (level) {
      case "red":
        return "bg-red-50 text-status-scam-red border-red-200";
      case "orange":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "green":
        return "bg-green-50 text-status-safe-green border-green-200";
      default:
        return "bg-blue-50 text-primary border-blue-200";
    }
  }

  export async function handleAnswerInterview(stepNum: number, answer: boolean) {
    const timeStr = new Date().toLocaleTimeString("id-ID") + " WIB";

    if (stepNum === 1) {
      openedLink = answer;
      if (!answer) {
        enteredCredentials = false;
        enteredOtp = false;
      }
      timelineEvents = [
        ...timelineEvents,
        {
          time: timeStr,
          tag: answer ? "LINK DIKLIK" : "LINK TIDAK DIBUKA",
          color: answer ? "bg-amber-500" : "bg-status-safe-green",
          text: answer
            ? "Pengguna mengonfirmasi sempat membuka tautan."
            : "Pengguna mengonfirmasi tautan tidak dibuka."
        }
      ];
    } else if (stepNum === 2) {
      enteredCredentials = answer;
      if (!answer) {
        enteredOtp = false;
      }
      timelineEvents = [
        ...timelineEvents,
        {
          time: timeStr,
          tag: answer ? "KREDENSIAL DISERAHKAN" : "KREDENSIAL AMAN",
          color: answer ? "bg-status-scam-red" : "bg-status-safe-green",
          text: answer
            ? "Pengguna memasukkan password atau nomor kartu!"
            : "Pengguna tidak memasukkan informasi kredensial."
        }
      ];
    } else if (stepNum === 3) {
      enteredOtp = answer;
      timelineEvents = [
        ...timelineEvents,
        {
          time: timeStr,
          tag: answer ? "KODE OTP DISERAHKAN" : "OTP TIDAK DISERAHKAN",
          color: answer ? "bg-status-scam-red" : "bg-status-safe-green",
          text: answer
            ? "KRITIS: Kode verifikasi SMS OTP diserahkan ke pelaku!"
            : "Kode rahasia OTP berhasil diamankan."
        }
      ];
    }

    try {
      const resp: InterviewResponse = await submitInterview({
        case_id: analysis.case_id,
        content_risk: analysis.content_risk,
        opened_link: openedLink,
        entered_credentials: enteredCredentials,
        entered_otp: enteredOtp
      });

      userExposure = resp.user_exposure;
      exposureLevel = resp.exposure_level;
      isEmergency = resp.is_emergency;
      statusDesc = resp.status_desc;
      actions = resp.actions || resp.recommended_actions || [];
    } catch {
      // local calculation
      if (!openedLink) {
        userExposure = 10;
        exposureLevel = "PAPARAN MINIMAL";
      } else if (openedLink && !enteredCredentials) {
        userExposure = 35;
        exposureLevel = "MEDIUM EXPOSURE";
      } else if (enteredCredentials && !enteredOtp) {
        userExposure = 70;
        exposureLevel = "HIGH EXPOSURE";
        isEmergency = true;
      } else if (enteredOtp) {
        userExposure = 90;
        exposureLevel = "CRITICAL EXPOSURE";
        isEmergency = true;
      }
    }
  }

  // Restore persisted checklist state from localStorage
  $effect(() => {
    if (typeof window !== "undefined" && analysis.case_id) {
      try {
        const saved = localStorage.getItem(`kroscheck_actions_${analysis.case_id}`);
        if (saved) {
          completedActions = JSON.parse(saved);
        }
      } catch {}
    }
  });

  function toggleActionCheck(step: number) {
    completedActions[step] = !completedActions[step];
    if (typeof window !== "undefined" && analysis.case_id) {
      try {
        localStorage.setItem(`kroscheck_actions_${analysis.case_id}`, JSON.stringify(completedActions));
      } catch {}
    }
    if (completedActions[step]) {
      timelineEvents = [
        ...timelineEvents,
        {
          time: new Date().toLocaleTimeString("id-ID") + " WIB",
          tag: "MITIGASI SELESAI",
          color: "bg-status-safe-green",
          text: `Pengguna menyelesaikan langkah mitigasi #${step}.`
        }
      ];
    }
  }

  function toggleAudioNarration() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isSpeaking) {
        stopSpeaking();
        isSpeaking = false;
      } else {
        let narration = `Laporan hasil audit KrosCheck. Tingkat risiko konten ${analysis.content_risk} dari 100. `;
        if (analysis.content_risk >= 75) {
          narration += `Peringatan! Konten ini dinilai sangat berbahaya. Jangan berikan kode SMS verifikasi atau PIN Anda kepada siapapun. `;
        } else {
          narration += `Konten ini memiliki indikator aman dan terdaftar pada institusi resmi. `;
        }
        if (userExposure >= 70) {
          narration += `Segera lakukan penguncian kartu ATM dan hubungi call center resmi bank Anda. `;
        }

        isSpeaking = true;
        speakIndonesian(narration, {
          rate: 0.92,
          onEnd: () => {
            isSpeaking = false;
          },
          onError: () => {
            isSpeaking = false;
          }
        });
      }
    } else {
      alert("Fitur suara tidak didukung pada peramban ini.");
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  function shareToWhatsApp() {
    const masked = maskSensitiveData(evidenceContent);
    let msg = `*PERINGATAN KROSCHECK PRO - LAPORAN KELUARGA*\n\n`;
    msg += `Keluarga tercinta, mohon bantu periksa temuan mencurigakan berikut:\n`;
    msg += `📌 Bukti: "${masked}"\n`;
    msg += `⚠️ Tingkat Bahaya: ${analysis.content_risk}/100 (${analysis.risk_level})\n`;
    msg += `🛡️ Paparan Akun: ${userExposure}/100 (${exposureLevel})\n`;
    if (userExposure >= 70) {
      msg += `🚨 STATUS DARURAT: Password/OTP sempat diisi! Mohon bantu hubungi call center bank untuk kunci rekening!\n`;
    } else {
      msg += `💡 Panduan: Jangan pernah mengklik tautan atau memasang berkas APK apapun.\n`;
    }
    msg += `\nID Kasus: ${analysis.case_id}\nDiverifikasi via KrosCheck Cyber Defense Platform.`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function downloadReportTxt() {
    const report = await generateIncidentReport({
      case_id: analysis.case_id,
      content_risk: analysis.content_risk,
      confidence: analysis.confidence,
      user_exposure: userExposure,
      evidence_type: analysis.evidence_type,
      evidence_content: evidenceContent,
      opened_link: openedLink,
      entered_credentials: enteredCredentials,
      entered_otp: enteredOtp,
      indicators: analysis.indicators
    });

    const blob = new Blob([report.formatted_text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan-Insiden-${analysis.case_id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyEvidence() {
    try {
      await navigator.clipboard.writeText(evidenceContent);
      copyFeedback = true;
      setTimeout(() => { copyFeedback = false; }, 2000);
    } catch {}
  }

  const riskColor = $derived(getRiskColor(analysis.content_risk));
  const maskedEvidence = $derived(maskSensitiveData(evidenceContent));
</script>

<div class="max-w-[1200px] mx-auto px-gutter py-8 flex flex-col gap-6" id="print-area">
  <!-- Top Navigation & Action Bar -->
  <div class="flex flex-wrap items-center justify-between gap-4">
    <button
      type="button"
      onclick={onBack}
      class="sg-btn-secondary hover:bg-surface-container"
    >
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      <span>Periksa Kasus Lain</span>
    </button>

    <div class="flex flex-wrap items-center gap-2">
      <!-- Audio Toggle -->
      <button
        type="button"
        onclick={toggleAudioNarration}
        class="sg-btn-secondary {isSpeaking ? 'border-primary text-primary bg-purple-50' : ''}"
      >
        <span class="material-symbols-outlined text-[18px]">
          {isSpeaking ? "volume_off" : "volume_up"}
        </span>
        <span>{isSpeaking ? "Hentikan Audio" : "Dengarkan Audio"}</span>
      </button>

      <!-- Print PDF -->
      <button type="button" onclick={handlePrint} class="sg-btn-secondary">
        <span class="material-symbols-outlined text-[18px]">print</span>
        <span>Cetak PDF</span>
      </button>

      <!-- Download TXT -->
      <button type="button" onclick={downloadReportTxt} class="sg-btn-secondary">
        <span class="material-symbols-outlined text-[18px]">description</span>
        <span>Unduh Dokumen</span>
      </button>

      <!-- Share WhatsApp -->
      <button
        type="button"
        onclick={shareToWhatsApp}
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
      >
        <span class="material-symbols-outlined text-[18px]">share</span>
        <span>Bagikan ke Keluarga</span>
      </button>
    </div>
  </div>

  <!-- Evidence Banner Card -->
  <div class="sg-card p-6 border border-border-subtle flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
      <div class="flex items-center gap-2.5">
        <span class="font-mono text-sm font-bold text-brand-indigo-hero px-2.5 py-1 rounded bg-surface-container">
          {analysis.case_id}
        </span>
        <span class="text-xs text-on-surface-variant font-medium">
          Diverifikasi pada {analysis.timestamp}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container text-primary flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">smart_toy</span>
          {analysis.source_model}
        </span>
      </div>
    </div>

    <!-- Evidence Content with Masking -->
    <div class="flex items-start justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-border-subtle">
      <div class="flex items-start gap-3 flex-1 overflow-hidden">
        <span class="material-symbols-outlined text-primary text-[22px] mt-0.5">
          {analysis.evidence_type === "url" ? "link" : analysis.evidence_type === "screenshot" ? "image" : "chat"}
        </span>
        <div class="flex-1 overflow-hidden">
          <span class="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">
            BUKTI DIGITAL YANG DIANALISIS ({analysis.evidence_type.toUpperCase()})
          </span>
          <p class="font-mono text-xs sm:text-sm text-brand-indigo-hero font-semibold break-all mt-0.5">
            {maskedEvidence}
          </p>
        </div>
      </div>

      <button
        type="button"
        onclick={copyEvidence}
        class="sg-btn-secondary text-xs shrink-0 py-1.5 px-3"
      >
        <span class="material-symbols-outlined text-[16px]">content_copy</span>
        <span>{copyFeedback ? "Disalin!" : "Salin"}</span>
      </button>
    </div>
  </div>

  <!-- 3D Risk Matrix Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Matrix 1: Content Risk -->
    <div class="sg-card p-6 border-2 {riskColor.border} flex flex-col justify-between gap-4">
      <div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            1. CONTENT RISK (BAHAYA)
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold {riskColor.bg} {riskColor.text}">
            {analysis.risk_level}
          </span>
        </div>
        <div class="mt-4 flex items-baseline gap-2">
          <span class="text-4xl font-extrabold {riskColor.text}">
            {displayContentRisk}%
          </span>
          <span class="text-xs text-on-surface-variant font-medium">/ 100% Bahaya</span>
        </div>
        <!-- Risk Bar -->
        <div class="w-full h-2.5 rounded-full bg-surface-container mt-3 overflow-hidden">
          <div
            class="h-full rounded-full {riskColor.bg.replace('-bg', '-red')}"
            style="width: {displayContentRisk}%; transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);"
          ></div>
        </div>
      </div>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        {analysis.summary}
      </p>
    </div>

    <!-- Matrix 2: AI Confidence -->
    <div class="sg-card p-6 border border-border-subtle flex flex-col justify-between gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            2. CONFIDENCE (KEYAKINAN)
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-surface-container text-primary">
            TERVALIDASI
          </span>
        </div>
        <div class="mt-4 flex items-baseline gap-2">
          <span class="text-4xl font-extrabold text-brand-indigo-hero">
            {displayConfidence}%
          </span>
          <span class="text-xs text-on-surface-variant font-medium">Korelasi Bukti</span>
        </div>
        <!-- Confidence Bar -->
        <div class="w-full h-2.5 rounded-full bg-surface-container mt-3 overflow-hidden">
          <div
            class="h-full rounded-full bg-brand-violet-vibrant"
            style="width: {displayConfidence}%; transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);"
          ></div>
        </div>
      </div>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        Keyakinan model terhadap pola rekayasa sosial berdasarkan basis data phishing dan malware Indonesia.
      </p>
    </div>

    <!-- Matrix 3: User Exposure Level -->
    <div
      class="sg-card p-6 border-2 flex flex-col justify-between gap-4 transition-all duration-300 {userExposure >= 70
        ? 'border-status-scam-red bg-red-50/20 animate-pulse-glow'
        : userExposure >= 35
          ? 'border-amber-400 bg-amber-50/20'
          : 'border-status-safe-green bg-green-50/20'}"
    >
      <div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            3. USER EXPOSURE (PAPARAN)
          </span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-extrabold {userExposure >= 70
              ? 'bg-status-scam-bg text-status-scam-red animate-pulse'
              : userExposure >= 35
                ? 'bg-amber-100 text-amber-800'
                : 'bg-status-safe-bg text-status-safe-green'}"
          >
            {exposureLevel}
          </span>
        </div>
        <div class="mt-4 flex items-baseline gap-2">
          <span
            class="text-4xl font-extrabold {userExposure >= 70
              ? 'text-status-scam-red'
              : userExposure >= 35
                ? 'text-amber-600'
                : 'text-status-safe-green'}"
          >
            {displayExposure}%
          </span>
          <span class="text-xs text-on-surface-variant font-medium">Tingkat Penetrasi</span>
        </div>
        <!-- Exposure Bar -->
        <div class="w-full h-2.5 rounded-full bg-surface-container mt-3 overflow-hidden">
          <div
            class="h-full rounded-full {userExposure >= 70
              ? 'bg-status-scam-red'
              : userExposure >= 35
                ? 'bg-amber-500'
                : 'bg-status-safe-green'}"
            style="width: {displayExposure}%; transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);"
          ></div>
        </div>
      </div>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        {statusDesc}
      </p>
    </div>
  </div>

  <!-- Senior Operator Button Callout -->
  <div class="p-5 rounded-2xl bg-gradient-to-r from-brand-indigo-hero to-primary text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
    <div class="flex items-center gap-3 text-center sm:text-left">
      <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-white text-[28px]">support_agent</span>
      </div>
      <div>
        <h3 class="text-base font-bold text-white">Butuh Panduan Khusus / Ramah Lansia?</h3>
        <p class="text-xs text-white/80">
          Gunakan panduan suara 1-per-1 dengan tombol berukuran besar dan instruksi telepon darurat bank.
        </p>
      </div>
    </div>

    <button
      type="button"
      onclick={onOpenOperator}
      class="px-5 py-2.5 rounded-full bg-white text-brand-indigo-hero font-bold text-xs hover:bg-surface-bright transition-all shadow-sm shrink-0 cursor-pointer"
    >
      Buka Panduan Suara Lansia
    </button>
  </div>

  <!-- Adaptive Interview Section -->
  <div class="sg-card p-6 border border-border-subtle flex flex-col gap-5">
    <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[22px]">quiz</span>
        <h3 class="font-bold text-base text-brand-indigo-hero">
          Wawancara Risiko Terarah: Sejauh Apa Interaksi Anda?
        </h3>
      </div>
      <span class="text-xs text-on-surface-variant font-medium">Evaluasi Real-time</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Question 1 -->
      <div class="p-4 rounded-xl border flex flex-col justify-between gap-3 {openedLink === true ? 'border-amber-400 bg-amber-50/30' : openedLink === false ? 'border-green-300 bg-green-50/20' : 'border-border-subtle bg-surface-container-low'}">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Langkah 1</span>
          <p class="text-xs font-bold text-brand-indigo-hero mt-1">
            Apakah Anda sempat menekan atau membuka tautan/file ini?
          </p>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onclick={() => handleAnswerInterview(1, true)}
            class="py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer {openedLink === true ? 'bg-amber-600 text-white border-amber-600' : 'bg-white hover:bg-amber-50 border-border-subtle'}"
          >
            Ya, Buka
          </button>
          <button
            type="button"
            onclick={() => handleAnswerInterview(1, false)}
            class="py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer {openedLink === false ? 'bg-status-safe-green text-white border-status-safe-green' : 'bg-white hover:bg-green-50 border-border-subtle'}"
          >
            Tidak
          </button>
        </div>
      </div>

      <!-- Question 2 -->
      <div class="p-4 rounded-xl border flex flex-col justify-between gap-3 {enteredCredentials === true ? 'border-status-scam-red bg-red-50/30' : enteredCredentials === false ? 'border-green-300 bg-green-50/20' : 'border-border-subtle bg-surface-container-low'}">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Langkah 2</span>
          <p class="text-xs font-bold text-brand-indigo-hero mt-1">
            Apakah Anda sempat menginput password, nomor kartu ATM, atau PIN?
          </p>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onclick={() => handleAnswerInterview(2, true)}
            class="py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer {enteredCredentials === true ? 'bg-status-scam-red text-white border-status-scam-red' : 'bg-white hover:bg-red-50 border-border-subtle'}"
          >
            Ya, Diisi
          </button>
          <button
            type="button"
            onclick={() => handleAnswerInterview(2, false)}
            class="py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer {enteredCredentials === false ? 'bg-status-safe-green text-white border-status-safe-green' : 'bg-white hover:bg-green-50 border-border-subtle'}"
          >
            Tidak
          </button>
        </div>
      </div>

      <!-- Question 3 -->
      <div class="p-4 rounded-xl border flex flex-col justify-between gap-3 {enteredOtp === true ? 'border-status-scam-red bg-red-50/30' : enteredOtp === false ? 'border-green-300 bg-green-50/20' : 'border-border-subtle bg-surface-container-low'}">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Langkah 3</span>
          <p class="text-xs font-bold text-brand-indigo-hero mt-1">
            Apakah Anda sempat memberikan kode SMS OTP / verifikasi login?
          </p>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onclick={() => handleAnswerInterview(3, true)}
            class="py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer {enteredOtp === true ? 'bg-status-scam-red text-white border-status-scam-red' : 'bg-white hover:bg-red-50 border-border-subtle'}"
          >
            Ya, Berikan
          </button>
          <button
            type="button"
            onclick={() => handleAnswerInterview(3, false)}
            class="py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer {enteredOtp === false ? 'bg-status-safe-green text-white border-status-safe-green' : 'bg-white hover:bg-green-50 border-border-subtle'}"
          >
            Tidak
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Emergency Mitigation Checklist & Hotlines -->
  {#if userExposure >= 35 || isEmergency || analysis.content_risk >= 75}
    <div class="sg-card p-6 border-2 border-status-scam-red/50 bg-red-50/10 flex flex-col gap-5 transition-all duration-300 {isEmergency || userExposure >= 70 ? 'animate-pulse-glow' : ''}">
      <div class="flex items-center gap-2 text-status-scam-red pb-2 border-b border-red-100">
        <span class="material-symbols-outlined text-[24px] animate-pulse">emergency</span>
        <h3 class="font-extrabold text-base">
          Prosedur Tanggap Darurat &amp; Kontak Resmi Perbankan
        </h3>
      </div>

      <!-- Bank Hotlines 1-Click Dial -->
      <div>
        <span class="text-xs font-bold text-on-surface-variant block mb-2">
          PANGGILAN CALL CENTER RESMI 24 JAM (BEBAS PULSA / TARIF STANDAR):
        </span>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href="tel:1500888"
            class="p-3 rounded-xl bg-white border border-border-subtle flex flex-col items-center hover:border-blue-500 hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200"
          >
            <span class="text-[11px] text-on-surface-variant font-bold">HaloBCA</span>
            <span class="font-mono text-base font-extrabold text-blue-700">1500888</span>
            <span class="text-[10px] text-blue-600 font-semibold">Blokir Rekening</span>
          </a>

          <a
            href="tel:14017"
            class="p-3 rounded-xl bg-white border border-border-subtle flex flex-col items-center hover:border-blue-500 hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200"
          >
            <span class="text-[11px] text-on-surface-variant font-bold">Kontak BRI</span>
            <span class="font-mono text-base font-extrabold text-blue-700">14017</span>
            <span class="text-[10px] text-blue-600 font-semibold">Kunci Kartu</span>
          </a>

          <a
            href="tel:14000"
            class="p-3 rounded-xl bg-white border border-border-subtle flex flex-col items-center hover:border-amber-500 hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200"
          >
            <span class="text-[11px] text-on-surface-variant font-bold">Mandiri Call</span>
            <span class="font-mono text-base font-extrabold text-amber-700">14000</span>
            <span class="text-[10px] text-amber-600 font-semibold">Stop Transaksi</span>
          </a>

          <a
            href="tel:1500046"
            class="p-3 rounded-xl bg-white border border-border-subtle flex flex-col items-center hover:border-orange-500 hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200"
          >
            <span class="text-[11px] text-on-surface-variant font-bold">BNI Call</span>
            <span class="font-mono text-base font-extrabold text-orange-700">1500046</span>
            <span class="text-[10px] text-orange-600 font-semibold">Bantuan Darurat</span>
          </a>
        </div>
        <p class="text-[10px] text-on-surface-variant/60 text-center mt-2">Nomor terverifikasi sesuai direktori resmi OJK &amp; Bank Indonesia • September 2026</p>
      </div>

      <!-- Action Items Checklist -->
      <div class="flex flex-col gap-2 pt-2">
        <span class="text-xs font-bold text-on-surface-variant block">
          CHECKLIST TINDAKAN PENCEGAHAN (CENTANG JIKA SUDAH DILAKUKAN):
        </span>
        {#if actions.length > 0}
          {#each actions as act}
            <label class="p-3 rounded-xl bg-white border border-border-subtle flex items-start gap-3 cursor-pointer hover:bg-surface-bright transition-colors">
              <input
                type="checkbox"
                checked={completedActions[act.step] || false}
                onchange={() => toggleActionCheck(act.step)}
                class="mt-0.5 w-4 h-4 rounded text-brand-violet-vibrant focus:ring-brand-violet-vibrant cursor-pointer"
              />
              <div class="flex-1">
                <span class="text-xs font-bold block {completedActions[act.step] ? 'checklist-done-text' : 'text-brand-indigo-hero'}">
                  Langkah {act.step}: {act.title}
                </span>
                <span class="text-[11px] text-on-surface-variant/80 block mt-0.5">
                  {act.desc}
                </span>
              </div>
            </label>
          {/each}
        {:else}
          <div class="p-3 rounded-xl bg-white border border-border-subtle flex items-start gap-3">
            <input type="checkbox" class="mt-0.5" />
            <div class="flex-1">
              <span class="text-xs font-bold text-brand-indigo-hero">Tolak konfirmasi OTP apapun</span>
              <span class="text-[11px] text-on-surface-variant block">Jangan berikan kode SMS rahasia kepada pihak yang mengaku petugas.</span>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Indicators & Timeline Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Indicators List (7 Cols) -->
    <div class="lg:col-span-7 sg-card p-6 border border-border-subtle flex flex-col gap-4">
      <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">policy</span>
          <h3 class="font-bold text-base text-brand-indigo-hero">
            Indikator Teknis &amp; Forensik ({analysis.indicators.length})
          </h3>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        {#each analysis.indicators as ind}
          <div class="p-4 rounded-xl border flex flex-col gap-1.5 {getIndicatorStyle(ind.level)}">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs">{ind.title}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/70">
                {ind.impact}
              </span>
            </div>
            <p class="text-xs leading-relaxed opacity-90">
              {ind.desc}
            </p>
          </div>
        {/each}
      </div>

      <!-- Categories breakdown -->
      {#if analysis.categories && analysis.categories.length > 0}
        <div class="pt-4 border-t border-border-subtle flex flex-col gap-2">
          <span class="text-xs font-bold text-on-surface-variant">KATEGORI RISIKO:</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {#each analysis.categories as cat}
              <div class="p-2.5 rounded-lg bg-surface-container-low border border-border-subtle flex items-center justify-between">
                <span class="text-xs font-medium text-brand-indigo-hero">{cat.name}</span>
                <span class="font-mono text-xs font-bold text-primary">{cat.score}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Timeline & History (5 Cols) -->
    <div class="lg:col-span-5 sg-card p-6 border border-border-subtle flex flex-col gap-4">
      <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">timeline</span>
          <h3 class="font-bold text-base text-brand-indigo-hero">Kronologi Insiden</h3>
        </div>
      </div>

      <!-- Chronological timeline list -->
      <div class="relative pl-6 border-l-2 border-surface-container space-y-4 py-2">
        {#each timelineEvents as evt}
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full {evt.color} ring-4 ring-white"></span>
            <div class="flex items-center gap-2 font-mono text-[11px] text-on-surface-variant">
              <span>{evt.time}</span>
              <span class="px-1.5 py-0.2 rounded bg-surface-container text-primary font-bold text-[10px]">
                {evt.tag}
              </span>
            </div>
            <p class="text-xs text-brand-indigo-hero font-semibold mt-0.5 leading-relaxed">
              {evt.text}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
