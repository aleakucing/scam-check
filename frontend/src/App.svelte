<script lang="ts">
  import Header from "./lib/Header.svelte";
  import Footer from "./lib/Footer.svelte";
  import CaseHistoryModal from "./lib/CaseHistoryModal.svelte";
  import TelephoneOperatorModal from "./lib/TelephoneOperatorModal.svelte";
  import LandingPage from "./views/LandingPage.svelte";
  import ResultPage from "./views/ResultPage.svelte";

  import type {
    AnalyzeRequest,
    AnalyzeResponse,
    CaseHistoryItem,
    EvidenceType
  } from "./types";
  import { analyzeEvidence, submitInterview } from "./services/api";

  // State
  let currentRoute = $state<"/" | "/result">("/");
  let isLoading = $state<boolean>(false);
  let currentAnalysis = $state<AnalyzeResponse | null>(null);
  let currentEvidence = $state<string>("");
  let isHistoryOpen = $state<boolean>(false);
  let isOperatorOpen = $state<boolean>(false);
  let historyCount = $state<number>(0);

  let resultPageRef = $state<any>(null);

  $effect(() => {
    updateHistoryCount();
    checkInitialUrl();
  });

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

  async function executeAnalysis(payload: { content: string; type: EvidenceType; image_base64?: string | null }) {
    isLoading = true;
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
    } catch (err) {
      console.error("Analysis execution failed:", err);
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
    onOpenHistory={() => { isHistoryOpen = true; }}
    onNavigateHome={() => { currentRoute = "/"; }}
  />

  <main class="flex-1 pt-20 flex flex-col">
    {#if isLoading}
      <!-- Sleek Loading State with Progress Pulse -->
      <div class="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div class="relative flex items-center justify-center">
          <div class="w-20 h-20 rounded-full border-4 border-surface-container-high border-t-brand-violet-vibrant animate-spin"></div>
          <span class="material-symbols-outlined text-brand-violet-vibrant text-3xl absolute">security</span>
        </div>
        <div class="flex flex-col gap-1.5 max-w-md">
          <h2 class="text-xl font-bold text-brand-indigo-hero">
            Menganalisis Bukti Digital...
          </h2>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Menghubungkan target ke intelijen ancaman siber, memeriksa potensi pemalsuan domain, dan mengevaluasi indikator manipulasi.
          </p>
        </div>
      </div>
    {:else if currentRoute === "/result" && currentAnalysis}
      <ResultPage
        bind:this={resultPageRef}
        analysis={currentAnalysis}
        evidenceContent={currentEvidence}
        onBack={() => { currentRoute = "/"; }}
        onOpenOperator={() => { isOperatorOpen = true; }}
      />
    {:else}
      <LandingPage
        onSubmit={(payload) => executeAnalysis(payload)}
      />
    {/if}
  </main>

  <Footer />

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
  />
</div>
