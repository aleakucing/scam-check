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
          speakText("Pemeriksaan selesai. Tautan sempat dibuka namun kata sandi dan PIN tidak diserahkan. Akun Anda masih aman.");
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
    class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-brand-indigo-hero/80 backdrop-blur-md"
    role="dialog"
    aria-modal="true"
    aria-labelledby="operator-modal-title"
    aria-describedby="operator-modal-desc"
  >
    <div class="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border-2 border-primary/30 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Operator Top Header with WCAG compliant contrast -->
      <div class="p-4 sm:p-6 bg-brand-indigo-hero text-white flex items-center justify-between border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0" aria-hidden="true">
            <span class="material-symbols-outlined text-white text-[28px]">support_agent</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 id="operator-modal-title" class="text-lg sm:text-xl font-extrabold text-white">
                {t("operator.title")}
              </h2>
              {#if isSpeaking}
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[11px] font-bold animate-pulse" aria-live="polite">
                  <span class="material-symbols-outlined text-[14px]">volume_up</span>
                  {t("operator.speaking_badge")}
                </span>
              {/if}
              {#if targetEntity}
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  Konteks: {targetEntity}
                </span>
              {/if}
            </div>
            <p id="operator-modal-desc" class="text-xs text-white/90 font-medium">
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

      <!-- Content Body -->
      <div class="p-5 sm:p-8 overflow-y-auto flex-1 flex flex-col gap-6">
        

        {#if view === "question"}
          {@const q = questions[step - 1]}
          <div class="flex flex-col gap-5 text-left">
            
            <!-- Navigation Action Row: Step & Repeat Audio & Back Button -->
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-3 py-1.5 rounded-full bg-surface-container text-primary font-bold text-xs">
                  {q.badge}
                </span>

                {#if step > 1}
                  <button
                    type="button"
                    onclick={handleBack}
                    class="min-h-[44px] px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
                    aria-label={t("operator.back_button")}
                  >
                    <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Kembali</span>
                  </button>
                {/if}
              </div>

              <button
                type="button"
                onclick={speakCurrentQuestion}
                class="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
                aria-label={t("operator.repeat_audio")}
              >
                <span class="material-symbols-outlined text-[18px]">volume_up</span>
                <span>{t("operator.repeat_audio")}</span>
              </button>
            </div>

            <!-- Big Question Text with High Contrast -->
            <div>
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {q.question}
              </h3>
              <p class="text-xs sm:text-sm text-slate-700 font-medium mt-1.5">
                {q.sub}
              </p>
            </div>

            <!-- Giant Accessible Action Buttons (Touch Target > 44x44px, Keyboard Navigable, High Contrast) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              
              <!-- Button 1: YA (High Danger State) -->
              <button
                type="button"
                disabled={isSubmitting}
                onclick={() => handleAnswer(true)}
                class="min-h-[72px] p-4 rounded-2xl bg-red-50 border-2 border-red-600 hover:bg-red-100 text-left flex flex-col justify-center gap-1 transition-all active:scale-[0.98] shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-red-600 disabled:opacity-50"
                aria-label="Pilihan: Ya. {q.yes_text}"
              >
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-base sm:text-lg text-red-900">YA</span>
                  <span class="material-symbols-outlined text-red-700 text-[26px]">check_circle</span>
                </div>
                <span class="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{q.yes_text}</span>
              </button>

              <!-- Button 2: TIDAK (Safe State) -->
              <button
                type="button"
                disabled={isSubmitting}
                onclick={() => handleAnswer(false)}
                class="min-h-[72px] p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-700 hover:bg-emerald-100 text-left flex flex-col justify-center gap-1 transition-all active:scale-[0.98] shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-emerald-700 disabled:opacity-50"
                aria-label="Pilihan: Tidak. {q.no_text}"
              >
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-base sm:text-lg text-emerald-900">TIDAK</span>
                  <span class="material-symbols-outlined text-emerald-700 text-[26px]">cancel</span>
                </div>
                <span class="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{q.no_text}</span>
              </button>

              <!-- Button 3: RAGU-RAGU / TIDAK YAKIN (Senior Accessibility Fallback) -->
              <button
                type="button"
                disabled={isSubmitting}
                onclick={() => handleAnswer(true)}
                class="min-h-[72px] p-4 rounded-2xl bg-amber-50 border-2 border-amber-600 hover:bg-amber-100 text-left flex flex-col justify-center gap-1 transition-all active:scale-[0.98] shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-amber-600 disabled:opacity-50"
                aria-label="Pilihan: Ragu-ragu atau Lupa. {q.unsure_text}"
              >
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-base sm:text-lg text-amber-900">RAGU-RAGU</span>
                  <span class="material-symbols-outlined text-amber-700 text-[26px]">help</span>
                </div>
                <span class="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{q.unsure_text}</span>
              </button>

            </div>

            <!-- Instant Status Feedback -->
            {#if isSubmitting}
              <div class="p-2 rounded-lg bg-blue-50 text-blue-900 text-xs font-bold flex items-center gap-2" aria-live="assertive">
                <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                <span>Menyimpan jawaban Anda...</span>
              </div>
            {/if}
          </div>

        {:else if view === "safe"}
          <!-- Safe Verdict Screen with Clear Advice -->
          <div class="flex flex-col gap-6 text-center sm:text-left">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[36px]">verified</span>
              </div>
              <div>
                <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {t("operator.safe_verdict.title")}
                </h3>
                <p class="text-xs sm:text-sm text-slate-700 font-medium">
                  {t("operator.safe_verdict.desc")}
                </p>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex flex-col gap-3">
              <span class="font-bold text-xs sm:text-sm text-emerald-950 uppercase tracking-wide">
                Langkah Aman Selanjutnya:
              </span>
              <ul class="text-xs sm:text-sm text-slate-800 space-y-2 font-medium">
                {#each t("operator.safe_verdict.tips") as tip}
                  <li class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>{tip}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <div class="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onclick={handleBack}
                class="min-h-[44px] px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
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
                class="min-h-[44px] px-6 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-emerald-700"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>

        {:else if view === "emergency"}
          <!-- Emergency Verdict Screen with Call Buttons -->
          <div class="flex flex-col gap-6 text-center sm:text-left">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-full bg-red-100 text-red-800 flex items-center justify-center shrink-0 animate-pulse">
                <span class="material-symbols-outlined text-[36px]">emergency</span>
              </div>
              <div>
                <h3 class="text-xl sm:text-2xl font-extrabold text-red-950">
                  {t("operator.emergency_verdict.title")}
                </h3>
                <p class="text-xs sm:text-sm text-slate-800 font-bold">
                  {t("operator.emergency_verdict.desc")}
                </p>
              </div>
            </div>

            <!-- Direct Dial Bank Buttons with 44x44px minimum target -->
            <div class="flex flex-col gap-3">
              <span class="font-bold text-xs text-slate-800 uppercase tracking-wide">
                {t("operator.emergency_verdict.call_action")}
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:1500888"
                  class="min-h-[64px] p-3.5 rounded-xl bg-white border-2 border-blue-600 hover:bg-blue-50 flex items-center justify-between transition-all shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600"
                  aria-label="Telepon Halo BCA 1500888 untuk blokir rekening"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-700">Bank BCA</span>
                    <span class="font-mono text-base font-extrabold text-blue-800">1500888</span>
                  </div>
                  <span class="px-3 py-1 rounded-full bg-blue-700 text-white text-xs font-bold">Panggil</span>
                </a>

                <a
                  href="tel:14017"
                  class="min-h-[64px] p-3.5 rounded-xl bg-white border-2 border-blue-600 hover:bg-blue-50 flex items-center justify-between transition-all shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600"
                  aria-label="Telepon Kontak BRI 14017 untuk kunci kartu"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-700">Bank BRI</span>
                    <span class="font-mono text-base font-extrabold text-blue-800">14017</span>
                  </div>
                  <span class="px-3 py-1 rounded-full bg-blue-700 text-white text-xs font-bold">Panggil</span>
                </a>

                <a
                  href="tel:14000"
                  class="min-h-[64px] p-3.5 rounded-xl bg-white border-2 border-amber-600 hover:bg-amber-50 flex items-center justify-between transition-all shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-600"
                  aria-label="Telepon Mandiri Call 14000 untuk stop transaksi"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-700">Bank Mandiri</span>
                    <span class="font-mono text-base font-extrabold text-amber-800">14000</span>
                  </div>
                  <span class="px-3 py-1 rounded-full bg-amber-700 text-white text-xs font-bold">Panggil</span>
                </a>

                <a
                  href="tel:1500046"
                  class="min-h-[64px] p-3.5 rounded-xl bg-white border-2 border-orange-600 hover:bg-orange-50 flex items-center justify-between transition-all shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-600"
                  aria-label="Telepon BNI Call 1500046 untuk bantuan darurat"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-700">Bank BNI</span>
                    <span class="font-mono text-base font-extrabold text-orange-800">1500046</span>
                  </div>
                  <span class="px-3 py-1 rounded-full bg-orange-700 text-white text-xs font-bold">Panggil</span>
                </a>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onclick={handleBack}
                class="min-h-[44px] px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
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
                class="min-h-[44px] px-6 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-red-700"
              >
                Tutup &amp; Amankan Akun
              </button>
            </div>
          </div>
        {/if}

      </div>
    </div>
  </div>
{/if}
