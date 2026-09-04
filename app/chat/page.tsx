"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth_context";
import { API_URL } from "@/lib/api";
import type { Conversation, ChatMessage } from "@/lib/types";
import {
  MessageSquare,
  Send,
  Sparkles,
  Clock,
  ArrowDown,
  Plus,
  Edit2,
  Trash2,
  Bot,
  User as UserIcon,
  Check,
  CheckCheck,
  Loader2,
  Menu,
  X,
  Search,
  Compass,
  AlertCircle,
} from "lucide-react";

// Format helper for timestamps (Feature 4: Timestamp on each message bubble)
function formatMessageTimestamp(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (isToday) {
      return `${timeStr} WIB`;
    }

    const dateStr = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return "";
  }
}

function ChatInterface() {
  const { user, authFetch } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Title Editing State (Feature 1: Conversation Title)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  // Search filter for conversation history
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-scroll references (Feature 2: Auto-scroll)
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Function to execute scroll to latest message
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior,
        block: "end",
      });
    }
  }, []);

  // Load single conversation and its message history
  const loadConversation = useCallback(
    async (conversationId: string) => {
      setLoadingMessages(true);
      setError(null);
      try {
        const res = await authFetch(`${API_URL}/api/v1/conversations/${conversationId}`);
        if (!res.ok) {
          throw new Error("Gagal memuat pesan percakapan.");
        }
        const data: Conversation = await res.json();
        setCurrentConversation(data);
        setMessages(data.messages || []);
        setEditTitleValue(data.title);
        setSidebarOpen(false);

        // FEATURE 2 - SCENARIO A:
        // Auto-scroll to the latest message at the bottom when user first opens the conversation
        setTimeout(() => {
          scrollToBottom("auto");
        }, 50);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat percakapan.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [authFetch, scrollToBottom]
  );

  // Fetch list of conversations
  const fetchConversations = useCallback(
    async (selectFirst = true) => {
      setLoadingList(true);
      setError(null);
      try {
        const res = await authFetch(`${API_URL}/api/v1/conversations`);
        if (!res.ok) {
          throw new Error("Gagal memuat riwayat percakapan.");
        }
        const data: Conversation[] = await res.json();
        setConversations(data);

        if (selectFirst && data.length > 0 && !currentConversation) {
          loadConversation(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoadingList(false);
      }
    },
    [authFetch, currentConversation, loadConversation]
  );

  useEffect(() => {
    fetchConversations(true);
  }, [fetchConversations]);

  // Scroll listener to detect if user is scrolled up
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // Show button if more than 150px away from bottom
    setShowScrollBottomBtn(distanceFromBottom > 150);
  };

  // FEATURE 2 - SCENARIO B:
  // Auto-scroll down when new messages are appended or typing indicator changes
  useEffect(() => {
    if (!loadingMessages) {
      scrollToBottom("smooth");
    }
  }, [messages, isTyping, loadingMessages, scrollToBottom]);

  // Create a new conversation
  const handleCreateNewConversation = async (initialPrompt?: string) => {
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/api/v1/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Percakapan Baru",
          message: initialPrompt,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal membuat percakapan baru.");
      }

      const newConv: Conversation = await res.json();
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages(newConv.messages || []);
      setEditTitleValue(newConv.title);
      setSidebarOpen(false);

      // If initialPrompt was provided, trigger generation
      if (initialPrompt) {
        sendMessage(initialPrompt, newConv.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat sesi baru.");
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    setInputText("");

    const targetConvId = currentConversation?.id;

    // If no active conversation, create one first
    if (!targetConvId) {
      await handleCreateNewConversation(userText);
      return;
    }

    await sendMessage(userText, targetConvId);
  };

  const sendMessage = async (userText: string, convId: string) => {
    // 1. Optimistically append user message immediately to the UI
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: convId,
      role: "user",
      content: userText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    // FEATURE 2 - SCENARIO B:
    // Scroll down instantly when the user sends a new message
    setTimeout(() => {
      scrollToBottom("smooth");
    }, 20);

    // FEATURE 3: Activate typing indicator while waiting for AI response
    setIsTyping(true);
    setError(null);

    try {
      const res = await authFetch(`${API_URL}/api/v1/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userText }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Gagal mendapatkan balasan dari AI.");
      }

      const result = await res.json();
      // Replace optimistic message and append real assistant message
      if (result.conversation) {
        setCurrentConversation(result.conversation);
        setMessages(result.conversation.messages);
        setEditTitleValue(result.conversation.title);

        // Update list sidebar entry
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? result.conversation : c))
        );
      } else if (result.assistant_message) {
        setMessages((prev) => [...prev, result.assistant_message]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses obrolan.");
    } finally {
      // FEATURE 3: Deactivate typing indicator once response is ready
      setIsTyping(false);
      setTimeout(() => {
        scrollToBottom("smooth");
      }, 50);
    }
  };

  // Update Conversation Title (Feature 1: Conversation Title)
  const handleSaveTitle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentConversation || !editTitleValue.trim()) return;

    setSavingTitle(true);
    try {
      const res = await authFetch(
        `${API_URL}/api/v1/conversations/${currentConversation.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editTitleValue.trim() }),
        }
      );

      if (!res.ok) throw new Error("Gagal memperbarui judul percakapan.");

      const updated: Conversation = await res.json();
      setCurrentConversation(updated);
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setIsEditingTitle(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan judul.");
    } finally {
      setSavingTitle(false);
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus percakapan ini?")) return;

    try {
      const res = await authFetch(`${API_URL}/api/v1/conversations/${convId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus percakapan.");

      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (currentConversation?.id === convId) {
        const remaining = conversations.filter((c) => c.id !== convId);
        if (remaining.length > 0) {
          loadConversation(remaining[0].id);
        } else {
          setCurrentConversation(null);
          setMessages([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick suggestion chips
  const quickPrompts = [
    "Aturan fotografi & denda di Gion Kyoto",
    "Berapa diskon Swiss Travel Pass ke Jungfraujoch?",
    "Rekomendasi kuliner soba autentik di Higashiyama",
    "Bagaimana dengan opsi transportasinya?",
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      {/* ============================================================ */}
      {/* SIDEBAR: Conversation History (Desktop & Mobile Drawer)       */}
      {/* ============================================================ */}
      <aside
        className={`fixed inset-y-16 left-0 z-40 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Riwayat Obrolan</span>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {conversations.length}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => handleCreateNewConversation()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Percakapan Baru</span>
          </button>

          {/* Search box */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingList ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-2">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
              <p>Memuat riwayat percakapan...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              <p>Belum ada riwayat percakapan.</p>
              <button
                onClick={() => handleCreateNewConversation()}
                className="mt-2 text-emerald-600 hover:underline font-medium"
              >
                Mulai obrolan sekarang
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = currentConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`group relative p-3 rounded-xl cursor-pointer text-left transition-all flex items-start justify-between gap-2 ${
                    isActive
                      ? "bg-emerald-50/90 border border-emerald-200 shadow-xs"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-emerald-600" : "text-slate-400"
                        }`}
                      />
                      <h4
                        className={`text-xs font-semibold truncate ${
                          isActive ? "text-emerald-950" : "text-slate-800"
                        }`}
                      >
                        {conv.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate leading-relaxed">
                      {conv.last_message || "Belum ada pesan."}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatMessageTimestamp(conv.updated_at)}</span>
                    </div>
                  </div>

                  {/* Delete conversation button */}
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    title="Hapus percakapan"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer: Conversational Memory Note */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <p className="leading-tight">
            Memori percakapan aktif: konteks riwayat obrolan dirangkai otomatis ke LLM.
          </p>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ============================================================ */}
      {/* MAIN CHAT AREA: Header, Message Viewport, Typing Indicator,   */}
      {/* and Prompt Input                                             */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
        {/* ========================================================== */}
        {/* FEATURE 1: CONVERSATION TITLE IN CHAT HEADER               */}
        {/* ========================================================== */}
        <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-xs shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu toggle button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              title="Buka daftar obrolan"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* AI Avatar Icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-5 h-5" />
            </div>

            {/* Conversation Title & Status */}
            <div className="min-w-0">
              {isEditingTitle ? (
                <form
                  onSubmit={handleSaveTitle}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={editTitleValue}
                    onChange={(e) => setEditTitleValue(e.target.value)}
                    autoFocus
                    className="text-sm font-bold text-slate-900 px-2 py-1 bg-slate-50 border border-emerald-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={savingTitle}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md"
                    title="Simpan Judul"
                  >
                    {savingTitle ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditTitleValue(currentConversation?.title || "");
                    }}
                    className="p-1 text-slate-400 hover:bg-slate-100 rounded-md"
                    title="Batal"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2
                    id="conversation-title"
                    className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight tracking-tight"
                  >
                    {currentConversation ? currentConversation.title : "KelanaAI Travel Assistant"}
                  </h2>

                  {currentConversation && (
                    <button
                      onClick={() => {
                        setEditTitleValue(currentConversation.title);
                        setIsEditingTitle(true);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit judul percakapan"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Status and Session Info */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Amazon Bedrock / Gemini
                </span>
                <span>•</span>
                <span>{messages.length} pesan tersimpan</span>
              </div>
            </div>
          </div>

          {/* Right Header Action: New Chat shortcut */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCreateNewConversation()}
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Obrolan Baru</span>
            </button>
          </div>
        </header>

        {/* ========================================================== */}
        {/* MESSAGE VIEWPORT (WITH AUTO-SCROLL TO LATEST MESSAGE)       */}
        {/* ========================================================== */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white"
        >
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-700 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {loadingMessages ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs font-medium">Menyelaraskan memori obrolan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-xs">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Halo, {user?.name || "Traveler"}!
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                KelanaAI siap membantu merancang rute liburan, tips tiket kereta, hingga etika lokal dengan memori obrolan multi-turn.
              </p>

              {/* Prompt Suggestions */}
              <div className="w-full space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                  Saran Topik Pembuka:
                </p>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(prompt);
                    }}
                    className="w-full text-left p-2.5 text-xs bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-colors text-slate-700 cursor-pointer flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Message List */}
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id || index}
                    className={`flex items-end gap-2.5 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Assistant Avatar */}
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    {/* Message Bubble Container */}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs ${
                        isUser
                          ? "bg-emerald-600 text-white rounded-br-xs"
                          : "bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs"
                      }`}
                    >
                      {/* Sender Name label */}
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isUser ? "text-emerald-100" : "text-emerald-700"
                          }`}
                        >
                          {isUser ? "Anda" : "KelanaAI"}
                        </span>
                      </div>

                      {/* Content (Render Markdown for Assistant) */}
                      {isUser ? (
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                          {msg.content}
                        </p>
                      ) : (
                        <div className="text-xs sm:text-sm leading-relaxed prose prose-sm prose-emerald max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-headings:text-sm prose-headings:my-2 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}

                      {/* ===================================================== */}
                      {/* FEATURE 4: TIMESTAMP ON EACH MESSAGE BUBBLE           */}
                      {/* ===================================================== */}
                      <div
                        className={`flex items-center gap-1 justify-end mt-1.5 text-[10px] select-none ${
                          isUser ? "text-emerald-200" : "text-slate-400"
                        }`}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatMessageTimestamp(msg.created_at)}</span>
                        {isUser && <CheckCheck className="w-3 h-3 text-emerald-200 ml-0.5" />}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mb-1 text-xs font-bold uppercase">
                        {user?.name?.charAt(0) || <UserIcon className="w-3.5 h-3.5" />}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ======================================================= */}
              {/* FEATURE 3: TYPING INDICATOR (ANIMATED STATUS & DOTS)    */}
              {/* ======================================================= */}
              {isTyping && (
                <div
                  id="typing-indicator"
                  className="flex items-end gap-2.5 justify-start animate-fade-in"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-xs ring-2 ring-emerald-400/40 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="bg-white border border-emerald-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        KelanaAI
                      </span>
                      <span className="text-[10px] text-slate-400 bg-emerald-50 px-1.5 py-0.2 rounded">
                        Memproses memori...
                      </span>
                    </div>

                    {/* Animated 3 Bouncing Dots */}
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium italic">
                        Sedang merangkai rekomendasi perjalanan...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ref target for auto-scroll */}
              <div ref={messagesEndRef} className="h-2" />
            </>
          )}
        </div>

        {/* Floating "Scroll to Bottom" button */}
        {showScrollBottomBtn && (
          <button
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-28 right-6 z-20 p-2.5 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Scroll ke pesan terbaru"
          >
            <ArrowDown className="w-4 h-4" />
            <span className="hidden sm:inline">Pesan Terbaru</span>
          </button>
        )}

        {/* ========================================================== */}
        {/* INPUT FORM: Textarea, Quick Chips & Send Button            */}
        {/* ========================================================== */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          {/* Follow-up quick chips */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Lanjutan:
              </span>
              {quickPrompts.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInputText(prompt)}
                  className="text-[11px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 hover:border-emerald-200 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
          >
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ketik pertanyaan atau permintaan rute... (Tekan Enter untuk kirim)"
              className="flex-1 max-h-32 p-2 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className={`p-2.5 rounded-xl text-white transition-all cursor-pointer shrink-0 ${
                !inputText.trim() || isTyping
                  ? "bg-slate-300 cursor-not-allowed text-slate-500"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
              }`}
              title="Kirim Pesan"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <p className="mt-1.5 text-[10px] text-center text-slate-400">
            KelanaAI mengingat topik percakapan sebelumnya untuk memberikan rute yang koheren.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatInterface />
    </ProtectedRoute>
  );
}
