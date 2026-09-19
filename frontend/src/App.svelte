<script lang="ts">
  import Header from "./lib/Header.svelte";
  import Footer from "./lib/Footer.svelte";
  import CaseHistoryModal from "./lib/CaseHistoryModal.svelte";
  import TelephoneOperatorModal from "./lib/TelephoneOperatorModal.svelte";
  import LandingPage from "./views/LandingPage.svelte";
  import ResultPage from "./views/ResultPage.svelte";
  import HowItWorksPage from "./views/HowItWorksPage.svelte";
  import FaqPage from "./views/FaqPage.svelte";
  import DownloadPage from "./views/DownloadPage.svelte";
  import TrendsPage from "./views/TrendsPage.svelte";
  import AboutPage from "./views/AboutPage.svelte";
  import LegalPage from "./views/LegalPage.svelte";
  import { fade, fly } from "svelte/transition";

  import type {
    AnalyzeRequest,
    AnalyzeResponse,
    CaseHistoryItem,
    EvidenceType
  } from "./types";
  import { analyzeEvidence, submitInterview } from "./services/api";

  type AppRoute = "/" | "/result" | "/how-it-works" | "/faq" | "/download" | "/trends" | "/about" | "/privacy" | "/terms";

  // State
  let currentRoute = $state<AppRoute>("/");
  let isLoading = $state<boolean>(false);
  let currentAnalysis = $state<AnalyzeResponse | null>(null);
  let currentEvidence = $state<string>("");
  let isHistoryOpen = $state<boolean>(false);
  let isOperatorOpen = $state<boolean>(false);
  let historyCount = $state<number>(0);

  let resultPageRef = $state<any>(null);

  const detectedEntity = $derived.by(() => {
    const text = ((currentAnalysis?.summary || "") + " " + currentEvidence).toLowerCase();
    if (text.includes("bca")) return "Bank BCA";
    if (text.includes("bri")) return "Bank BRI";
    if (text.includes("mandiri")) return "Bank Mandiri";
    if (text.includes("bni")) return "Bank BNI";
    if (text.includes("telkomsel")) return "Telkomsel";
    if (text.includes("etle") || text.includes("tilang") || text.includes("polri") || text.includes("polisi")) return "Kepolisian (ETLE)";
    if (text.includes("idwebhost")) return "IDwebhost";
    return undefined;
  });

  $effect(() => {
    updateHistoryCount();
    checkInitialUrl();

    // Listen to browser popstate (back/forward)
    const handlePopState = () => {
      const path = window.location.pathname as AppRoute;
      const hash = window.location.hash;
      if (path && ["/", "/how-it-works", "/faq", "/download", "/trends", "/about", "/privacy", "/terms"].includes(path)) {
        currentRoute = path;
      }
      if (hash) {
        scrollToHash(hash.replace("#", ""));
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  });

  function scrollToHash(hash: string) {
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }

  function navigateTo(route: string, hash?: string) {
    if (typeof window === "undefined") return;

    if (hash && (currentRoute === "/" || route === "/")) {
      currentRoute = "/";
      window.history.pushState(null, "", `#${hash}`);
      scrollToHash(hash);
      return;
    }

    currentRoute = (route as AppRoute) || "/";
    window.history.pushState(null, "", route);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (hash) {
      scrollToHash(hash);
    }
  }

  function updateHistoryCount() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("kroscheck_history");
      if (raw) {
        const items = JSON.parse(raw);
        historyCount = items.length;
      } else {
        historyCount = 0;
      }
    } catch {
      historyCount = 0;
    }
  }

  function saveToLocalHistory(analysis: AnalyzeResponse, content: string) {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("kroscheck_history");
      const list: CaseHistoryItem[] = raw ? JSON.parse(raw) : [];
      list.unshift({
        case_id: analysis.case_id,
        content: content.slice(0, 100),
        risk: analysis.content_risk,
        summary: analysis.summary,
        timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
        evidence_type: analysis.evidence_type
      });
      if (list.length > 15) list.pop();
      localStorage.setItem("kroscheck_history", JSON.stringify(list));
      historyCount = list.length;
    } catch {}
  }

  async function checkInitialUrl() {
    if (typeof window === "undefined") return;
    
    // Check pathname
    const path = window.location.pathname as AppRoute;
    if (["/how-it-works", "/faq", "/download", "/trends", "/about", "/privacy", "/terms"].includes(path)) {
      currentRoute = path;
      return;
    }

    // Check hash on root
    if (window.location.hash) {
      scrollToHash(window.location.hash.replace("#", ""));
    }

    // Check sessionStorage
    try {
      const stored = sessionStorage.getItem("scamguard_query");
      if (stored) {
        const query = JSON.parse(stored);
        sessionStorage.removeItem("scamguard_query");
        if (query.content) {
          executeAnalysis(query);
          return;
        }
      }
    } catch {}

    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      const type = (params.get("type") as EvidenceType) || (q.startsWith("http") ? "url" : "text");
      executeAnalysis({ content: q, type });
    }
  }

  let apiErrorMessage = $state<string>("");

  async function executeAnalysis(payload: { content: string; type: EvidenceType; image_base64?: string | null }) {
    isLoading = true;
    apiErrorMessage = "";
    currentEvidence = payload.content;

    try {
      const resp = await analyzeEvidence({
        type: payload.type,
        content: payload.content,
        image_base64: payload.image_base64
      });
      currentAnalysis = resp;
      saveToLocalHistory(resp, payload.content);
      currentRoute = "/result";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Analysis execution failed:", err);
      apiErrorMessage = err.message || "Gagal menganalisis bukti digital.";
      currentRoute = "/";
    } finally {
      isLoading = false;
    }
  }

  function handleSelectHistoryItem(item: CaseHistoryItem) {
    executeAnalysis({
      content: item.content,
      type: (item.evidence_type as EvidenceType) || (item.content.startsWith("http") ? "url" : "text")
    });
  }

  async function handleOperatorAnswerStep(step: number, answer: boolean) {
    if (resultPageRef && typeof resultPageRef.handleAnswerInterview === "function") {
      await resultPageRef.handleAnswerInterview(step, answer);
    } else if (currentAnalysis) {
      await submitInterview({
        case_id: currentAnalysis.case_id,
        content_risk: currentAnalysis.content_risk,
        opened_link: step === 1 ? answer : undefined,
        entered_credentials: step === 2 ? answer : undefined,
        entered_otp: step === 3 ? answer : undefined
      });
    }
  }
</script>

<div class="min-h-screen flex flex-col bg-surface text-on-surface antialiased font-sans">
  <Header
    {historyCount}
    {currentRoute}
    onOpenHistory={() => { isHistoryOpen = true; }}
    onNavigateHome={() => navigateTo("/")}
    onNavigate={navigateTo}
  />

  <main class="flex-1 pt-20 flex flex-col">
    {#if isLoading}
      <!-- High-Tech Cyber Radar Threat Scanner Animation -->
      <div in:fade={{ duration: 200 }} class="flex-1 flex flex-col items-center justify-center min-h-[65vh] gap-8 text-center px-4">
        <div class="relative w-36 h-36 flex items-center justify-center">
          <!-- Outer pulsating wave -->
          <div class="absolute inset-0 rounded-full bg-brand-violet-vibrant/10 animate-ping"></div>
          
          <!-- Concentric radar circles -->
          <div class="absolute inset-2 rounded-full border-2 border-dashed border-purple-300 animate-spin" style="animation-duration: 12s;"></div>
          <div class="absolute inset-6 rounded-full border border-purple-200"></div>
          <div class="absolute inset-10 rounded-full border border-purple-100"></div>
          
          <!-- Radar sweep beam -->
          <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-violet-vibrant/30 via-transparent to-transparent animate-radar pointer-events-none"></div>

          <!-- Central Shield Badge -->
          <div class="relative z-10 w-16 h-16 rounded-2xl bg-white shadow-xl border border-purple-100 flex items-center justify-center animate-bounce-subtle">
            <span class="material-symbols-outlined text-brand-violet-vibrant text-3xl animate-pulse">radar</span>
          </div>
        </div>

        <div class="flex flex-col gap-2 max-w-md">
          <div class="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-brand-violet-vibrant text-xs font-bold border border-purple-200 mx-auto">
            <span class="w-2 h-2 rounded-full bg-brand-violet-vibrant animate-ping"></span>
            <span>PEMINDAIAN INTELIJEN AKTIF</span>
          </div>
          <h2 class="text-xl md:text-2xl font-extrabold text-brand-indigo-hero">
            Menganalisis Bukti Digital...
          </h2>
          <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Menghubungkan target ke intelijen ancaman siber, mendeteksi phishing typosquatting, serta mengevaluasi indikator manipulasi.
          </p>
          
          <!-- Animated scanning beam bar -->
          <div class="w-64 h-1.5 rounded-full bg-surface-container mx-auto mt-4 overflow-hidden relative">
            <div class="h-full w-24 rounded-full bg-gradient-to-r from-brand-violet-vibrant via-sky-400 to-brand-violet-vibrant absolute" style="animation: shimmer-slide 1.5s infinite linear;"></div>
          </div>
        </div>
      </div>
    {:else if currentRoute === "/result" && currentAnalysis}
      <div in:fade={{ duration: 250 }} class="flex-1 flex flex-col">
        <ResultPage
          bind:this={resultPageRef}
          analysis={currentAnalysis}
          evidenceContent={currentEvidence}
          onBack={() => navigateTo("/")}
          onOpenOperator={() => { isOperatorOpen = true; }}
        />
      </div>
    {:else if currentRoute === "/how-it-works"}
      <div in:fade={{ duration: 200 }} class="flex-1 flex flex-col">
        <HowItWorksPage
          onNavigateHome={() => navigateTo("/")}
        />
      </div>
    {:else if currentRoute === "/faq"}
      <div in:fade={{ duration: 200 }} class="flex-1 flex flex-col">
        <FaqPage
          onNavigateHome={() => navigateTo("/")}
        />
      </div>
    {:else if currentRoute === "/download"}
      <div in:fade={{ duration: 200 }} class="flex-1 flex flex-col">
        <DownloadPage
          onNavigateHome={() => navigateTo("/")}
        />
      </div>
    {:else if currentRoute === "/trends"}
      <div in:fade={{ duration: 200 }} class="flex-1 flex flex-col">
        <TrendsPage
          onNavigateHome={() => navigateTo("/")}
          onTestScenario={(content, type) => executeAnalysis({ content, type })}
        />
      </div>
    {:else if currentRoute === "/about"}
      <div in:fade={{ duration: 200 }} class="flex-1 flex flex-col">
        <AboutPage
          onNavigateHome={() => navigateTo("/")}
        />
      </div>
    {:else if currentRoute === "/privacy"}
      <div in:fade={{ duration: 200 }} class="flex-1 flex flex-col">
        <LegalPage
          initialTab="privacy"
          onNavigateHome={() => navigateTo("/")}
        />
      </div>
    {:else if currentRoute === "/terms"}
      <div in:fade={{ duration: 200 }} class="flex-1 flex flex-col">
        <LegalPage
          initialTab="terms"
          onNavigateHome={() => navigateTo("/")}
        />
      </div>
    {:else}
      <div in:fade={{ duration: 200 }} class="flex-1 flex flex-col">
        <LandingPage
          onSubmit={(payload) => executeAnalysis(payload)}
          onNavigate={navigateTo}
          apiError={apiErrorMessage}
        />
      </div>
    {/if}
  </main>

  <Footer
    onNavigate={navigateTo}
    onTestScenario={(content, type) => executeAnalysis({ content, type })}
  />

  <!-- Global Modals -->
  <CaseHistoryModal
    isOpen={isHistoryOpen}
    onClose={() => { isHistoryOpen = false; }}
    onSelectCase={handleSelectHistoryItem}
  />

  <TelephoneOperatorModal
    isOpen={isOperatorOpen}
    onClose={() => { isOperatorOpen = false; }}
    onAnswerStep={handleOperatorAnswerStep}
    targetEntity={detectedEntity}
  />
</div>
