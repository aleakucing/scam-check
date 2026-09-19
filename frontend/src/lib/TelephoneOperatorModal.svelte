<script lang="ts">
  import { t } from "../services/i18n";
  import { speakIndonesian, stopSpeaking } from "../services/tts";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAnswerStep: (step: number, answer: boolean) => Promise<void>;
    targetEntity?: string;
  }

  let { isOpen, onClose, onAnswerStep, targetEntity }: Props = $props();

  let step = $state<number>(1);
  let view = $state<"question" | "emergency" | "safe">("question");
  let isSpeaking = $state<boolean>(false);
  let isSubmitting = $state<boolean>(false);

  const rawQuestions = t("operator.questions");

  // Dynamic Context Injection: interpolate targetEntity into questions if detected
  const questions = $derived.by(() => {
    if (!targetEntity) return rawQuestions;
    return rawQuestions.map((q: any, idx: number) => {
      if (idx === 0) {
        return {
          ...q,
          question: `Apakah Anda sempat memencet atau membuka tautan/berkas yang mengatasnamakan ${targetEntity} ini?`,
          speak_text: `Langkah satu. Apakah Bapak atau Ibu sempat memencet atau membuka tautan atau berkas yang mengatasnamakan ${targetEntity} ini?`
        };
      }
      if (idx === 1) {
        return {
          ...q,
          sub: `Catatan: Pihak ${targetEntity} resmi tidak pernah meminta kata sandi atau PIN melalui pesan atau tautan.`
        };
      }
      if (idx === 2) {
        return {
          ...q,
          question: `Apakah Anda sempat memberikan kode rahasia SMS (angka verifikasi OTP) dari ${targetEntity} kepada orang lain atau mengisinya ke layar?`,
          speak_text: `Langkah tiga. Apakah Bapak atau Ibu sempat memberikan kode rahasia SMS atau angka verifikasi OTP dari ${targetEntity} kepada orang lain?`
        };
      }
      return q;
    });
  });

  $effect(() => {
    if (isOpen) {
      step = 1;
      view = "question";
      isSpeaking = false;
      isSubmitting = false;
      speakCurrentQuestion();
    } else {
      stopSpeech();
    }
  });

  function stopSpeech() {
    stopSpeaking();
    isSpeaking = false;
  }

  function speakText(text: string) {
    isSpeaking = true;
    speakIndonesian(text, {
      rate: 0.90,
      onEnd: () => {
        isSpeaking = false;
      },
      onError: () => {
        isSpeaking = false;
      }
    });
  }

  function speakCurrentQuestion() {
    const q = questions[step - 1];
    if (q) speakText(q.speak_text);
  }

  function handleBack() {
    stopSpeech();
    if (view !== "question") {
      view = "question";
      speakCurrentQuestion();
      return;
    }
    if (step > 1) {
      step -= 1;
      speakCurrentQuestion();
    }
  }

  async function handleAnswer(val: boolean) {
    stopSpeech();
    isSubmitting = true;

    try {
      await onAnswerStep(step, val);

      if (step === 1) {
        if (val) {
          step = 2;
          speakCurrentQuestion();
        } else {
          view = "safe";
          speakText(t("operator.safe_verdict.speak_text"));
        }
      } else if (step === 2) {
        if (val) {
          step = 3;
          speakCurrentQuestion();
        } else {
          view = "safe";
          speakText("Pemeriksaan selesai. Tautan sempat dibuka namun kata sandi dan PIN tidak diserahkan. Rekening Anda masih dalam kondisi aman.");
        }
      } else if (step === 3) {
        view = "emergency";
        if (val) {
          speakText(t("operator.emergency_verdict.speak_text"));
        } else {
          speakText("Perhatian! Kata sandi Anda sempat diserahkan. Segera ubah password atau hubungi bank melalui tombol telepon berikut.");
        }
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      stopSpeech();
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
  <!-- Backdrop with accessible dialog attributes -->
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-brand-indigo-hero/80 backdrop-blur-md animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="operator-modal-title"
    aria-describedby="operator-modal-desc"
  >
    <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
      
      <!-- Operator Top Header (Solid Deep Navy Cyber Theme) -->
      <div class="p-5 sm:p-6 bg-brand-indigo-hero text-white flex items-center justify-between border-b border-white/10">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0" aria-hidden="true">
            <span class="material-symbols-outlined text-blue-200 text-[28px]">support_agent</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                Bimbingan Ramah Keluarga
              </span>
              {#if isSpeaking}
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold animate-pulse" aria-live="polite">
                  <span class="material-symbols-outlined text-[13px]">volume_up</span>
                  <span>{t("operator.speaking_badge")}</span>
                </span>
              {/if}
              {#if targetEntity}
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  Konteks: {targetEntity}
                </span>
              {/if}
            </div>
            <h2 id="operator-modal-title" class="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {t("operator.title")}
            </h2>
            <p id="operator-modal-desc" class="text-xs text-white/80 font-medium">
              {t("operator.subtitle")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={() => {
            stopSpeech();
            onClose();
          }}
          class="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
          aria-label={t("common.close")}
        >
          <span class="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>

      <!-- Step Progress Bar (For Questions View) -->
      {#if view === "question"}
        <div class="bg-surface-container-low px-6 py-3 border-b border-border-subtle flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-1">
            <!-- Step 1 Indicator -->
            <div class="flex items-center gap-1.5 {step >= 1 ? 'text-primary font-bold' : 'text-on-surface-variant'}">
              <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold {step > 1 ? 'bg-emerald-600 text-white' : step === 1 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}">
                {step > 1 ? '✓' : '1'}
              </span>
              <span class="text-xs hidden sm:inline">Buka Link</span>
            </div>
            <div class="h-0.5 flex-1 {step >= 2 ? 'bg-primary' : 'bg-surface-container'}"></div>

            <!-- Step 2 Indicator -->
            <div class="flex items-center gap-1.5 {step >= 2 ? 'text-primary font-bold' : 'text-on-surface-variant'}">
              <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold {step > 2 ? 'bg-emerald-600 text-white' : step === 2 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}">
                {step > 2 ? '✓' : '2'}
              </span>
              <span class="text-xs hidden sm:inline">Ketik Data/PIN</span>
            </div>
            <div class="h-0.5 flex-1 {step >= 3 ? 'bg-primary' : 'bg-surface-container'}"></div>

            <!-- Step 3 Indicator -->
            <div class="flex items-center gap-1.5 {step === 3 ? 'text-primary font-bold' : 'text-on-surface-variant'}">
              <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold {step === 3 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}">
                3
              </span>
              <span class="text-xs hidden sm:inline">Kode OTP</span>
            </div>
          </div>

          <span class="text-xs font-bold text-brand-indigo-hero px-2.5 py-1 rounded bg-white border border-border-subtle shrink-0">
            Langkah {step} dari 3
          </span>
        </div>
      {/if}

      <!-- Content Body -->
      <div class="p-5 sm:p-8 overflow-y-auto flex-1 flex flex-col gap-6">
        
        {#if view === "question"}
          {@const q = questions[step - 1]}
          <div class="flex flex-col gap-5 text-left">
            
            <!-- Controls Row: Re-play Audio & Back Button -->
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                {#if step > 1}
                  <button
                    type="button"
                    onclick={handleBack}
                    class="min-h-[44px] px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-brand-indigo-hero text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    aria-label={t("operator.back_button")}
                  >
                    <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Pertanyaan Sebelumnya</span>
                  </button>
                {/if}
              </div>

              <button
                type="button"
                onclick={speakCurrentQuestion}
                class="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200 text-xs font-bold cursor-pointer transition-colors"
                aria-label={t("operator.repeat_audio")}
              >
                <span class="material-symbols-outlined text-[20px]">volume_up</span>
                <span>Dengarkan Ulang Suara</span>
              </button>
            </div>

            <!-- Main Large Question Title for Seniors -->
            <div class="flex flex-col gap-2">
              <h3 class="text-xl sm:text-2xl font-extrabold text-brand-indigo-hero leading-snug">
                {q.question}
              </h3>
              <div class="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs sm:text-sm font-medium flex items-start gap-2">
                <span class="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
                <span>{q.sub}</span>
              </div>
            </div>

            <!-- Giant Accessible Action Buttons (Solid Colors, Zero Gradients, Large Tap Targets) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              
              <!-- Button 1: TIDAK (Safe State) -->
              <button
                type="button"
                disabled={isSubmitting}
                onclick={() => handleAnswer(false)}
                class="min-h-[82px] p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 hover:bg-emerald-100 text-left flex flex-col justify-center gap-1 transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50"
                aria-label="Pilihan: Tidak. {q.no_text}"
              >
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-lg text-emerald-950">TIDAK</span>
                  <span class="material-symbols-outlined text-emerald-700 text-[26px]">check_circle</span>
                </div>
                <span class="text-xs font-bold text-slate-800 leading-tight">{q.no_text}</span>
              </button>

              <!-- Button 2: YA (Danger State) -->
              <button
                type="button"
                disabled={isSubmitting}
                onclick={() => handleAnswer(true)}
                class="min-h-[82px] p-4 rounded-2xl bg-red-50 border-2 border-red-600 hover:bg-red-100 text-left flex flex-col justify-center gap-1 transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50"
                aria-label="Pilihan: Ya. {q.yes_text}"
              >
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-lg text-red-950">YA</span>
                  <span class="material-symbols-outlined text-red-700 text-[26px]">warning</span>
                </div>
                <span class="text-xs font-bold text-slate-800 leading-tight">{q.yes_text}</span>
              </button>

              <!-- Button 3: RAGU-RAGU (Fallback) -->
              <button
                type="button"
                disabled={isSubmitting}
                onclick={() => handleAnswer(true)}
                class="min-h-[82px] p-4 rounded-2xl bg-amber-50 border-2 border-amber-600 hover:bg-amber-100 text-left flex flex-col justify-center gap-1 transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50"
                aria-label="Pilihan: Ragu-ragu atau Lupa. {q.unsure_text}"
              >
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-lg text-amber-950">RAGU-RAGU</span>
                  <span class="material-symbols-outlined text-amber-700 text-[26px]">help</span>
                </div>
                <span class="text-xs font-bold text-slate-800 leading-tight">{q.unsure_text}</span>
              </button>

            </div>

            <!-- Instant Status Feedback -->
            {#if isSubmitting}
              <div class="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs font-bold flex items-center gap-2 border border-blue-200" aria-live="assertive">
                <span class="material-symbols-outlined text-[18px] animate-spin text-primary">progress_activity</span>
                <span>Mengevaluasi jawaban Anda secara aman...</span>
              </div>
            {/if}
          </div>

        {:else if view === "safe"}
          <!-- Safe Verdict Screen with Clear Reassuring Advice -->
          <div class="flex flex-col gap-6 text-center sm:text-left">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                <span class="material-symbols-outlined text-[40px]">verified_user</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 w-max uppercase tracking-wider">
                  Hasil Evaluasi Aman
                </span>
                <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {t("operator.safe_verdict.title")}
                </h3>
                <p class="text-xs sm:text-sm text-slate-700 font-medium">
                  {t("operator.safe_verdict.desc")}
                </p>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col gap-3">
              <span class="font-bold text-xs sm:text-sm text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px]">checklist</span>
                <span>Langkah Pencegahan Selanjutnya:</span>
              </span>
              <ul class="text-xs sm:text-sm text-slate-800 space-y-2.5 font-medium">
                {#each t("operator.safe_verdict.tips") as tip}
                  <li class="flex items-start gap-2.5">
                    <span class="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>{tip}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onclick={handleBack}
                class="min-h-[44px] px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-brand-indigo-hero text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Ubah Jawaban</span>
              </button>

              <button
                type="button"
                onclick={() => {
                  stopSpeech();
                  onClose();
                }}
                class="min-h-[44px] px-6 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer"
              >
                Selesai &amp; Tutup Panduan
              </button>
            </div>
          </div>

        {:else if view === "emergency"}
          <!-- Emergency Verdict Screen with Call Buttons -->
          <div class="flex flex-col gap-6 text-center sm:text-left">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 border border-red-300 animate-pulse">
                <span class="material-symbols-outlined text-[40px]">emergency</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 w-max uppercase tracking-wider">
                  Status Tindakan Cepat
                </span>
                <h3 class="text-xl sm:text-2xl font-extrabold text-red-950">
                  {t("operator.emergency_verdict.title")}
                </h3>
                <p class="text-xs sm:text-sm text-slate-800 font-semibold">
                  {t("operator.emergency_verdict.desc")}
                </p>
              </div>
            </div>

            <!-- Direct Dial Bank Buttons -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-brand-indigo-hero uppercase tracking-wide flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px] text-primary">phone_in_talk</span>
                  <span>{t("operator.emergency_verdict.call_action")}</span>
                </span>
                <span class="text-[11px] text-on-surface-variant font-mono">Bebas Pulsa / Hotline Resmi</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:1500888"
                  class="min-h-[64px] p-3.5 rounded-xl bg-white border-2 border-blue-600 hover:bg-blue-50 flex items-center justify-between transition-all shadow-sm"
                  aria-label="Telepon Halo BCA 1500888 untuk blokir rekening"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-700">Halo BCA</span>
                    <span class="font-mono text-base font-extrabold text-blue-900">1500888</span>
                  </div>
                  <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-700 text-white text-xs font-bold">
                    <span class="material-symbols-outlined text-[14px]">call</span>
                    <span>Panggil</span>
                  </span>
                </a>

                <a
                  href="tel:14017"
                  class="min-h-[64px] p-3.5 rounded-xl bg-white border-2 border-blue-600 hover:bg-blue-50 flex items-center justify-between transition-all shadow-sm"
                  aria-label="Telepon Kontak BRI 14017 untuk kunci kartu"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-700">Kontak BRI</span>
                    <span class="font-mono text-base font-extrabold text-blue-900">14017</span>
                  </div>
                  <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-700 text-white text-xs font-bold">
                    <span class="material-symbols-outlined text-[14px]">call</span>
                    <span>Panggil</span>
                  </span>
                </a>

                <a
                  href="tel:14000"
                  class="min-h-[64px] p-3.5 rounded-xl bg-white border-2 border-amber-600 hover:bg-amber-50 flex items-center justify-between transition-all shadow-sm"
                  aria-label="Telepon Mandiri Call 14000 untuk stop transaksi"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-700">Mandiri Call</span>
                    <span class="font-mono text-base font-extrabold text-amber-900">14000</span>
                  </div>
                  <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-700 text-white text-xs font-bold">
                    <span class="material-symbols-outlined text-[14px]">call</span>
                    <span>Panggil</span>
                  </span>
                </a>

                <a
                  href="tel:1500046"
                  class="min-h-[64px] p-3.5 rounded-xl bg-white border-2 border-orange-600 hover:bg-orange-50 flex items-center justify-between transition-all shadow-sm"
                  aria-label="Telepon BNI Call 1500046 untuk bantuan darurat"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-700">BNI Call</span>
                    <span class="font-mono text-base font-extrabold text-orange-900">1500046</span>
                  </div>
                  <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-700 text-white text-xs font-bold">
                    <span class="material-symbols-outlined text-[14px]">call</span>
                    <span>Panggil</span>
                  </span>
                </a>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onclick={handleBack}
                class="min-h-[44px] px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-brand-indigo-hero text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Ubah Jawaban</span>
              </button>

              <button
                type="button"
                onclick={() => {
                  stopSpeech();
                  onClose();
                }}
                class="min-h-[44px] px-6 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer"
              >
                Tutup &amp; Amankan Rekening
              </button>
            </div>
          </div>
        {/if}

      </div>
    </div>
  </div>
{/if}
