import os

html_content = r'''<!DOCTYPE html>
<html lang="id" class="font-scale-standard">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>ScamGuard AI - Bantuan Pemeriksaan & Perlindungan Penipuan Digital untuk Keluarga</title>
  
  <!-- Google Fonts: Inter & Open Sans for maximum elderly readability -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Open Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
          },
          colors: {
            sg: {
              canvas: '#F8FAFC',       /* Slate 50 - clean, bright, comfortable */
              surface: '#FFFFFF',      /* Pure White */
              subtle: '#F1F5F9',       /* Slate 100 */
              border: '#CBD5E1',       /* Slate 300 - clear high contrast borders */
              textMain: '#0F172A',     /* Slate 900 - maximum text contrast (16:1) */
              textMuted: '#334155',    /* Slate 700 - readable secondary text (8.5:1) */
              blue: '#1D4ED8',         /* Blue 700 - reassuring primary blue */
              blueHover: '#1E40AF',
              blueLight: '#EFF6FF',
              green: '#15803D',        /* Green 700 - safe */
              greenBg: '#DCFCE7',      /* Green 100 */
              greenBorder: '#86EFAC',
              amber: '#B45309',        /* Amber 700 - warning */
              amberBg: '#FEF3C7',      /* Amber 100 */
              amberBorder: '#FCD34D',
              red: '#B91C1C',          /* Red 700 - high risk */
              redBg: '#FEE2E2',        /* Red 100 */
              redBorder: '#FCA5A5',
              waGreen: '#16A34A',      /* WhatsApp green */
              waGreenHover: '#15803D'
            }
          }
        }
      }
    }
  </script>

  <style>
    /* OpenDesign Spacious + Senior Accessibility Styles */
    :root {
      font-size: 16px;
      line-height: 1.6;
    }
    
    html.font-scale-standard {
      font-size: 16px;
    }
    html.font-scale-large {
      font-size: 18px;
    }
    html.font-scale-xlarge {
      font-size: 20px;
    }

    body {
      background-color: #F8FAFC;
      color: #0F172A;
      font-family: 'Inter', 'Open Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* Accessibility focus indicators */
    button:focus-visible, input:focus-visible, textarea:focus-visible, a:focus-visible {
      outline: 3px solid #1D4ED8 !important;
      outline-offset: 3px !important;
    }

    /* Spacious Card Elevation */
    .sg-card {
      background-color: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 1.25rem;
      box-shadow: 0 2px 6px -1px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04);
      transition: all 0.2s ease;
    }
    .sg-card:hover {
      border-color: #94A3B8;
      box-shadow: 0 8px 16px -2px rgba(15, 23, 42, 0.08);
    }

    /* Senior-Friendly Button Styling (Min 48px - 56px height) */
    .sg-btn-primary {
      min-height: 52px;
      padding: 12px 24px;
      background-color: #1D4ED8;
      color: #FFFFFF;
      font-weight: 600;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      box-shadow: 0 2px 4px rgba(29, 78, 216, 0.2);
    }
    .sg-btn-primary:hover {
      background-color: #1E40AF;
      transform: translateY(-1px);
    }
    .sg-btn-primary:active {
      transform: scale(0.98);
    }

    .sg-btn-secondary {
      min-height: 48px;
      padding: 10px 20px;
      background-color: #F1F5F9;
      color: #0F172A;
      font-weight: 600;
      border: 1.5px solid #CBD5E1;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .sg-btn-secondary:hover {
      background-color: #E2E8F0;
      border-color: #94A3B8;
    }

    /* Large Interactive Choice Buttons (Sudah / Belum) */
    .sg-choice-btn {
      min-height: 56px;
      padding: 14px 20px;
      font-size: 1.05rem;
      font-weight: 700;
      border-radius: 1rem;
      border: 2px solid #CBD5E1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    /* Pulsing Audio Animation */
    @keyframes pulse-wave {
      0%, 100% { transform: scaleY(0.4); }
      50% { transform: scaleY(1.2); }
    }
    .audio-bar {
      display: inline-block;
      width: 4px;
      height: 18px;
      background-color: #1D4ED8;
      border-radius: 2px;
      animation: pulse-wave 1s ease-in-out infinite;
    }
    .audio-bar:nth-child(2) { animation-delay: 0.2s; }
    .audio-bar:nth-child(3) { animation-delay: 0.4s; }
    .audio-bar:nth-child(4) { animation-delay: 0.6s; }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">

  <!-- TOP ACCESSIBILITY & NAVIGATION BAR -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
      
      <!-- Logo & Title for Seniors & Families -->
      <div class="flex items-center space-x-3">
        <div class="w-11 h-11 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
          🛡️
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">ScamGuard AI</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 hidden sm:inline-block">
              Ramah Lansia & Keluarga
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-600 font-medium">Bantuan Pemeriksaan Risiko Penipuan Digital</p>
        </div>
      </div>

      <!-- Right Header Controls: Font Scaler & Emergency -->
      <div class="flex items-center space-x-2 sm:space-x-3">
        
        <!-- Senior Font Scaler (A- / A / A+) -->
        <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300" title="Atur Ukuran Huruf">
          <span class="text-xs font-semibold text-slate-600 px-1.5 hidden md:inline">Ukuran Huruf:</span>
          <button onclick="setFontScale('standard')" id="btn-scale-standard" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-slate-900 shadow-sm transition">
            A (Normal)
          </button>
          <button onclick="setFontScale('large')" id="btn-scale-large" class="px-2.5 py-1 text-sm font-bold rounded-lg text-slate-600 hover:text-slate-900 transition">
            A+ (Besar)
          </button>
          <button onclick="setFontScale('xlarge')" id="btn-scale-xlarge" class="px-2.5 py-1 text-base font-extrabold rounded-lg text-slate-600 hover:text-slate-900 transition">
            A++
          </button>
        </div>

        <!-- Document Report Modal Trigger -->
        <button onclick="openModal('modal-case-report')" class="hidden sm:inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition">
          📄 Laporan Kasus
        </button>

        <!-- Emergency Guide Trigger -->
        <button onclick="scrollToEmergency()" class="px-3.5 py-2 text-xs sm:text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition flex items-center gap-1.5">
          🚨 <span class="hidden sm:inline">Bantuan</span> Darurat
        </button>

      </div>

    </div>
  </header>

  <!-- HERO SECTION: CALM & REASSURING (Anti-Panic) -->
  <section class="bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-slate-200 py-6 sm:py-9">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
      
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 text-xs sm:text-sm font-bold mb-3 border border-blue-200">
        <span>✨ Pengecekan Aman Tanpa Membuka Tautan Asli</span>
      </div>

      <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-snug">
        Dapat Pesan atau Tautan Mencurigakan? <br class="hidden sm:inline" />
        <span class="text-blue-700">Periksa Dulu Bersama Kami Sebelum Mengklik.</span>
      </h1>
      
      <p class="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto mt-2.5 leading-relaxed font-normal">
        ScamGuard AI membantu Anda memahami apakah pesan WhatsApp, SMS, foto surat undangan, atau tawaran hadiah aman atau berbahaya, dilengkapi suara pembaca dan panduan langkah demi langkah.
      </p>

      <!-- SCENARIO SWITCHER (Interactive Demos) -->
      <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span class="text-xs sm:text-sm font-bold text-slate-600 mb-1 sm:mb-0">Coba Contoh Kasus:</span>
        <div class="inline-flex p-1.5 rounded-2xl bg-white border border-slate-300 shadow-sm text-xs sm:text-sm flex-wrap justify-center gap-1">
          <button onclick="loadScenario('bca_phishing')" id="pill-bca" class="px-4 py-2 rounded-xl font-bold transition bg-blue-700 text-white shadow-sm">
            ⚠️ Phishing Bank BCA (82%)
          </button>
          <button onclick="loadScenario('apk_undangan')" id="pill-apk" class="px-4 py-2 rounded-xl font-bold transition text-slate-700 hover:text-slate-900 hover:bg-slate-100">
            🚨 APK Undangan (94%)
          </button>
          <button onclick="loadScenario('idwebhost_legit')" id="pill-idweb" class="px-4 py-2 rounded-xl font-bold transition text-slate-700 hover:text-slate-900 hover:bg-slate-100">
            ✅ Resmi IDwebhost (12%)
          </button>
        </div>
      </div>

    </div>
  </section>

  <!-- MAIN WORKSTATION GRID: LAPTOP 2-COLUMN / SMARTPHONE SINGLE-COLUMN -->
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      
      <!-- LEFT COLUMN: MULTIMODAL INPUT & EVIDENCE BREAKDOWN (5 Cols) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- STEP 1: INPUT CARD -->
        <div class="sg-card p-5 sm:p-6">
          
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">1</span>
              <h2 class="text-base sm:text-lg font-extrabold text-slate-900">
                Pilih Cara Memasukkan Bukti
              </h2>
            </div>
            <span class="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-300 font-semibold" id="badge-case-id">
              SC-2026-0842
            </span>
          </div>

          <!-- BIG COMFORTABLE TABS FOR SENIORS -->
          <div class="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold mb-4">
            <button onclick="switchTab('voice')" id="tab-btn-voice" class="py-2.5 px-2 rounded-lg text-slate-700 hover:bg-slate-200 transition text-center flex flex-col items-center gap-1">
              <span class="text-base">🎙️</span>
              <span>Suara</span>
            </button>
            <button onclick="switchTab('url')" id="tab-btn-url" class="py-2.5 px-2 rounded-lg bg-blue-700 text-white shadow-sm transition text-center flex flex-col items-center gap-1">
              <span class="text-base">🔗</span>
              <span>Tautan</span>
            </button>
            <button onclick="switchTab('screenshot')" id="tab-btn-screenshot" class="py-2.5 px-2 rounded-lg text-slate-700 hover:bg-slate-200 transition text-center flex flex-col items-center gap-1">
              <span class="text-base">📷</span>
              <span>Foto/WA</span>
            </button>
            <button onclick="switchTab('text')" id="tab-btn-text" class="py-2.5 px-2 rounded-lg text-slate-700 hover:bg-slate-200 transition text-center flex flex-col items-center gap-1">
              <span class="text-base">💬</span>
              <span>Teks</span>
            </button>
          </div>

          <!-- TAB CONTENT 1: VOICE INPUT (Speech-to-Text) -->
          <div id="tab-content-voice" class="hidden space-y-4">
            <div class="p-6 rounded-2xl bg-blue-50/70 border-2 border-dashed border-blue-300 text-center">
              
              <!-- Giant Mic Button -->
              <button onclick="toggleVoiceRecording()" id="btn-mic" class="w-20 h-20 rounded-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center mx-auto transition shadow-lg transform hover:scale-105 active:scale-95">
                <svg class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8m-4-8a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
                </svg>
              </button>

              <h4 class="text-base font-extrabold text-slate-900 mt-3" id="mic-status-title">
                Tekan untuk Berbicara
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto" id="mic-status-subtitle">
                Ceritakan apa isi pesan yang Anda terima, atau siapa yang menelepon Anda. AI akan mengubah ucapan Anda menjadi teks.
              </p>

              <!-- Live Speech Transcript Box -->
              <div id="voice-transcript-box" class="mt-4 p-3 rounded-xl bg-white border border-slate-300 text-left text-xs sm:text-sm text-slate-800 min-h-[60px] hidden">
                <span class="text-xs font-bold text-blue-700 block mb-1">Hasil Rekaman Suara Anda:</span>
                <p id="voice-transcript-text" class="italic">Mendengarkan...</p>
              </div>

            </div>
          </div>

          <!-- TAB CONTENT 2: URL INPUT -->
          <div id="tab-content-url" class="space-y-3">
            <label for="input-url" class="block text-xs sm:text-sm font-bold text-slate-800">
              Alamat website / Tautan (Link) yang Anda terima:
            </label>
            <div class="relative">
              <input type="text" id="input-url" value="https://id-bca-verifikasi-keamanan.xyz/login" class="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-300 text-sm font-mono text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="https://..." />
            </div>
            <p class="text-xs text-slate-600 flex items-center gap-1.5">
              <span>🔒</span>
              <span>Pemeriksaan dilakukan di komputer server aman tanpa membuka website berbahaya di ponsel Anda.</span>
            </p>
          </div>

          <!-- TAB CONTENT 3: SCREENSHOT / FOTO -->
          <div id="tab-content-screenshot" class="hidden space-y-3">
            <label class="block text-xs sm:text-sm font-bold text-slate-800">
              Unggah Foto Chat WhatsApp, SMS, atau Tampilan Layar:
            </label>
            <div class="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 transition cursor-pointer">
              <div class="text-3xl mb-2">📸</div>
              <p class="text-sm font-bold text-slate-900">Tekan di Sini untuk Pilih Foto / Gambar</p>
              <p class="text-xs text-slate-600 mt-1">Sistem membaca tulisan di dalam foto secara otomatis (OCR)</p>
            </div>
            <div class="p-3 rounded-xl bg-white border border-slate-300 flex items-center justify-between text-xs sm:text-sm">
              <span class="text-slate-700 font-medium">📁 tangkapan_layar_chat_bca.png</span>
              <span class="text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-md">Foto Terbaca</span>
            </div>
          </div>

          <!-- TAB CONTENT 4: TEXT CHAT -->
          <div id="tab-content-text" class="hidden space-y-3">
            <label for="input-text" class="block text-xs sm:text-sm font-bold text-slate-800">
              Salin atau Tulis Isi Pesan yang Anda Terima:
            </label>
            <textarea id="input-text" rows="3" class="w-full p-3.5 rounded-xl bg-white border-2 border-slate-300 text-sm text-slate-900 focus:border-blue-600" placeholder="Contoh: 'Selamat Anda mendapatkan hadiah 50 juta dari Bank...'"></textarea>
          </div>

          <!-- SUBMIT / RE-EVALUATE BUTTON -->
          <button onclick="recalculateAnalysis()" class="mt-5 w-full sg-btn-primary text-sm sm:text-base flex items-center justify-center gap-2 shadow-md">
            <span>🔍 Periksa & Analisis Tingkat Risiko Sekarang</span>
          </button>

        </div>

        <!-- INDICATORS PANEL (MENGAPA BERISIKO?) -->
        <div class="sg-card p-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">2</span>
              <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
                Tanda-tanda yang Ditemukan AI
              </h3>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300" id="badge-indicator-count">
              4 Tanda Ditemukan
            </span>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 mb-3">
            Berikut penjelasan mudah mengenai hal-hal mencurigakan yang ada di pesan tersebut:
          </p>

          <div class="space-y-3" id="indicator-list">
            <!-- Rendered dynamically -->
          </div>

          <!-- CATEGORIES CHIPS -->
          <div class="mt-5 pt-4 border-t border-slate-200">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Kemungkinan Modus Penipuan:</span>
            <div class="flex flex-wrap gap-2 text-xs sm:text-sm font-medium" id="category-chips">
              <!-- Chips rendered dynamically -->
            </div>
          </div>

        </div>

      </div>

      <!-- RIGHT COLUMN: TRIPLE DIMENSION METRICS, AUDIO, ADAPTIVE INTERVIEW & EMERGENCY ACTIONS (7 Cols) -->
      <div class="lg:col-span-7 space-y-6">
        
        <!-- TRIPLE DIMENSION TILES: BIG HIGH CONTRAST NUMBERS -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          
          <!-- Tile 1: Content Risk -->
          <div class="sg-card p-4 sm:p-5 flex flex-col justify-between border-2 border-red-200 bg-red-50/40" id="tile-content-risk">
            <div>
              <span class="text-xs font-extrabold text-slate-600 uppercase tracking-wider block">Tingkat Risiko Pesan</span>
              <div class="flex items-baseline mt-1">
                <span class="text-4xl sm:text-5xl font-black text-red-700" id="val-content-risk">82%</span>
              </div>
              <span class="inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-800 border border-red-300" id="badge-content-risk">
                SANGAT BERISIKO
              </span>
            </div>
            <p class="text-xs text-slate-700 mt-2.5 font-medium leading-relaxed">
              Ditemukan indikator penipuan kuat pada alamat website dan kata-kata pesan.
            </p>
          </div>

          <!-- Tile 2: Confidence -->
          <div class="sg-card p-4 sm:p-5 flex flex-col justify-between border-2 border-blue-200 bg-blue-50/40" id="tile-confidence">
            <div>
              <span class="text-xs font-extrabold text-slate-600 uppercase tracking-wider block">Keyakinan Bukti AI</span>
              <div class="flex items-baseline mt-1">
                <span class="text-4xl sm:text-5xl font-black text-blue-700" id="val-confidence">86%</span>
              </div>
              <span class="inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                BUKTI SANGAT KUAT
              </span>
            </div>
            <p class="text-xs text-slate-700 mt-2.5 font-medium leading-relaxed">
              Didukung oleh catatan domain, kesamaan pola pemerasan, dan data resmi bank.
            </p>
          </div>

          <!-- Tile 3: User Exposure -->
          <div class="sg-card p-4 sm:p-5 flex flex-col justify-between border-2 border-amber-200 bg-amber-50/40" id="tile-user-exposure">
            <div>
              <span class="text-xs font-extrabold text-slate-600 uppercase tracking-wider block">Paparan Risiko Akun</span>
              <div class="flex items-baseline mt-1">
                <span class="text-4xl sm:text-5xl font-black text-amber-700" id="val-user-exposure">10%</span>
              </div>
              <span class="inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300" id="badge-user-exposure">
                BELUM BERDAMPAK
              </span>
            </div>
            <p class="text-xs text-slate-700 mt-2.5 font-medium leading-relaxed" id="desc-user-exposure">
              Anda baru menerima pesan dan belum mengisi data rahasia apapun.
            </p>
          </div>

        </div>

        <!-- AUDIO NARRATOR FOR SENIORS (Text-to-Speech) -->
        <div class="sg-card p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3 text-center sm:text-left">
            <div class="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
              🔊
            </div>
            <div>
              <h4 class="text-sm sm:text-base font-extrabold text-slate-900">
                Dengarkan Penjelasan AI (Suara Bahasa Indonesia)
              </h4>
              <p class="text-xs sm:text-sm text-slate-600">
                Bagi Anda yang kesulitan membaca teks di layar, klik tombol di sebelah kanan untuk mendengarkan.
              </p>
            </div>
          </div>
          <button onclick="toggleAudioNarration()" id="btn-audio-narrator" class="w-full sm:w-auto px-5 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-md transition">
            <span>🔊 Bacakan Hasil Analisis</span>
          </button>
        </div>

        <!-- ADAPTIVE INTERVIEW ENGINE (QUESTION WIZARD FOR ELDERLY) -->
        <div class="sg-card p-5 sm:p-6 border-2 border-slate-300">
          
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center space-x-2">
                <span class="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">3</span>
                <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
                  Wawancara Singkat: Apa yang Sudah Anda Lakukan?
                </h3>
              </div>
              <p class="text-xs sm:text-sm text-slate-600 mt-1">
                Jawab pertanyaan sederhana di bawah ini agar kami dapat membantu mengamankan rekening Anda:
              </p>
            </div>
            <span class="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Interaktif
            </span>
          </div>

          <!-- Wizard Container -->
          <div class="space-y-4" id="interview-wizard">
            
            <!-- Question 1: Opened Link -->
            <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-300" id="step-1-box">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-xs font-bold uppercase text-blue-700 tracking-wider">Pertanyaan 1 dari 3</span>
                  <p class="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    Apakah Anda sudah pernah membuka atau menekan tautan (link) tersebut?
                  </p>
                </div>
                <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-600 shrink-0" id="ans-1-status">
                  Menunggu Jawaban
                </span>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3">
                <button onclick="answerStep(1, true)" id="btn-step1-yes" class="sg-choice-btn bg-white hover:bg-orange-50 text-slate-900 hover:border-orange-400">
                  <span>✅ Sudah Membuka</span>
                </button>
                <button onclick="answerStep(1, false)" id="btn-step1-no" class="sg-choice-btn bg-white hover:bg-green-50 text-slate-900 hover:border-green-400">
                  <span>❌ Belum Membuka</span>
                </button>
              </div>
            </div>

            <!-- Question 2: Credentials Entered -->
            <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-300 opacity-50 pointer-events-none transition-all" id="step-2-box">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-xs font-bold uppercase text-blue-700 tracking-wider">Pertanyaan 2 dari 3</span>
                  <p class="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    Apakah Anda sempat memasukkan nomor kartu ATM, nama pengguna, atau password?
                  </p>
                </div>
                <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-600 shrink-0" id="ans-2-status">
                  Terkunci
                </span>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3">
                <button onclick="answerStep(2, true)" id="btn-step2-yes" class="sg-choice-btn bg-white hover:bg-red-50 text-slate-900 hover:border-red-400">
                  <span>⚠️ Ya, Mengisi Data</span>
                </button>
                <button onclick="answerStep(2, false)" id="btn-step2-no" class="sg-choice-btn bg-white hover:bg-green-50 text-slate-900 hover:border-green-400">
                  <span>❌ Tidak Mengisi</span>
                </button>
              </div>
            </div>

            <!-- Question 3: OTP Entered -->
            <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-300 opacity-50 pointer-events-none transition-all" id="step-3-box">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-xs font-bold uppercase text-blue-700 tracking-wider">Pertanyaan 3 dari 3</span>
                  <p class="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    Apakah Anda sempat memasukkan kode OTP (SMS rahasia 6 angka) atau nomor PIN?
                  </p>
                </div>
                <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-600 shrink-0" id="ans-3-status">
                  Terkunci
                </span>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3">
                <button onclick="answerStep(3, true)" id="btn-step3-yes" class="sg-choice-btn bg-white hover:bg-red-100 text-red-700 hover:border-red-600">
                  <span>🚨 Ya, Memasukkan OTP</span>
                </button>
                <button onclick="answerStep(3, false)" id="btn-step3-no" class="sg-choice-btn bg-white hover:bg-green-50 text-slate-900 hover:border-green-400">
                  <span>❌ Tidak Memasukkan OTP</span>
                </button>
              </div>
            </div>

          </div>

          <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <span>Status Pertanyaan: <strong id="interview-progress-text" class="text-slate-900">0 / 3 Terjawab</strong></span>
            <button onclick="resetInterview()" class="text-blue-700 font-bold hover:underline">
              🔄 Ulangi Pertanyaan
            </button>
          </div>

        </div>

        <!-- EMERGENCY ACTION / MITIGATION SECTION -->
        <div id="section-emergency" class="sg-card p-5 sm:p-6 border-2 transition-all duration-300 bg-white">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-300" id="badge-emergency-state">
                LANGKAH PENCEGAHAN (AMAN)
              </span>
              <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 mt-2" id="emergency-title">
                Langkah yang Sebaiknya Anda Lakukan:
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 mt-1" id="emergency-subtitle">
                Tingkat paparan masih rendah. Amankan diri Anda dengan langkah mudah berikut:
              </p>
            </div>
          </div>

          <!-- Action Checklist -->
          <div class="space-y-3" id="action-checklist">
            <!-- Rendered dynamically -->
          </div>

          <!-- FAMILY GUARDIAN & DIRECT HOTLINE BUTTONS -->
          <div class="mt-6 pt-5 border-t border-slate-200 space-y-3">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- One-Click Share to Child/Family WhatsApp -->
              <button onclick="shareToFamilyWhatsApp()" class="w-full min-h-[52px] px-4 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition">
                <span class="text-lg">📲</span>
                <span>Minta Bantuan Anak via WhatsApp</span>
              </button>

              <!-- Document Report Modal Trigger -->
              <button onclick="openModal('modal-case-report')" class="w-full min-h-[52px] px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition">
                <span>📄 Buka Dokumen Lengkap Kasus</span>
              </button>
            </div>

            <!-- Verified Official Bank Hotlines (Direct Call) -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-300">
              <span class="text-xs font-bold text-slate-700 block mb-2">Panggilan Darurat Resmi Bank (1-Sentuhan Langsung Menelepon):</span>
              <div class="flex flex-wrap gap-2 text-xs font-bold">
                <a href="tel:1500888" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-blue-700 hover:bg-blue-50 transition flex items-center gap-1">
                  📞 HaloBCA: 1500888
                </a>
                <a href="tel:14017" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-blue-700 hover:bg-blue-50 transition flex items-center gap-1">
                  📞 Contact BRI: 14017
                </a>
                <a href="tel:14000" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-blue-700 hover:bg-blue-50 transition flex items-center gap-1">
                  📞 Mandiri: 14000
                </a>
                <a href="tel:1500046" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-blue-700 hover:bg-blue-50 transition flex items-center gap-1">
                  📞 BNI: 1500046
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- INCIDENT TIMELINE: ACCESSIBLE & CLEAR -->
    <section class="mt-8 sg-card p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
            Catatan Waktu Pemeriksaan (Kronologi Insiden)
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-0.5">
            Mencatat bukti yang dimasukkan dan jawaban konfirmasi Anda secara teratur dan transparan.
          </p>
        </div>
        <span class="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
          Tersimpan Aman
        </span>
      </div>

      <div class="relative border-l-2 border-slate-300 ml-4 pl-6 space-y-6 text-xs sm:text-sm" id="timeline-events">
        
        <div class="relative">
          <span class="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white"></span>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-500 text-xs">Pukul 09:15 WIB</span>
            <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">BUKTI DITERIMA</span>
          </div>
          <p class="text-slate-900 font-bold mt-1">Pengguna memasukkan bukti tautan untuk diperiksa.</p>
          <span class="text-xs text-slate-500">Status: Selesai Dianalisis di Sandbox Server</span>
        </div>

        <div class="relative">
          <span class="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white"></span>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-500 text-xs">Pukul 09:15 WIB</span>
            <span class="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-bold">HASIL ANALISIS AI</span>
          </div>
          <p class="text-slate-900 font-bold mt-1">Ditemukan indikator peniruan akun bank dan permintaan kata sandi rahasia.</p>
          <span class="text-xs text-slate-500">Hasil: Content Risk 82% &bull; Keyakinan Bukti 86%</span>
        </div>

        <div id="timeline-dynamic-items" class="space-y-6"></div>

      </div>
    </section>

  </main>

  <!-- STICKY BOTTOM ACTION BAR FOR MOBILE / HP (SENIOR REACHABILITY) -->
  <div class="lg:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-300 p-3 shadow-2xl">
    <div class="max-w-md mx-auto grid grid-cols-2 gap-2.5">
      <button onclick="shareToFamilyWhatsApp()" class="py-3 px-3 rounded-xl bg-[#16A34A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md">
        <span>📲</span>
        <span>Kirim ke Anak (WA)</span>
      </button>
      <button onclick="scrollToEmergency()" class="py-3 px-3 rounded-xl bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md">
        <span>🚨</span>
        <span>Bantuan Darurat</span>
      </button>
    </div>
  </div>

  <!-- CASE REPORT MODAL -->
  <div id="modal-case-report" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-case-title">
    <div class="sg-card max-w-2xl w-full p-6 sm:p-8 bg-white border-2 border-slate-300 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      
      <div class="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 id="modal-case-title" class="text-xl font-extrabold text-slate-900">Dokumen Rekap Laporan Insiden</h3>
          <p class="text-xs sm:text-sm text-slate-600 font-mono mt-0.5" id="modal-case-header">CASE #SC-2026-0842 &bull; 16 September 2026</p>
        </div>
        <button onclick="closeModal('modal-case-report')" class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg transition" aria-label="Tutup dialog">
          ✕
        </button>
      </div>

      <!-- Report Body -->
      <div class="py-5 space-y-5 text-sm">
        
        <!-- Summary Score Numbers -->
        <div class="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-300 text-center">
          <div>
            <span class="text-slate-600 text-xs font-bold block">RISIKO PESAN</span>
            <strong class="text-2xl text-red-700 font-extrabold" id="modal-content-risk">82%</strong>
          </div>
          <div>
            <span class="text-slate-600 text-xs font-bold block">PAPARAN AKUN</span>
            <strong class="text-2xl text-amber-700 font-extrabold" id="modal-user-exposure">10%</strong>
          </div>
          <div>
            <span class="text-slate-600 text-xs font-bold block">KEYAKINAN</span>
            <strong class="text-2xl text-blue-700 font-extrabold" id="modal-confidence">86%</strong>
          </div>
        </div>

        <!-- Assessment Verdict -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-300">
          <span class="text-xs font-bold uppercase text-slate-600 block mb-1">Status Kesimpulan AI</span>
          <p class="text-slate-900 text-sm leading-relaxed font-medium" id="modal-assessment-text">
            Pesan terindikasi memiliki tingkat risiko sangat tinggi. Terdapat upaya social engineering dan alamat web tidak resmi bank.
          </p>
        </div>

        <!-- Confirmed Actions -->
        <div>
          <span class="text-xs font-bold uppercase text-slate-700 block mb-2">Tindakan Pengguna yang Terkonfirmasi:</span>
          <ul class="space-y-2 text-slate-800" id="modal-user-actions-list">
            <li class="flex items-center gap-2 font-medium"><span>✅</span> Menerima konten yang dicurigai</li>
            <li class="flex items-center gap-2 font-medium" id="modal-action-link"><span>⚪</span> Belum membuka tautan</li>
            <li class="flex items-center gap-2 font-medium" id="modal-action-cred"><span>⚪</span> Belum memasukkan password</li>
            <li class="flex items-center gap-2 font-medium" id="modal-action-otp"><span>⚪</span> Belum memasukkan kode OTP</li>
          </ul>
        </div>

        <!-- Mitigation Steps -->
        <div>
          <span class="text-xs font-bold uppercase text-slate-700 block mb-2">Rekomendasi Tindakan:</span>
          <ol class="list-decimal list-inside space-y-1 text-slate-700 font-medium" id="modal-mitigation-list">
            <li>Tutup pesan dan jangan membuka link apapun.</li>
            <li>Jangan pernah membagikan kode OTP atau PIN kepada siapapun.</li>
            <li>Laporkan kepada anggota keluarga terdekat.</li>
          </ol>
        </div>

      </div>

      <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-xs text-slate-500">Dihasilkan oleh ScamGuard AI &bull; IDwebhost Cloud VPS</span>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button onclick="shareToFamilyWhatsApp()" class="flex-1 sm:flex-initial px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs sm:text-sm font-bold transition">
            📲 Kirim ke WhatsApp
          </button>
          <button onclick="window.print()" class="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold transition">
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- GLOBAL FOOTER -->
  <footer class="border-t border-slate-200 bg-white py-6 text-xs text-slate-600 mt-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
      <div>
        <strong class="text-slate-900 font-bold">ScamGuard AI</strong> &bull; 
        <span>IDwebhost AI HackFest 2026</span> &bull; 
        <span>Digital Safety & Public Good</span>
      </div>
      <p class="text-xs text-slate-500 max-w-md">
        Penilaian risiko merupakan indikator kewaspadaan berdasarkan bukti yang ada, bukan vonis hukum mutlak. Selalu lakukan verifikasi ke kanal resmi bank Anda.
      </p>
    </div>
  </footer>

  <!-- JAVASCRIPT APPLICATION LOGIC -->
  <script>
    // App State
    const state = {
      scenario: 'bca_phishing',
      contentRisk: 82,
      confidence: 86,
      userExposure: 10,
      activeTab: 'url',
      isRecording: false,
      isSpeaking: false,
      fontScale: 'standard',
      answers: {
        openedLink: null,
        enteredPassword: null,
        enteredOTP: null
      }
    };

    // Font Scaler for Seniors
    function setFontScale(scale) {
      state.fontScale = scale;
      const html = document.documentElement;
      html.className = html.className.replace(/font-scale-\w+/g, '');
      html.classList.add('font-scale-' + scale);

      const buttons = ['standard', 'large', 'xlarge'];
      buttons.forEach(b => {
        const btn = document.getElementById('btn-scale-' + b);
        if (b === scale) {
          btn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-slate-900 shadow-sm transition';
        } else {
          btn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition';
        }
      });
    }

    // Tab Switcher
    function switchTab(tab) {
      state.activeTab = tab;
      const tabs = ['voice', 'url', 'screenshot', 'text'];
      tabs.forEach(t => {
        const btn = document.getElementById('tab-btn-' + t);
        const content = document.getElementById('tab-content-' + t);
        if (t === tab) {
          btn.className = 'py-2.5 px-2 rounded-lg bg-blue-700 text-white shadow-sm transition text-center flex flex-col items-center gap-1 font-bold';
          content.classList.remove('hidden');
        } else {
          btn.className = 'py-2.5 px-2 rounded-lg text-slate-700 hover:bg-slate-200 transition text-center flex flex-col items-center gap-1 font-bold';
          content.classList.add('hidden');
        }
      });
    }

    // Audio Narration (Text-to-Speech)
    function toggleAudioNarration() {
      if ('speechSynthesis' in window) {
        if (state.isSpeaking) {
          window.speechSynthesis.cancel();
          state.isSpeaking = false;
          document.getElementById('btn-audio-narrator').innerHTML = '<span>🔊 Bacakan Hasil Analisis</span>';
          document.getElementById('btn-audio-narrator').className = 'w-full sm:w-auto px-5 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-md transition';
        } else {
          window.speechSynthesis.cancel();
          let narrationText = '';
          if (state.contentRisk >= 75) {
            narrationText = `Peringatan keamanan. Pesan yang Anda periksa memiliki tingkat risiko ${state.contentRisk} persen, dan terindikasi sangat berbahaya. Mohon jangan mengklik link apapun dan jangan berikan kode OTP atau password kepada siapapun. `;
            if (state.userExposure >= 70) {
              narrationText += `Perhatian penting: Karena Anda sudah memasukkan data rahasia, segera hubungi nomor resmi bank Anda untuk memblokir kartu dan rekening Anda sekarang.`;
            } else {
              narrationText += `Karena Anda belum memasukkan data rahasia, rekening Anda masih aman. Cukup hapus pesan tersebut.`;
            }
          } else if (state.contentRisk <= 25) {
            narrationText = `Kabar baik. Konten ini terindikasi resmi dan aman dengan tingkat risiko rendah ${state.contentRisk} persen. Komunikasi ini konsisten dengan domain resmi penyedia layanan Anda.`;
          } else {
            narrationText = `Perlu waspada. Pesan ini memiliki indikator risiko sedang ${state.contentRisk} persen. Mohon berhati-hati sebelum menindaklanjuti.`;
          }

          const utterance = new SpeechSynthesisUtterance(narrationText);
          utterance.lang = 'id-ID';
          utterance.rate = 0.95; // slightly slower for elderly comprehension
          
          utterance.onend = () => {
            state.isSpeaking = false;
            document.getElementById('btn-audio-narrator').innerHTML = '<span>🔊 Bacakan Hasil Analisis</span>';
          };

          window.speechSynthesis.speak(utterance);
          state.isSpeaking = true;
          document.getElementById('btn-audio-narrator').innerHTML = '<span>⏸️ Hentikan Suara</span>';
          document.getElementById('btn-audio-narrator').className = 'w-full sm:w-auto px-5 py-3 rounded-full bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-md transition';
        }
      } else {
        alert('Fitur pembaca suara tidak didukung oleh browser ini.');
      }
    }

    // Voice Input Recording (Speech-to-Text)
    let recognition = null;
    function toggleVoiceRecording() {
      const box = document.getElementById('voice-transcript-box');
      const textEl = document.getElementById('voice-transcript-text');
      const titleEl = document.getElementById('mic-status-title');
      const subtitleEl = document.getElementById('mic-status-subtitle');
      const micBtn = document.getElementById('btn-mic');

      if (!state.isRecording) {
        state.isRecording = true;
        box.classList.remove('hidden');
        textEl.innerText = 'Mendengarkan ucapan Anda... Silakan berbicara sekarang.';
        titleEl.innerText = 'Sedang Merekam Suara Anda...';
        subtitleEl.innerText = 'Bicaralah dengan tenang dan jelas. Tekan tombol lagi jika sudah selesai.';
        micBtn.className = 'w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto transition shadow-xl animate-pulse';

        // Check Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognition = new SpeechRecognition();
          recognition.lang = 'id-ID';
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            textEl.innerText = `"${transcript}"`;
            document.getElementById('input-text').value = transcript;
          };

          recognition.onend = () => {
            stopVoiceRecordingUI();
          };

          recognition.onerror = () => {
            textEl.innerText = '"Tadi saya ditelepon orang mengaku bank BCA meminta verifikasi rekening karena kartu akan diblokir."';
            document.getElementById('input-text').value = 'Tadi saya ditelepon orang mengaku bank BCA meminta verifikasi rekening karena kartu akan diblokir.';
            stopVoiceRecordingUI();
          };

          try {
            recognition.start();
          } catch(e) {
            // fallback simulation
            setTimeout(() => {
              textEl.innerText = '"Ada pesan SMS dari Bank BCA minta klik link ini untuk pembaruan tarif transfer."';
              document.getElementById('input-text').value = 'Ada pesan SMS dari Bank BCA minta klik link ini untuk pembaruan tarif transfer.';
              stopVoiceRecordingUI();
            }, 2500);
          }
        } else {
          // Simulation fallback for browsers without speech API
          setTimeout(() => {
            textEl.innerText = '"Ada pesan SMS dari Bank BCA minta klik link ini untuk pembaruan tarif transfer."';
            document.getElementById('input-text').value = 'Ada pesan SMS dari Bank BCA minta klik link ini untuk pembaruan tarif transfer.';
            stopVoiceRecordingUI();
          }, 2500);
        }
      } else {
        if (recognition) {
          try { recognition.stop(); } catch(e) {}
        }
        stopVoiceRecordingUI();
      }
    }

    function stopVoiceRecordingUI() {
      state.isRecording = false;
      document.getElementById('mic-status-title').innerText = 'Rekaman Selesai & Berhasil Diterima';
      document.getElementById('mic-status-subtitle').innerText = 'Ucapan Anda sudah dicatat. Tekan tombol Periksa Risiko di bawah untuk menganalisis.';
      document.getElementById('btn-mic').className = 'w-20 h-20 rounded-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center mx-auto transition shadow-lg';
    }

    // Share to Family via WhatsApp
    function shareToFamilyWhatsApp() {
      let msg = `Halo, tolong bantu cek pesan ini ya.\n\nSaya baru saja mengecek pesan mencurigakan lewat ScamGuard AI:\n`;
      msg += `• Tingkat Risiko: ${state.contentRisk}%\n`;
      msg += `• Tautan / Isi Pesan: ${document.getElementById('input-url').value}\n`;
      msg += `• Status Tindakan Saya: ${state.answers.enteredOTP ? 'Sudah memasukkan OTP/PIN' : (state.answers.enteredPassword ? 'Sudah mengisi password' : (state.answers.openedLink ? 'Sudah membuka link' : 'Belum buka link'))}\n\n`;
      msg += `Hasil analisa menyarankan untuk tidak melanjutkan. Tolong bantu verifikasi ya nak. Terima kasih.`;

      const encoded = encodeURIComponent(msg);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }

    // Scenario Loader
    function loadScenario(type) {
      state.scenario = type;
      resetInterview();
      
      const pills = ['bca', 'apk', 'idweb'];
      pills.forEach(p => {
        const el = document.getElementById('pill-' + p);
        if ((type === 'bca_phishing' && p === 'bca') ||
            (type === 'apk_undangan' && p === 'apk') ||
            (type === 'idwebhost_legit' && p === 'idweb')) {
          el.className = 'px-4 py-2 rounded-xl font-bold transition bg-blue-700 text-white shadow-sm';
        } else {
          el.className = 'px-4 py-2 rounded-xl font-bold transition text-slate-700 hover:text-slate-900 hover:bg-slate-100';
        }
      });

      if (type === 'bca_phishing') {
        state.contentRisk = 82;
        state.confidence = 86;
        document.getElementById('input-url').value = 'https://id-bca-verifikasi-keamanan.xyz/login';
        document.getElementById('badge-case-id').innerText = 'SC-2026-0842';
        setIndicators([
          { title: 'Alamat Website Palsu (Bukan Milik Bank BCA)', impact: 'Bahaya Tinggi', desc: 'Domain resmi BCA adalah bca.co.id. Domain ini menggunakan akhiran palsu .xyz untuk mengecoh.', level: 'red' },
          { title: 'Meminta Password & Nomor Kartu ATM', impact: 'Bahaya Tinggi', desc: 'Formulir meminta data kartu ATM dan kode rahasia secara bersamaan.', level: 'red' },
          { title: 'Mengancam Rekening Diblokir', impact: 'Waspada', desc: 'Pelaku menakut-nakuti bahwa kartu Anda akan diblokir dalam 15 menit jika tidak segera mengisi data.', level: 'amber' },
          { title: 'Meniru Logo dan Warna Resmi BCA', impact: 'Waspada', desc: 'Menggunakan logo tiruan tanpa izin resmi perbankan.', level: 'amber' }
        ]);
        setCategories([
          { name: 'Pencurian Data Rekening', score: '88%' },
          { name: 'Peniruan Identitas Bank', score: '82%' },
          { name: 'Ancaman Pemblokiran Palsu', score: '79%' }
        ]);
      } else if (type === 'apk_undangan') {
        state.contentRisk = 94;
        state.confidence = 91;
        document.getElementById('input-url').value = 'https://bit.ly/Surat-Undangan-Pernikahan-Digital.apk';
        document.getElementById('badge-case-id').innerText = 'SC-2026-0911';
        setIndicators([
          { title: 'File Berbahaya Aplikasi (.APK)', impact: 'Sangat Kritis', desc: 'Surat undangan yang dikirim berformat aplikasi (.apk), bukan foto atau dokumen undangan asli.', level: 'red' },
          { title: 'Mencuri Kode SMS & OTP Rahasia', impact: 'Sangat Kritis', desc: 'Jika dipasang, aplikasi ini membaca SMS perbankan Anda tanpa sepengetahuan Anda.', level: 'red' },
          { title: 'Pengirim Nomor Baru Tidak Dikenal', impact: 'Bahaya Tinggi', desc: 'Nomor WhatsApp baru yang tidak ada di daftar kontak keluarga Anda.', level: 'red' }
        ]);
        setCategories([
          { name: 'Pencuri Kode SMS / OTP', score: '95%' },
          { name: 'Pembajakan Rekening HP', score: '91%' },
          { name: 'File APK Jahat', score: '89%' }
        ]);
      } else if (type === 'idwebhost_legit') {
        state.contentRisk = 12;
        state.confidence = 94;
        document.getElementById('input-url').value = 'https://member.idwebhost.com/clientarea.php';
        document.getElementById('badge-case-id').innerText = 'SC-2026-0105';
        setIndicators([
          { title: 'Domain Resmi Terverifikasi', impact: 'Aman', desc: 'Sertifikat keamanan resmi atas nama PT Web Media Technology Indonesia (IDwebhost).', level: 'green' },
          { title: 'Alamat Jaringan Hosting Resmi', impact: 'Aman', desc: 'Alamat server konsisten dengan jaringan hosting resmi IDwebhost.', level: 'green' },
          { title: 'Ketiadaan Bahasa Ancaman / Tipuan', impact: 'Aman', desc: 'Tidak ada kata-kata mendesak atau permintaan password rahasia.', level: 'green' }
        ]);
        setCategories([
          { name: 'Pemberitahuan Resmi', score: '97%' },
          { name: 'Tagihan Layanan Sah', score: '92%' }
        ]);
      }

      updateUI();
    }

    function setIndicators(list) {
      const container = document.getElementById('indicator-list');
      document.getElementById('badge-indicator-count').innerText = list.length + ' Tanda Ditemukan';
      container.innerHTML = list.map(item => {
        let badgeColor = 'text-red-800 bg-red-100 border-red-300';
        let icon = '🔴';
        let cardBg = 'bg-red-50/50 border-red-200';
        if (item.level === 'amber') {
          badgeColor = 'text-amber-800 bg-amber-100 border-amber-300';
          icon = '🟡';
          cardBg = 'bg-amber-50/50 border-amber-200';
        } else if (item.level === 'green') {
          badgeColor = 'text-green-800 bg-green-100 border-green-300';
          icon = '🟢';
          cardBg = 'bg-green-50/50 border-green-200';
        }

        return `
          <div class="p-3.5 sm:p-4 rounded-xl border ${cardBg} flex items-start gap-3">
            <span class="text-lg shrink-0 mt-0.5">${icon}</span>
            <div class="flex-1">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 class="text-sm sm:text-base font-extrabold text-slate-900">${item.title}</h4>
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColor} self-start sm:self-auto">${item.impact}</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed font-normal">${item.desc}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    function setCategories(list) {
      const container = document.getElementById('category-chips');
      container.innerHTML = list.map(c => `
        <span class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 text-xs sm:text-sm font-semibold">
          ${c.name}: <strong class="text-slate-900 font-extrabold">${c.score}</strong>
        </span>
      `).join('');
    }

    function answerStep(step, val) {
      if (step === 1) {
        state.answers.openedLink = val;
        const statusEl = document.getElementById('ans-1-status');
        statusEl.innerText = val ? 'Sudah Membuka' : 'Belum Membuka';
        statusEl.className = val ? 'text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300' : 'text-xs font-bold px-2.5 py-1 rounded-md bg-green-100 text-green-900 border border-green-300';
        
        if (val) {
          state.userExposure = 35;
          unlockStep(2);
        } else {
          state.userExposure = 10;
          lockStep(2);
          lockStep(3);
        }
      } else if (step === 2) {
        state.answers.enteredPassword = val;
        const statusEl = document.getElementById('ans-2-status');
        statusEl.innerText = val ? 'Ya, Kredensial Diisi' : 'Tidak Mengisi';
        statusEl.className = val ? 'text-xs font-bold px-2.5 py-1 rounded-md bg-red-100 text-red-900 border border-red-300' : 'text-xs font-bold px-2.5 py-1 rounded-md bg-green-100 text-green-900 border border-green-300';
        
        if (val) {
          state.userExposure = 70;
          unlockStep(3);
        } else {
          state.userExposure = 35;
          lockStep(3);
        }
      } else if (step === 3) {
        state.answers.enteredOTP = val;
        const statusEl = document.getElementById('ans-3-status');
        statusEl.innerText = val ? 'Ya, OTP Diisi' : 'Tidak Mengisi';
        statusEl.className = val ? 'text-xs font-bold px-2.5 py-1 rounded-md bg-red-200 text-red-900 border border-red-400 font-black' : 'text-xs font-bold px-2.5 py-1 rounded-md bg-green-100 text-green-900 border border-green-300';
        
        if (val) {
          state.userExposure = 85;
        } else {
          state.userExposure = 70;
        }
      }

      updateUI();
      updateTimeline();
    }

    function unlockStep(step) {
      const el = document.getElementById('step-' + step + '-box');
      el.classList.remove('opacity-50', 'pointer-events-none');
      document.getElementById('ans-' + step + '-status').innerText = 'Menunggu Jawaban';
      document.getElementById('ans-' + step + '-status').className = 'text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-300';
    }

    function lockStep(step) {
      const el = document.getElementById('step-' + step + '-box');
      el.classList.add('opacity-50', 'pointer-events-none');
      document.getElementById('ans-' + step + '-status').innerText = 'Terkunci';
      document.getElementById('ans-' + step + '-status').className = 'text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-600';
      if (step === 2) state.answers.enteredPassword = null;
      if (step === 3) state.answers.enteredOTP = null;
    }

    function resetInterview() {
      state.answers = { openedLink: null, enteredPassword: null, enteredOTP: null };
      state.userExposure = 10;
      lockStep(2);
      lockStep(3);
      document.getElementById('ans-1-status').innerText = 'Menunggu Jawaban';
      document.getElementById('ans-1-status').className = 'text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-600';
      document.getElementById('timeline-dynamic-items').innerHTML = '';
      updateUI();
    }

    function updateUI() {
      // Content Risk Tile
      document.getElementById('val-content-risk').innerText = state.contentRisk + '%';
      const badgeContent = document.getElementById('badge-content-risk');
      if (state.contentRisk >= 75) {
        badgeContent.innerText = 'SANGAT BERISIKO';
        badgeContent.className = 'inline-block mt-2 px-3 py-1 rounded-lg text-xs font-extrabold bg-red-100 text-red-800 border border-red-300';
      } else if (state.contentRisk >= 50) {
        badgeContent.innerText = 'PERLU WASPADA';
        badgeContent.className = 'inline-block mt-2 px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300';
      } else {
        badgeContent.innerText = 'AMAN / RESMI';
        badgeContent.className = 'inline-block mt-2 px-3 py-1 rounded-lg text-xs font-extrabold bg-green-100 text-green-800 border border-green-300';
      }

      // Confidence
      document.getElementById('val-confidence').innerText = state.confidence + '%';

      // User Exposure Tile
      document.getElementById('val-user-exposure').innerText = state.userExposure + '%';
      const badgeExposure = document.getElementById('badge-user-exposure');
      const descExposure = document.getElementById('desc-user-exposure');
      
      if (state.userExposure >= 85) {
        badgeExposure.innerText = 'PAPARAN SANGAT KRITIS';
        badgeExposure.className = 'inline-block mt-2 px-3 py-1 rounded-lg text-xs font-extrabold bg-red-600 text-white shadow-sm';
        descExposure.innerText = 'Kode rahasia OTP dan password telah dikirim ke penipu. Lakukan pengamanan rekening sekarang!';
        triggerEmergencyMode(true, true);
      } else if (state.userExposure >= 70) {
        badgeExposure.innerText = 'PAPARAN TINGGI';
        badgeExposure.className = 'inline-block mt-2 px-3 py-1 rounded-lg text-xs font-extrabold bg-red-100 text-red-800 border border-red-300';
        descExposure.innerText = 'Password atau data pribadi Anda sempat diisi di halaman palsu.';
        triggerEmergencyMode(true, false);
      } else if (state.userExposure >= 30) {
        badgeExposure.innerText = 'PAPARAN SEDANG';
        badgeExposure.className = 'inline-block mt-2 px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300';
        descExposure.innerText = 'Tautan sempat dibuka, tetapi Anda belum mengisi password atau data rahasia.';
        triggerEmergencyMode(false, false);
      } else {
        badgeExposure.innerText = 'BELUM BERDAMPAK';
        badgeExposure.className = 'inline-block mt-2 px-3 py-1 rounded-lg text-xs font-extrabold bg-green-100 text-green-800 border border-green-300';
        descExposure.innerText = 'Anda baru menerima pesan dan belum melakukan tindakan apapun.';
        triggerEmergencyMode(false, false);
      }

      // Interview Progress Text
      let answeredCount = 0;
      if (state.answers.openedLink !== null) answeredCount++;
      if (state.answers.enteredPassword !== null) answeredCount++;
      if (state.answers.enteredOTP !== null) answeredCount++;
      document.getElementById('interview-progress-text').innerText = `${answeredCount} / 3 Terjawab`;
    }

    function triggerEmergencyMode(isEmergency, isCritical) {
      const card = document.getElementById('section-emergency');
      const badge = document.getElementById('badge-emergency-state');
      const title = document.getElementById('emergency-title');
      const subtitle = document.getElementById('emergency-subtitle');
      const checklist = document.getElementById('action-checklist');

      if (isEmergency) {
        card.className = 'sg-card p-5 sm:p-6 border-2 border-red-400 bg-red-50/50 shadow-md';
        badge.className = 'text-xs font-black uppercase px-3 py-1 rounded-full bg-red-600 text-white shadow-sm';
        badge.innerText = isCritical ? '🚨 KEDARURATAN TINGGI (OTP MASUK)' : '⚠️ KEDARURATAN AKUN (PASSWORD MASUK)';
        title.innerText = 'Langkah Penyelamatan Rekening Anda Segera:';
        subtitle.innerText = 'Jangan panik! Ikuti langkah-langkah mudah bernomor di bawah ini satu per satu:';

        checklist.innerHTML = `
          <div class="p-3.5 rounded-xl bg-white border-2 border-red-300 flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">1</span>
            <div>
              <h5 class="text-sm sm:text-base font-extrabold text-slate-900">Jangan Berikan Kode OTP Tambahan</h5>
              <p class="text-xs sm:text-sm text-slate-700 mt-0.5">Jika ada SMS masuk atau telepon meminta kode tambahan, abaikan dan matikan telepon.</p>
            </div>
          </div>
          <div class="p-3.5 rounded-xl bg-white border-2 border-red-300 flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">2</span>
            <div>
              <h5 class="text-sm sm:text-base font-extrabold text-slate-900">Segera Telepon Call Center Resmi Bank</h5>
              <p class="text-xs sm:text-sm text-slate-700 mt-0.5">Minta petugas bank untuk memblokir sementara kartu ATM atau m-Banking Anda agar saldo aman.</p>
            </div>
          </div>
          <div class="p-3.5 rounded-xl bg-white border-2 border-red-300 flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">3</span>
            <div>
              <h5 class="text-sm sm:text-base font-extrabold text-slate-900">Minta Bantuan Anak atau Keluarga</h5>
              <p class="text-xs sm:text-sm text-slate-700 mt-0.5">Tekan tombol hijau WhatsApp di bawah ini untuk mengirimkan laporan ini ke anak Anda agar didampingi.</p>
            </div>
          </div>
        `;
      } else {
        card.className = 'sg-card p-5 sm:p-6 border-2 border-slate-300 bg-white';
        badge.className = 'text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-300';
        badge.innerText = 'LANGKAH PENCEGAHAN (AMAN)';
        title.innerText = 'Langkah yang Sebaiknya Anda Lakukan:';
        subtitle.innerText = 'Rekening Anda masih aman. Lakukan pencegahan sederhana berikut:';

        checklist.innerHTML = `
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-300 flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold shrink-0 text-sm">1</span>
            <div>
              <h5 class="text-sm sm:text-base font-extrabold text-slate-900">Tutup dan Hapus Pesan Tersebut</h5>
              <p class="text-xs sm:text-sm text-slate-700 mt-0.5">Jangan mengklik link yang ada di dalam pesan tersebut.</p>
            </div>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-300 flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold shrink-0 text-sm">2</span>
            <div>
              <h5 class="text-sm sm:text-base font-extrabold text-slate-900">Blokir Nomor Kontak Pengirim</h5>
              <p class="text-xs sm:text-sm text-slate-700 mt-0.5">Tekan nomor pengirim di WhatsApp/SMS lalu pilih 'Blokir' agar tidak bisa mengirim pesan lagi.</p>
            </div>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-300 flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold shrink-0 text-sm">3</span>
            <div>
              <h5 class="text-sm sm:text-base font-extrabold text-slate-900">Ingat Prinsip Keamanan Bank</h5>
              <p class="text-xs sm:text-sm text-slate-700 mt-0.5">Bank resmi TIDAK PERNAH meminta nomor PIN ATM atau kode OTP melalui chat atau SMS.</p>
            </div>
          </div>
        `;
      }
    }

    function updateTimeline() {
      const container = document.getElementById('timeline-dynamic-items');
      let html = '';

      if (state.answers.openedLink !== null) {
        const text = state.answers.openedLink ? 'Pengguna mengonfirmasi bahwa tautan sudah sempat dibuka.' : 'Pengguna mengonfirmasi tautan belum dibuka.';
        const color = state.answers.openedLink ? 'bg-amber-600' : 'bg-green-600';
        html += `
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-3 h-3 rounded-full ${color} ring-4 ring-white"></span>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-500 text-xs">Pukul 09:16 WIB</span>
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold">JAWABAN LANGKAH 1</span>
            </div>
            <p class="text-slate-900 font-bold mt-1">${text}</p>
            <span class="text-xs text-slate-500">Hasil: Paparan Akun diperbarui menjadi ${state.userExposure}%</span>
          </div>
        `;
      }

      if (state.answers.enteredPassword !== null) {
        const text = state.answers.enteredPassword ? 'Pengguna memasukkan informasi kredensial pada formulir.' : 'Pengguna tidak memasukkan informasi kredensial.';
        const color = state.answers.enteredPassword ? 'bg-red-600' : 'bg-green-600';
        html += `
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-3 h-3 rounded-full ${color} ring-4 ring-white"></span>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-500 text-xs">Pukul 09:17 WIB</span>
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold">JAWABAN LANGKAH 2</span>
            </div>
            <p class="text-slate-900 font-bold mt-1">${text}</p>
            <span class="text-xs text-slate-500">Hasil: Paparan Akun meningkat menjadi ${state.userExposure}%</span>
          </div>
        `;
      }

      if (state.answers.enteredOTP !== null) {
        const text = state.answers.enteredOTP ? 'Pengguna mengonfirmasi kode rahasia OTP atau PIN telah dikirimkan.' : 'Pengguna tidak memasukkan kode OTP.';
        const color = state.answers.enteredOTP ? 'bg-red-600' : 'bg-green-600';
        html += `
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-3 h-3 rounded-full ${color} ring-4 ring-white"></span>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-500 text-xs">Pukul 09:18 WIB</span>
              <span class="px-2 py-0.5 rounded bg-red-200 text-red-900 text-xs font-black">DARURAT: JAWABAN LANGKAH 3</span>
            </div>
            <p class="text-slate-900 font-bold mt-1">${text}</p>
            <span class="text-xs text-red-600 font-bold">Paparan Kritis 85%: Mode Penyelamatan Rekening Diaktifkan</span>
          </div>
        `;
      }

      container.innerHTML = html;
    }

    function recalculateAnalysis() {
      const btn = event.currentTarget;
      btn.innerHTML = '<span>⏳ Sedang Menganalisis Bukti...</span>';
      setTimeout(() => {
        btn.innerHTML = '<span>🔍 Periksa & Analisis Tingkat Risiko Sekarang</span>';
        alert('Analisis bukti berhasil diperbarui.');
      }, 700);
    }

    function scrollToEmergency() {
      document.getElementById('section-emergency').scrollIntoView({ behavior: 'smooth' });
    }

    function openModal(id) {
      document.getElementById(id).classList.remove('hidden');
      document.getElementById(id).classList.add('flex');
      
      // sync modal values
      document.getElementById('modal-content-risk').innerText = state.contentRisk + '%';
      document.getElementById('modal-confidence').innerText = state.confidence + '%';
      document.getElementById('modal-user-exposure').innerText = state.userExposure + '%';
      
      const linkEl = document.getElementById('modal-action-link');
      const credEl = document.getElementById('modal-action-cred');
      const otpEl = document.getElementById('modal-action-otp');

      linkEl.innerHTML = state.answers.openedLink ? '<span>⚠️</span> Sudah membuka tautan' : '<span>⚪</span> Belum membuka tautan';
      credEl.innerHTML = state.answers.enteredPassword ? '<span>⚠️</span> Sudah memasukkan kata sandi / data akun' : '<span>⚪</span> Belum memasukkan kata sandi';
      otpEl.innerHTML = state.answers.enteredOTP ? '<span>🚨</span> Sudah memasukkan kode OTP rahasia' : '<span>⚪</span> Belum memasukkan kode OTP';
    }

    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
      document.getElementById(id).classList.remove('flex');
    }

    // Keyboard ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal('modal-case-report');
      }
    });

    // Initialize Default Scenario on load
    loadScenario('bca_phishing');
  </script>
</body>
</html>
'''

output_path = r'C:\ibra\project\web\lomba-idwebshost\docs\prototype\index.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"File successfully written to {output_path}. Size: {len(html_content)} bytes")
