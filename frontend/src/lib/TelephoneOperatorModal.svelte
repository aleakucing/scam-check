<script lang="ts">
  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAnswerStep: (step: number, answer: boolean) => Promise<void>;
  }

  let { isOpen, onClose, onAnswerStep }: Props = $props();

  let step = $state<number>(1);
  let view = $state<"question" | "emergency" | "safe">("question");
  let isSpeaking = $state<boolean>(false);

  const questions = [
    {
      step: 1,
      badge: "Pertanyaan 1 dari 3",
      question: "Apakah Bapak/Ibu sempat menekan atau membuka tautan/file yang dikirimkan ini?",
      sub: "Pilih salah satu tombol besar di bawah sesuai kejadian sebenarnya:",
      yesText: "Ya, Tautan Sempat Saya Buka",
      noText: "Tidak, Belum Pernah Dibuka",
      speakText: "Pertanyaan satu. Apakah Bapak atau Ibu sempat menekan atau membuka tautan atau berkas yang dikirimkan ini?"
    },
    {
      step: 2,
      badge: "Pertanyaan 2 dari 3",
      question: "Apakah Bapak/Ibu sempat mengetik nomor kartu ATM, PIN, username m-Banking, atau password di situs tersebut?",
      sub: "Catatan: Jangan pernah memasukkan nomor kartu atau password pada situs tidak resmi.",
      yesText: "Ya, Data/Password Sempat Dimasukkan",
      noText: "Tidak, Tidak Ada Data Yang Diisi",
      speakText: "Pertanyaan dua. Apakah Bapak atau Ibu sempat mengetik nomor kartu ATM, PIN, atau kata sandi di situs tersebut?"
    },
    {
      step: 3,
      badge: "Pertanyaan 3 dari 3",
      question: "Apakah Bapak/Ibu sempat memberitahu kode SMS rahasia (OTP) kepada siapapun atau diisikan ke layar?",
      sub: "Penting: Kode SMS verifikasi (OTP) bersifat sangat rahasia dan tidak boleh diserahkan.",
      yesText: "Ya, Kode OTP Diserahkan",
      noText: "Tidak, Kode OTP Tidak Diberikan",
      speakText: "Pertanyaan tiga. Apakah Bapak atau Ibu sempat memberitahu kode SMS rahasia atau OTP kepada siapapun?"
    }
  ];

  $effect(() => {
    if (isOpen) {
      step = 1;
      view = "question";
      setTimeout(() => {
        speakCurrentQuestion();
      }, 350);
    } else {
      stopSpeech();
    }
  });

  function stopSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
    }
  }

  function speakText(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "id-ID";
      utt.rate = 0.92;
      isSpeaking = true;
      utt.onend = () => { isSpeaking = false; };
      utt.onerror = () => { isSpeaking = false; };
      window.speechSynthesis.speak(utt);
    }
  }

  function speakCurrentQuestion() {
    const q = questions[step - 1];
    if (q) speakText(q.speakText);
  }

  async function handleAnswer(val: boolean) {
    stopSpeech();
    await onAnswerStep(step, val);

    if (step === 1) {
      if (val) {
        step = 2;
        speakCurrentQuestion();
      } else {
        view = "safe";
        speakText("Pemeriksaan selesai. Rekening Bapak atau Ibu aman karena tautan belum pernah dibuka. Tetap waspada!");
      }
    } else if (step === 2) {
      if (val) {
        step = 3;
        speakCurrentQuestion();
      } else {
        view = "safe";
        speakText("Pemeriksaan selesai. Tautan sempat dibuka namun data dan password tidak diserahkan. Akun Anda masih aman.");
      }
    } else if (step === 3) {
      if (val) {
        view = "emergency";
        speakText("Peringatan darurat! Rekening bank Anda berisiko dibobol karena kode OTP telah diserahkan. Segera tekan tombol telepon bank di layar untuk memblokir rekening sekarang!");
      } else {
        view = "emergency";
        speakText("Perhatian! Password Anda sempat diserahkan. Segera ganti kata sandi atau kunci rekening melalui tombol telepon bank berikut.");
      }
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-indigo-hero/70 backdrop-blur-md animate-fade-in">
    <div class="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border-2 border-primary/20 overflow-hidden flex flex-col max-h-[92vh]">
      <!-- Operator Top Banner -->
      <div class="p-6 bg-gradient-to-r from-brand-indigo-hero to-primary text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span class="material-symbols-outlined text-white text-[28px]">support_agent</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-extrabold text-white">Panduan Operator Ramah Lansia</h2>
              {#if isSpeaking}
                <span class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold animate-pulse">
                  <span class="material-symbols-outlined text-[14px]">volume_up</span> Bersuara
                </span>
              {/if}
            </div>
            <p class="text-xs text-white/80">Panduan suara langkah demi langkah dengan teks ukuran besar.</p>
          </div>
        </div>

        <button
          type="button"
          onclick={() => {
            stopSpeech();
            onClose();
          }}
          class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <span class="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-6 sm:p-8 overflow-y-auto flex-1">
        {#if view === "question"}
          {@const q = questions[step - 1]}
          <div class="flex flex-col gap-6 text-center sm:text-left">
            <!-- Step Badge -->
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 rounded-full bg-surface-container text-primary font-bold text-xs">
                {q.badge}
              </span>
              <button
                type="button"
                onclick={speakCurrentQuestion}
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">volume_up</span>
                Ulangi Suara
              </button>
            </div>

            <!-- Big Question Text -->
            <h3 class="text-2xl sm:text-3xl font-extrabold text-brand-indigo-hero leading-snug">
              {q.question}
            </h3>
            <p class="text-sm sm:text-base text-on-surface-variant font-medium">
              {q.sub}
            </p>

            <!-- Giant Action Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                type="button"
                onclick={() => handleAnswer(true)}
                class="p-5 rounded-2xl bg-status-scam-bg border-2 border-status-scam-red/40 hover:border-status-scam-red hover:bg-status-scam-bg/80 text-left flex flex-col gap-2 transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-lg text-status-scam-red">YA</span>
                  <span class="material-symbols-outlined text-status-scam-red text-[28px]">check_circle</span>
                </div>
                <span class="text-sm font-bold text-brand-indigo-hero">{q.yesText}</span>
              </button>

              <button
                type="button"
                onclick={() => handleAnswer(false)}
                class="p-5 rounded-2xl bg-status-safe-bg border-2 border-status-safe-green/40 hover:border-status-safe-green hover:bg-status-safe-bg/80 text-left flex flex-col gap-2 transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-lg text-status-safe-green">TIDAK</span>
                  <span class="material-symbols-outlined text-status-safe-green text-[28px]">cancel</span>
                </div>
                <span class="text-sm font-bold text-brand-indigo-hero">{q.noText}</span>
              </button>
            </div>
          </div>
        {:else if view === "emergency"}
          <div class="flex flex-col items-center text-center gap-4 py-4">
            <div class="w-16 h-16 rounded-full bg-status-scam-bg text-status-scam-red flex items-center justify-center animate-bounce">
              <span class="material-symbols-outlined text-[36px]">crisis_alert</span>
            </div>
            <h3 class="text-2xl font-black text-status-scam-red">
              PERINGATAN DARURAT: AMANKAN REKENING SEKARANG!
            </h3>
            <p class="text-sm text-on-surface-variant max-w-lg leading-relaxed">
              Data otentikasi penting telah diserahkan ke pelaku. Hubungi Call Center resmi bank Anda sekarang juga untuk meminta pemblokiran kartu dan rekening:
            </p>

            <!-- Bank Hotlines -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-4">
              <a
                href="tel:1500888"
                class="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col items-center gap-1 hover:bg-blue-100 transition-all font-bold"
              >
                <span class="text-xs text-blue-700">HaloBCA</span>
                <span class="text-base font-extrabold font-mono">1500888</span>
                <span class="text-[10px] text-blue-600">Tekan Hubungi</span>
              </a>

              <a
                href="tel:14017"
                class="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col items-center gap-1 hover:bg-blue-100 transition-all font-bold"
              >
                <span class="text-xs text-blue-700">Kontak BRI</span>
                <span class="text-base font-extrabold font-mono">14017</span>
                <span class="text-[10px] text-blue-600">Tekan Hubungi</span>
              </a>

              <a
                href="tel:14000"
                class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col items-center gap-1 hover:bg-amber-100 transition-all font-bold"
              >
                <span class="text-xs text-amber-700">Mandiri Call</span>
                <span class="text-base font-extrabold font-mono">14000</span>
                <span class="text-[10px] text-amber-600">Tekan Hubungi</span>
              </a>

              <a
                href="tel:1500046"
                class="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 flex flex-col items-center gap-1 hover:bg-orange-100 transition-all font-bold"
              >
                <span class="text-xs text-orange-700">BNI Call</span>
                <span class="text-base font-extrabold font-mono">1500046</span>
                <span class="text-[10px] text-orange-600">Tekan Hubungi</span>
              </a>
            </div>

            <button
              type="button"
              onclick={() => {
                stopSpeech();
                onClose();
              }}
              class="mt-6 px-8 py-3 rounded-full bg-brand-indigo-hero text-white font-bold text-sm hover:bg-primary transition-colors cursor-pointer"
            >
              Saya Mengerti, Kembali ke Hasil Audit
            </button>
          </div>
        {:else if view === "safe"}
          <div class="flex flex-col items-center text-center gap-4 py-6">
            <div class="w-16 h-16 rounded-full bg-status-safe-bg text-status-safe-green flex items-center justify-center">
              <span class="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <h3 class="text-2xl font-black text-brand-indigo-hero">
              Pemeriksaan Selesai: Akun Anda Aman
            </h3>
            <p class="text-sm text-on-surface-variant max-w-lg leading-relaxed">
              Karena tidak ada data kredensial atau kode OTP yang diserahkan, risiko pengambilalihan akun berada pada tingkat minimal. Tetap berhati-hati dan jangan pernah membagikan kode rahasia.
            </p>
            <button
              type="button"
              onclick={() => {
                stopSpeech();
                onClose();
              }}
              class="mt-4 px-8 py-3 rounded-full bg-brand-indigo-hero text-white font-bold text-sm hover:bg-primary transition-colors cursor-pointer"
            >
              Tutup &amp; Lihat Ringkasan Kasus
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
