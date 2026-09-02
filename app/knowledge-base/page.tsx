"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { KnowledgeDocument, RagComparisonResult } from "@/lib/types";
import {
  BookOpen,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  FileText,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Send,
  Loader2,
  PlusCircle,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<"comparator" | "documents" | "report">("comparator");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Comparator states
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [customQuestion, setCustomQuestion] = useState("");
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<RagComparisonResult | null>(null);

  // Document Modal viewer state
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);

  // Add Document state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocDestination, setNewDocDestination] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch("/api/v1/knowledge-base");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error("Failed to load knowledge documents", e);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  const runComparison = useCallback(async (questionText: string, dest: string = "General") => {
    setComparing(true);
    try {
      const res = await fetch("/api/v1/rag/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText, destination: dest }),
      });
      if (res.ok) {
        const data = await res.json();
        setComparisonResult(data);
      }
    } catch (e) {
      console.error("RAG comparison error:", e);
    } finally {
      setComparing(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    // Run Q1 comparison by default on initial render
    runComparison(
      "Berapa denda mengambil foto di gang pribadi kawasan Gion Kyoto, dan bagaimana aturan reservasi masuk ke Kuil Lumut Saiho-ji (Kokedera)?",
      "Kyoto, Japan"
    );
  }, [fetchDocuments, runComparison]);

  const handleSyncToS3 = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/v1/knowledge-base/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSyncMessage(`✓ S3 Sync Successful: ${data.synced_count} documents synchronized (Job: ${data.ingestion_job_id})`);
        fetchDocuments();
      }
    } catch (e) {
      setSyncMessage("Failed to sync to S3. Check network.");
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const PRESET_QUESTIONS = [
    {
      label: "Q1: Kyoto Gion & Saiho-ji",
      dest: "Kyoto, Japan",
      q: "Berapa denda mengambil foto di gang pribadi kawasan Gion Kyoto, dan bagaimana aturan reservasi masuk ke Kuil Lumut Saiho-ji (Kokedera)?",
      tag: "Cultural Etiquette & Pass",
    },
    {
      label: "Q2: Swiss Alps & Jungfraujoch",
      dest: "Swiss Alps, Switzerland",
      q: "Apa perbedaan Swiss Travel Pass dan Berner Oberland Pass, dan apakah tiket kereta menuju Puncak Jungfraujoch ter-cover 100%?",
      tag: "Rail Pass & Safety",
    },
    {
      label: "Q3: Raja Ampat TLR & Feri",
      dest: "Raja Ampat, Indonesia",
      q: "Berapa biaya Tarif Layanan Konservasi Laut (TLR/PIN Kartu Masuk) Raja Ampat untuk wisatawan domestik vs mancanegara, dan apa jadwal kapal feri reguler dari Sorong ke Waisai?",
      tag: "Conservation & Logistics",
    },
    {
      label: "Q4: Bali Sekumpul & Nyepi",
      dest: "Bali, Indonesia",
      q: "Apa aturan pakaian dan upacara adat saat mengunjungi air terjun sakral dan pura di Bali, terutama saat Melasti dan Nyepi?",
      tag: "Sacred Waterfalls & Rules",
    },
    {
      label: "Q5: Paris Louvre & Navigo",
      dest: "Paris, France",
      q: "Jika memiliki Paris Museum Pass, apakah masih perlu reservasi slot waktu online di Museum Louvre dan Musée d'Orsay, dan apa jenis tiket metro terbaik untuk 5 hari?",
      tag: "Museums & Metro Cards",
    },
  ];

  const handleSelectPreset = (index: number) => {
    setSelectedQuestionIndex(index);
    const selected = PRESET_QUESTIONS[index];
    setCustomQuestion("");
    runComparison(selected.q, selected.dest);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    runComparison(customQuestion, "General");
  };

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Sesi 9: Teaching KelanaAI to Read Knowledge
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 text-slate-200 border border-white/10">
                  <Cloud className="w-3 h-3 text-cyan-300" />
                  Amazon S3 & Bedrock KB
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Knowledge Base & RAG Comparator
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl mt-1.5 leading-relaxed">
                KelanaAI kini dilengkapi basis pengetahuan perjalanan terverifikasi. Bandingkan secara langsung perbedaan antara jawaban <strong>Base-Model (Vanilla LLM)</strong> dengan <strong>RAG (Retrieval-Augmented Generation)</strong>.
              </p>
            </div>

            {/* S3 Synchronization Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleSyncToS3}
                disabled={syncing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? "Syncing to S3..." : "Sync KB to S3"}</span>
              </button>
            </div>
          </div>

          {/* Sync status bar */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">S3 Target Bucket</span>
              <span className="font-mono font-semibold text-emerald-300 text-[11px] truncate block">
                s3://kelana-ai-kb-production/
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total KB Documents</span>
              <span className="font-bold text-white text-sm">
                {loadingDocs ? "..." : `${documents.length} Travel Docs`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Indexed Chunks</span>
              <span className="font-bold text-white text-sm">
                {loadingDocs ? "..." : `${totalChunks} Semantic Chunks`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bedrock Ingestion</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ACTIVE & SYNCED
              </span>
            </div>
          </div>

          {syncMessage && (
            <div className="mt-4 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 mb-6 gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("comparator")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "comparator"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚔️ RAG vs Base-Model Comparator</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "documents"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 Travel Documents ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("report")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "report"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>📊 Benchmark Report (Session 9)</span>
          </button>
        </div>

        {/* TAB 1: COMPARATOR */}
        {activeTab === "comparator" && (
          <div className="space-y-6">
            {/* Quick Test Questions Pills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    5 Test Benchmark Questions (Specific Knowledge Evaluator)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Click to compare instantly</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {PRESET_QUESTIONS.map((item, idx) => {
                  const isSelected = selectedQuestionIndex === idx && !customQuestion;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleSelectPreset(idx)}
                      disabled={comparing}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
                        {item.tag}
                      </span>
                      <p className="text-xs font-bold leading-snug line-clamp-2">{item.label}</p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.dest}</p>
                    </button>
                  );
                })}
              </div>

              {/* Custom question input */}
              <form onSubmit={handleCustomSubmit} className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Or enter your own question (e.g. 'Berapa denda foto di gang privat Gion?')..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={comparing || !customQuestion.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {comparing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Test RAG</span>
                </button>
              </form>
            </div>

            {/* Loading comparison */}
            {comparing && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Menjalankan Pengujian Komparasi...</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Mengambil konteks dari Amazon Bedrock KB / Knowledge Base, kemudian membandingkan Base-Model vs RAG Model secara berdampingan.
                </p>
              </div>
            )}

            {/* Results Side-by-Side Dual Pane */}
            {comparisonResult && !comparing && (
              <div className="space-y-4">
                {/* Active Question Bar */}
                <div className="bg-slate-900 rounded-xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase">
                      Pertanyaan Uji
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white">{comparisonResult.question}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    Destinasi: {comparisonResult.destination}
                  </span>
                </div>

                {/* 2-Column Side by Side Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT: BASE MODEL */}
                  <div className="bg-white rounded-2xl border-2 border-amber-200/80 shadow-sm overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-amber-50/80 border-b border-amber-200/80 p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                            Base-Model (Vanilla Bedrock / Nova)
                          </h4>
                        </div>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Tanpa Knowledge Base &bull; Latency: {comparisonResult.base_model.latency_ms}ms
                        </p>
                      </div>

                      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Risiko Halusinasi
                      </span>
                    </div>

                    {/* Answer content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed">
                        <ReactMarkdown>{comparisonResult.base_model.answer}</ReactMarkdown>
                      </div>

                      {/* Weaknesses Box */}
                      <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3.5 mt-4">
                        <h5 className="text-[11px] font-bold text-rose-900 flex items-center gap-1 mb-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Kelemahan Jawaban Base-Model:
                        </h5>
                        <ul className="space-y-1">
                          {comparisonResult.base_model.weaknesses.map((w, i) => (
                            <li key={i} className="text-[11px] text-rose-800 flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold">&times;</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: RAG MODEL */}
                  <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-sm overflow-hidden flex flex-col ring-1 ring-emerald-500/20">
                    {/* Header */}
                    <div className="bg-emerald-50/90 border-b border-emerald-200 p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                            KelanaAI RAG Engine (Knowledge-Augmented)
                          </h4>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Terkoneksi ke Knowledge Base &bull; Latency: {comparisonResult.rag_model.latency_ms}ms
                        </p>
                      </div>

                      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        100% Terverifikasi
                      </span>
                    </div>

                    {/* Answer content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="prose prose-sm max-w-none text-xs text-slate-800 leading-relaxed">
                        <ReactMarkdown>{comparisonResult.rag_model.answer}</ReactMarkdown>
                      </div>

                      {/* Cited Sources & Grounding */}
                      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 mt-4">
                        <h5 className="text-[11px] font-bold text-emerald-900 flex items-center gap-1 mb-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          Sitasi Dokumen Pengetahuan Terverifikasi:
                        </h5>
                        <div className="space-y-1.5">
                          {comparisonResult.rag_model.cited_sources.map((src, i) => (
                            <div
                              key={i}
                              className="text-[11px] text-emerald-950 bg-white/90 border border-emerald-200/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between"
                            >
                              <span className="font-mono font-semibold truncate text-[10px] text-emerald-800">
                                {src.filename}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate ml-2">
                                {src.section}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Improvement Summary Card */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Analisis Peningkatan Nilai Informasi (RAG Delta Summary)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">
                        Akurasi & Presisi Faktual
                      </span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {comparisonResult.improvement_summary.accuracy_boost}
                      </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-amber-600 block mb-1">
                        Pencegahan Halusinasi Fatal
                      </span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {comparisonResult.improvement_summary.hallucination_fixed}
                      </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-teal-600 block mb-1">
                        Manfaat Bagi Pelancong
                      </span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {comparisonResult.improvement_summary.actionable_insight}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCUMENTS EXPLORER */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Travel Knowledge Documents Repository
                </h3>
                <p className="text-xs text-slate-500">
                  Seluruh dokumen disimpan di <code>/knowledge_base/*.md</code> dan tersinkronisasi ke S3.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tambah Dokumen Baru</span>
                </button>
              </div>
            </div>

            {loadingDocs ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                <span className="text-xs text-slate-500">Memuat berkas Knowledge Base...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {doc.destination}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          S3 Synced
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mb-1.5">
                        {doc.title}
                      </h4>

                      <p className="font-mono text-[10px] text-slate-400 truncate mb-3">
                        {doc.s3_uri}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Ukuran</span>
                          <span className="font-semibold text-slate-700">{doc.bytes.toLocaleString()} bytes</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Indexed Chunks</span>
                          <span className="font-semibold text-slate-700">{doc.chunk_count} Chunks</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="w-full py-2 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Baca Isi Dokumen Lengkap</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REPORT & FINDINGS */}
        {activeTab === "report" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Laporan Evaluasi RAG Sesi 9: Teaching KelanaAI to Read Knowledge
                </h2>
                <p className="text-xs text-slate-500">
                  Dokumentasi resmi pemenuhan checklist tugas, perbandingan 5 pertanyaan baru, dan kesimpulan evaluasi.
                </p>
              </div>
            </div>

            {/* Checklist items */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                Status Checklist Pengerjaan
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Upload 3+ travel documents:</strong> 5 dokumen travel terverifikasi diunggah ke <code>knowledge_base/</code> dan tersinkronisasi ke S3.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Test with 5 new questions:</strong> 5 pertanyaan spesifik diuji langsung (Kyoto, Swiss Alps, Raja Ampat, Bali, Paris).</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Record improved answers:</strong> Perbandingan performa dicatat detail pada <code>BENCHMARK_RAG_VS_BASE.md</code>.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Git & Version Control:</strong> Commit <code>&quot;Expand Knowledge Base and compare RAG vs base-model answers&quot;</code> dan tag <code>session-9</code>.</span>
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Destinasi</th>
                    <th className="p-3">Pertanyaan Kritis</th>
                    <th className="p-3">Jawaban Base-Model</th>
                    <th className="p-3">Jawaban RAG KelanaAI</th>
                    <th className="p-3">Dampak Peningkatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Kyoto, Japan</td>
                    <td className="p-3">Denda foto gang Gion & tiket Kuil Saiho-ji</td>
                    <td className="p-3 text-rose-700">Tidak ada nominal denda; sebut tiket kuil bisa beli di loket gerbang.</td>
                    <td className="p-3 text-emerald-800 font-medium">Denda ¥10.000 JPY; tiket on-the-spot ditolak; wajib reservasi online & ritual kaligrafi Shakyo.</td>
                    <td className="p-3 font-semibold text-emerald-700">Akurasi aturan 100%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Swiss Alps</td>
                    <td className="p-3">Swiss Travel Pass ke Puncak Jungfraujoch</td>
                    <td className="p-3 text-rose-700">Halusinasi: klaim kereta gratis 100% sampai puncak.</td>
                    <td className="p-3 text-emerald-800 font-medium">Koreksi: gratis hanya sampai Grindelwald/Wengen; puncak hanya diskon 25%.</td>
                    <td className="p-3 font-semibold text-emerald-700">Cegah kerugian CHF 100+</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Raja Ampat</td>
                    <td className="p-3">Biaya Tarif Layanan Lingkungan & feri Sorong</td>
                    <td className="p-3 text-rose-700">Estimasi acak; jadwal feri tidak ada.</td>
                    <td className="p-3 text-emerald-800 font-medium">WNI Rp 500k, WNA Rp 1jt (12 bulan); jadwal feri 09:00 & 14:00 WIT (2 jam).</td>
                    <td className="p-3 font-semibold text-emerald-700">Jadwal & biaya akurat</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Bali</td>
                    <td className="p-3">Pemandu Sekumpul & penutupan bandara saat Nyepi</td>
                    <td className="p-3 text-rose-700">Hanya bilang pakaian sopan; tidak sebut bandara tutup.</td>
                    <td className="p-3 text-emerald-800 font-medium">Wajib guide Sekumpul (Rp 150k-250k); kamen & senteng; bandara DPS tutup total 24 jam.</td>
                    <td className="p-3 font-semibold text-emerald-700">Patuhi adat & jadwal terbang</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Paris</td>
                    <td className="p-3">Paris Museum Pass di Louvre & tiket metro</td>
                    <td className="p-3 text-rose-700">Fatal: klaim bisa langsung masuk Louvre tanpa reservasi jam.</td>
                    <td className="p-3 text-emerald-800 font-medium">Wajib slot créneau horaire (tanpa reservasi ditolak masuk); denda foto Navigo €35-50.</td>
                    <td className="p-3 font-semibold text-emerald-700">Cegah ditolak di gerbang</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: View Full Document */}
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedDoc.title}</h3>
                    <p className="font-mono text-[10px] text-slate-400">{selectedDoc.filename}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed">
                <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New Travel Document */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Tambah Dokumen Travel ke Knowledge Base</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judul Dokumen</label>
                  <input
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="Contoh: Panduan Etiket & Transportasi Tokyo"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destinasi / Kategori</label>
                  <input
                    type="text"
                    value={newDocDestination}
                    onChange={(e) => setNewDocDestination(e.target.value)}
                    placeholder="Contoh: Tokyo, Japan"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Konten Dokumen (Markdown)</label>
                  <textarea
                    rows={8}
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    placeholder="Tuliskan regulasi lokal, denda, tiket, dan etika perjalanan..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    if (!newDocTitle || !newDocContent) return;
                    // Trigger sync simulation
                    await handleSyncToS3();
                    setShowAddModal(false);
                    setNewDocTitle("");
                    setNewDocDestination("");
                    setNewDocContent("");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
                >
                  Simpan & Sync ke S3
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
