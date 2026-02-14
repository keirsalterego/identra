import { useState, useEffect, useRef } from "react";
import { Command, ArrowRight } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export default function Launcher() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { id: 1, text: "Summarize last meeting notes", label: "SUMMARIZE" },
    { id: 2, text: 'Search for "Authentication"', label: "SEARCH" }
  ];

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus();

    // Listen for Escape to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        invoke("toggle_launcher").catch(console.error);
        setQuery("");
        setMessages([]);
      }
    };
    globalThis.addEventListener('keydown', handleEsc);
    return () => globalThis.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: query
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsProcessing(true);

    try {
      let responseContent;

      // Check if it's a search query
      if (query.toLowerCase().startsWith("/search") || query.toLowerCase().includes("search for")) {
        const searchQuery = query.replace(/^\/search\s*/i, "").replace(/search for\s*/i, "");
        const results = await invoke("semantic_search", { query: searchQuery });

        if (results && results.length > 0) {
          responseContent = "Here are the top results from your vault:\n\n" +
            results.map(r => `• ${r.content.substring(0, 100)}...`).join("\n");
        } else {
          responseContent = "No relevant memories found in your vault.";
        }
      } else {
        // Default to Chat
        const response = await invoke("chat_with_ai", {
          message: userMessage.content,
          model: "claude", // Default model for Launcher
          conversationHistory: []
        });
        responseContent = response.message;
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: responseContent
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error:", err);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${err}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      background: 'transparent',
      overflow: 'hidden'
    }}>
      <div className="w-full max-w-3xl flex flex-col gap-5 items-center animate-scale-in" style={{ background: 'transparent' }}>

        {/* Title - Refined typography */}
        <div className="text-center space-y-1.5 select-none">
          <h1 className="text-2xl font-semibold text-identra-text-primary tracking-tight">
            Instant Invocation
          </h1>
          <p className="text-xs text-identra-text-tertiary tracking-wide">
            <kbd className="px-1.5 py-0.5 bg-identra-surface-elevated border border-identra-border rounded text-[10px] font-mono">Alt</kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-identra-surface-elevated border border-identra-border rounded text-[10px] font-mono">Space</kbd>
            {' • Always robust, never intrusive'}
          </p>
        </div>

        {/* Search Box - More refined */}
        <div className="w-full bg-identra-bg border border-identra-border shadow-strong rounded-xl overflow-hidden backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-5 py-4">
              <Command className="w-5 h-5 text-identra-text-tertiary shrink-0" strokeWidth={2} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Identra..."
                className="flex-1 bg-transparent text-identra-text-primary placeholder:text-identra-text-tertiary outline-none text-base"
                disabled={isProcessing}
                autoFocus
              />
              {isProcessing && (
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-identra-primary rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-identra-primary rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1.5 h-1.5 bg-identra-primary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Quick Actions - Infrastructure style */}
        {messages.length === 0 && (
          <div className="w-full space-y-2 animate-fade-in-up">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => setQuery(action.text)}
                className="w-full px-5 py-3 bg-identra-surface/80 border border-identra-border rounded-lg hover:border-identra-primary hover:bg-identra-surface-hover/90 transition-all duration-200 text-left flex items-center justify-between group backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-identra-text-tertiary font-bold tracking-wider uppercase border-r border-identra-border-subtle pr-3">
                    {action.label}
                  </span>
                  <span className="text-sm text-identra-text-secondary group-hover:text-identra-text-primary font-medium">
                    {action.text}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-identra-text-muted group-hover:text-identra-text-primary group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {/* Messages - Professional layout */}
        {messages.length > 0 && (
          <div className="w-full bg-identra-bg/95 border border-identra-border shadow-strong rounded-xl p-6 max-h-[500px] overflow-y-auto space-y-4 backdrop-blur-md animate-fade-in-up">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`px-4 py-3 max-w-[90%] rounded-lg shadow-sm ${msg.role === 'user'
                  ? 'bg-identra-surface-elevated border border-identra-border text-identra-text-primary'
                  : 'text-identra-text-secondary leading-relaxed'
                  }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex flex-col gap-1">
                <div className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-identra-text-muted rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-identra-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-1.5 bg-identra-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
