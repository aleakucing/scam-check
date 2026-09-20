<script lang="ts">
  import { t } from "../services/i18n";
  import {
    speakIndonesian,
    stopSpeaking,
    preloadIndonesianVoice,
    getIndonesianVoiceInfo,
    ensureVoicesLoaded
  } from "../services/tts";

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
  let voiceLabel = $state<string>("Menyiapkan suara Indonesia...");

  const rawQuestions = t("operator.questions");

  // Dynamic Context Injection: interpolate targetEntity into questions if detected
  const questions = $derived.by(() => {
    if (!targetEntity) return rawQuestions;
    return rawQuestions.map((q: any, idx: number) => {
      if (idx === 0) {
        return {
          ...q,
          question: `Apakah Anda sempat memencet atau membuka tautan/berkas yang mengatasnamakan ${targetEntity} ini?`,
          speak_text: `Apakah Bapak atau Ibu sempat memencet atau membuka tautan atau berkas yang mengatasnamakan ${targetEntity} ini?`
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
          speak_text: `Apakah Bapak atau Ibu sempat memberikan kode rahasia SMS atau angka verifikasi OTP dari ${targetEntity} kepada orang lain?`
        };
      }
      return q;
    });
  });

  function tr(key: string, fallback: string): string {
    try {
      const v = t(key, fallback);
      return typeof v === "string" && v ? v : fallback;
    } catch {
      return fallback;
    }
  }

  const progressPct = $derived(view === "question" ? Math.round((step / 3) * 100) : 100);

  $effect(() => {
    if (isOpen) {
      step = 1;
      view = "question";
      isSpeaking = false;
      isSubmitting = false;
      preloadIndonesianVoice();
      void ensureVoicesLoaded(1500).then(() => {
        const info = getIndonesianVoiceInfo();
        voiceLabel = info.voice
          ? `Suara: ${info.voice.name} • Bahasa Indonesia`
          : tr("operator.voice_missing", "Suara Indonesia tidak ditemukan — teks tetap bisa dibaca");
      });
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
      rate: 0.88,
      pitch: 1.05,
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
  <div
    class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-5 bg-brand-indigo-hero/85 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="operator-modal-title"
    aria-describedby="operator-modal-desc"
  >
    <div class="w-full max-w-xl bg-white shadow-2xl border border-border-subtle rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[94vh] animate-scale-in">

      <!-- Body -->
      <div class="px-5 sm:px-7 pt-4 pb-5 sm:py-7 overflow-y-auto flex-1 flex flex-col gap-5 bg-white relative">
        <h2 id="operator-modal-title" class="sr-only">{t("operator.title")}</h2>
        <p id="operator-modal-desc" class="sr-only">{t("operator.subtitle")}</p>
        <button
          type="button"
          onclick={() => {
            stopSpeech();
            onClose();
          }}
          class="absolute top-3 right-3 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
          aria-label={t("common.close")}
        >
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>

        {#if view === "question"}
          {@const q = questions[step - 1]}
          <div class="flex flex-col gap-4 text-left">

            <!-- Kartu audio: tombol besar + info suara ID -->
            <div class="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center gap-3.5">
              <button
                type="button"
                onclick={() => {
                  if (isSpeaking) stopSpeech();
                  else speakCurrentQuestion();
                }}
                class={`min-w-[56px] min-h-[56px] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${isSpeaking ? "bg-red-600 hover:bg-red-700" : "bg-blue-700 hover:bg-blue-800"}`}
                aria-label={isSpeaking ? "Hentikan suara" : tr("operator.repeat_audio", "Dengarkan ulang suara")}
              >
                <span class="material-symbols-outlined text-[28px]">{isSpeaking ? "stop" : "volume_up"}</span>
              </button>
              <div class="flex flex-col gap-0.5 min-w-0">
                <span class="text-sm font-extrabold text-blue-950">
                  {isSpeaking ? tr("operator.speaking_badge", "Sedang Dibacakan") + "..." : tr("operator.listening_title", "Dengarkan Penjelasan")}
                </span>
                <span class="text-xs text-blue-900/80 font-medium leading-snug">
                  {tr("operator.listening_sub", "Suara Bahasa Indonesia • pelan & jelas")}
                </span>
                <span class="text-[11px] text-slate-500 font-mono truncate" title={voiceLabel}>{voiceLabel}</span>
              </div>
              {#if step > 1}
                <button
                  type="button"
                  onclick={handleBack}
                  class="ml-auto min-h-[44px] px-4 py-2 rounded-full bg-white hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  aria-label={t("operator.back_button")}
                >
                  <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Kembali</span>
                </button>
              {/if}
            </div>

            <!-- Pertanyaan besar -->
            <div class="flex flex-col gap-3">
              {#if targetEntity}
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-extrabold w-max">
                  <span class="material-symbols-outlined text-[16px]">business</span>
                  <span>Konteks: {targetEntity}</span>
                </span>
              {/if}
              <h3 class="text-[22px] sm:text-[26px] font-extrabold text-slate-900 leading-[1.2] tracking-tight">
                {q.question}
              </h3>
              <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-[13px] sm:text-sm font-medium flex items-start gap-2.5">
                <span class="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">info</span>
                <span>{q.sub}</span>
              </div>
              <p class="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                {tr("operator.tap_hint", "Ketuk salah satu jawaban besar di bawah:")}
              </p>
            </div>

            <!-- Tombol jawaban vertikal raksasa -->
            <div class="flex flex-col gap-3" role="group" aria-label="Pilihan jawaban">
              <button
                type="button"
                disabled={isSubmitting}
                onclick={() => handleAnswer(false)}
                class="min-h-[76px] w-full p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 hover:bg-emerald-100 hover:shadow-md hover:-translate-y-[1px] text-left flex items-center gap-4 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                aria-label="Pilihan: Tidak. {q.no_text}"
              >
                <span class="w-12 h-12 min-w-[48px] rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm" aria-hidden="true">
                  <span class="material-symbols-outlined text-[26px]">check_circle</span>
                </span>
                <span class="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span class="font-extrabold text-[17px] text-emerald-950 leading-tight">TIDAK</span>
                  <span class="text-[13px] font-bold text-slate-700 leading-snug">{q.no_text}</span>
                </span>
                <span class="material-symbols-outlined text-emerald-700 text-[24px] shrink-0" aria-hidden="true">chevron_right</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onclick={() => handleAnswer(true)}
                class="min-h-[76px] w-full p-4 rounded-2xl bg-red-50 border-2 border-red-600 hover:bg-red-100 hover:shadow-md hover:-translate-y-[1px] text-left flex items-center gap-4 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                aria-label="Pilihan: Ya. {q.yes_text}"
              >
                <span class="w-12 h-12 min-w-[48px] rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm" aria-hidden="true">
                  <span class="material-symbols-outlined text-[26px]">warning</span>
                </span>
                <span class="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span class="font-extrabold text-[17px] text-red-950 leading-tight">YA</span>
                  <span class="text-[13px] font-bold text-slate-700 leading-snug">{q.yes_text}</span>
                </span>
                <span class="material-symbols-outlined text-red-700 text-[24px] shrink-0" aria-hidden="true">chevron_right</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onclick={() => handleAnswer(true)}
                class="min-h-[76px] w-full p-4 rounded-2xl bg-amber-50 border-2 border-amber-500 hover:bg-amber-100 hover:shadow-md hover:-translate-y-[1px] text-left flex items-center gap-4 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
                aria-label="Pilihan: Ragu-ragu atau Lupa. {q.unsure_text}"
              >
                <span class="w-12 h-12 min-w-[48px] rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm" aria-hidden="true">
                  <span class="material-symbols-outlined text-[26px]">help</span>
                </span>
                <span class="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span class="font-extrabold text-[17px] text-amber-950 leading-tight">RAGU-RAGU</span>
                  <span class="text-[13px] font-bold text-slate-700 leading-snug">{q.unsure_text}</span>
                </span>
                <span class="material-symbols-outlined text-amber-700 text-[24px] shrink-0" aria-hidden="true">chevron_right</span>
              </button>
            </div>

            <!-- Caption teks suara (fallback jika audio tidak tersedia) -->
            <details class="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
              <summary class="px-4 py-3 text-xs font-extrabold text-slate-600 cursor-pointer list-none flex items-center gap-2 hover:bg-slate-100 transition-colors min-h-[44px]">
                <span class="material-symbols-outlined text-[18px]">subtitles</span>
                <span>{t("operator.caption_title")} Lihat teks yang dibacakan</span>
              </summary>
              <p class="px-4 pb-4 text-[13px] text-slate-700 leading-relaxed italic">“{q.speak_text}”</p>
            </details>

            {#if isSubmitting}
              <div class="p-4 rounded-2xl bg-blue-50 text-blue-950 text-[13px] font-bold flex items-center gap-3 border border-blue-200" aria-live="assertive">
                <span class="material-symbols-outlined text-[22px] animate-spin text-blue-700">progress_activity</span>
                <span>Mengevaluasi jawaban Anda secara aman...</span>
              </div>
            {/if}
          </div>

        {:else if view === "safe"}
          <div class="flex flex-col gap-5 text-center sm:text-left">
            <div class="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex flex-col sm:flex-row items-center gap-4">
              <div class="w-16 h-16 min-w-[64px] rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <span class="material-symbols-outlined text-[38px]">verified_user</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white w-max uppercase tracking-wider mx-auto sm:mx-0">
                  Hasil Evaluasi Aman
                </span>
                <h3 class="text-xl sm:text-2xl font-extrabold text-emerald-950 leading-tight">
                  {t("operator.safe_verdict.title")}
                </h3>
                <p class="text-[13px] sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {t("operator.safe_verdict.desc")}
                </p>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-white border-2 border-slate-200 flex flex-col gap-3">
              <span class="font-extrabold text-[13px] text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px] text-emerald-700">checklist</span>
                <span>Langkah Pencegahan Selanjutnya:</span>
              </span>
              <ul class="text-[13px] sm:text-sm text-slate-800 space-y-3 font-medium text-left">
                {#each t("operator.safe_verdict.tips") as tip}
                  <li class="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span class="material-symbols-outlined text-emerald-700 text-[22px] shrink-0">check_circle</span>
                    <span class="leading-snug">{tip}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onclick={handleBack}
                class="min-h-[52px] px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">arrow_back</span>
                <span>Ubah Jawaban</span>
              </button>
              <button
                type="button"
                onclick={() => {
                  stopSpeech();
                  onClose();
                }}
                class="min-h-[52px] px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-extrabold transition-all shadow-md cursor-pointer"
              >
                Selesai & Tutup Panduan
              </button>
            </div>
          </div>

        {:else if view === "emergency"}
          <div class="flex flex-col gap-5 text-center sm:text-left">
            <div class="p-5 rounded-3xl bg-red-50 border-2 border-red-300 flex flex-col sm:flex-row items-center gap-4">
              <div class="w-16 h-16 min-w-[64px] rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                <span class="material-symbols-outlined text-[38px]">emergency</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-600 text-white w-max uppercase tracking-wider mx-auto sm:mx-0">
                  Status Tindakan Cepat
                </span>
                <h3 class="text-xl sm:text-2xl font-extrabold text-red-950 leading-tight">
                  {t("operator.emergency_verdict.title")}
                </h3>
                <p class="text-[13px] sm:text-sm text-slate-800 font-semibold leading-relaxed">
                  {t("operator.emergency_verdict.desc")}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between gap-2">
                <span class="font-extrabold text-[13px] text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span class="material-symbols-outlined text-[20px] text-red-600">phone_in_talk</span>
                  <span>{t("operator.emergency_verdict.call_action")}</span>
                </span>
              </div>
              <span class="text-[11px] text-slate-500 font-semibold">Bebas Pulsa / Hotline Resmi — ketuk untuk menelepon langsung</span>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:1500888"
                  class="min-h-[72px] p-4 rounded-2xl bg-white border-2 border-blue-700 hover:bg-blue-50 hover:shadow-md flex items-center justify-between gap-3 transition-all"
                  aria-label="Telepon Halo BCA 1500888 untuk blokir rekening"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-600">Halo BCA</span>
                    <span class="font-mono text-lg font-extrabold text-blue-900">1500888</span>
                  </div>
                  <span class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-700 text-white text-[13px] font-extrabold min-h-[44px]">
                    <span class="material-symbols-outlined text-[18px]">call</span>
                    <span>Panggil</span>
                  </span>
                </a>

                <a
                  href="tel:14017"
                  class="min-h-[72px] p-4 rounded-2xl bg-white border-2 border-blue-700 hover:bg-blue-50 hover:shadow-md flex items-center justify-between gap-3 transition-all"
                  aria-label="Telepon Kontak BRI 14017 untuk kunci kartu"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-600">Kontak BRI</span>
                    <span class="font-mono text-lg font-extrabold text-blue-900">14017</span>
                  </div>
                  <span class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-700 text-white text-[13px] font-extrabold min-h-[44px]">
                    <span class="material-symbols-outlined text-[18px]">call</span>
                    <span>Panggil</span>
                  </span>
                </a>

                <a
                  href="tel:14000"
                  class="min-h-[72px] p-4 rounded-2xl bg-white border-2 border-amber-600 hover:bg-amber-50 hover:shadow-md flex items-center justify-between gap-3 transition-all"
                  aria-label="Telepon Mandiri Call 14000 untuk stop transaksi"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-600">Mandiri Call</span>
                    <span class="font-mono text-lg font-extrabold text-amber-900">14000</span>
                  </div>
                  <span class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-amber-700 text-white text-[13px] font-extrabold min-h-[44px]">
                    <span class="material-symbols-outlined text-[18px]">call</span>
                    <span>Panggil</span>
                  </span>
                </a>

                <a
                  href="tel:1500046"
                  class="min-h-[72px] p-4 rounded-2xl bg-white border-2 border-orange-600 hover:bg-orange-50 hover:shadow-md flex items-center justify-between gap-3 transition-all"
                  aria-label="Telepon BNI Call 1500046 untuk bantuan darurat"
                >
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-600">BNI Call</span>
                    <span class="font-mono text-lg font-extrabold text-orange-900">1500046</span>
                  </div>
                  <span class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-orange-700 text-white text-[13px] font-extrabold min-h-[44px]">
                    <span class="material-symbols-outlined text-[18px]">call</span>
                    <span>Panggil</span>
                  </span>
                </a>
              </div>
            </div>

            <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-border-subtle mt-1 pt-4">
              <button
                type="button"
                onclick={handleBack}
                class="min-h-[52px] px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">arrow_back</span>
                <span>Ubah Jawaban</span>
              </button>
              <button
                type="button"
                onclick={() => {
                  stopSpeech();
                  onClose();
                }}
                class="min-h-[52px] px-6 py-3 rounded-2xl bg-red-700 hover:bg-red-800 text-white text-sm font-extrabold transition-all shadow-md cursor-pointer"
              >
                Tutup & Amankan Rekening
              </button>
            </div>
          </div>
        {/if}

      </div>
    </div>
  </div>
{/if}
