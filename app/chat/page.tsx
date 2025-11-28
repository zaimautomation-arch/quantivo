// app/chat/page.tsx
"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// markdown minimo per **bold**
function renderMarkdown(content: string) {
  return content
    .replace(/\*\*(.+?)\*\*/g, "<strong class='font-semibold'>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm **Quantivo Chat**, your AI for personal finance.\n\n" +
        "You can ask me about:\n" +
        "- basic investing concepts\n" +
        "- differences between stocks, ETFs and crypto\n" +
        "- risk management and time horizon\n\n" +
        "I can teach you how to invest, but I won't give you specific financial advice or stock tips. " ,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newUserMessage: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const reply =
        data.reply ??
        "I’m having trouble responding right now. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <section className="flex flex-1 items-stretch justify-center py-4 md:py-6">
        <div
          className="
            flex w-full max-w-3xl flex-col gap-3 
            rounded-3xl border 
            bg-[var(--chat-bg)] 
            border-[var(--chat-border)]
            shadow-xl shadow-emerald-500/5
            p-4 md:p-5
            transition-colors
          "
        >
          {/* HEADER */}
          <header
            className="
              flex items-start justify-between gap-3 
              border-b 
              pb-3
              border-[var(--chat-border)]
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-9 w-9 items-center justify-center rounded-full 
                  bg-slate-900/5
                "
              >
                <img
                  src="/logo.png"
                  alt="Quantivo logo"
                  className="h-7 w-7 rounded-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm font-semibold md:text-base text-[var(--fg)]">
                  Quantivo Chat
                </h1>
                <p className="text-[11px] text-[var(--fg-muted)]">
                  Ask questions about finance and investing. Educational
                  answers only.
                </p>
              </div>
            </div>
          </header>

          {/* CHAT MESSAGES */}
          <main
            ref={scrollRef}
            className="
              flex-1 space-y-3 overflow-y-auto rounded-2xl 
              p-3
              bg-[var(--chat-inner-bg)]
              transition-colors
            "
          >
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div
                      className="
                        mt-1 flex h-7 w-7 items-center justify-center rounded-full
                        bg-[var(--assistant-avatar-bg)]
                      "
                    >
                      <img
                        src="/logo.png"
                        alt="Quantivo logo"
                        className="h-5 w-5 rounded-full object-contain"
                      />
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-3 py-2 text-xs md:text-sm
                      ${
                        isUser
                          ? "rounded-br-sm bg-[var(--user-bubble-bg)] text-[var(--user-bubble-fg)]"
                          : "rounded-bl-sm bg-[var(--assistant-bubble-bg)] border border-[var(--assistant-bubble-border)] text-[var(--assistant-bubble-fg)]"
                      }
                    `}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(m.content),
                    }}
                  />

                  {isUser && (
                    <div
                      className="
                        mt-1 flex h-7 w-7 items-center justify-center rounded-full 
                        bg-[var(--user-avatar-bg)] 
                        text-[11px] text-[var(--user-avatar-fg)]
                      "
                    >
                      You
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2">
                <div
                  className="
                    mt-1 flex h-7 w-7 items-center justify-center rounded-full 
                    bg-[var(--assistant-avatar-bg)]
                  "
                >
                  <img
                    src="/logo.png"
                    alt="Quantivo logo"
                    className="h-5 w-5 rounded-full object-contain"
                  />
                </div>
                <div
                  className="
                    rounded-2xl rounded-bl-sm border px-3 py-2 text-[11px]
                    bg-[var(--assistant-bubble-bg)]
                    border-[var(--assistant-bubble-border)]
                    text-[var(--assistant-bubble-fg)]
                  "
                >
                  Thinking about your question…
                </div>
              </div>
            )}
          </main>

          {/* INPUT */}
          <form
            onSubmit={handleSend}
            className="
              mt-1 flex items-end gap-2 rounded-2xl 
              border px-3 py-2
              bg-[var(--input-bg)]
              border-[var(--chat-border)]
              transition-colors
            "
          >
            <textarea
              className="
                max-h-32 min-h-[40px] flex-1 resize-none bg-transparent 
                text-xs md:text-sm
                text-[var(--fg)]
                placeholder:text-[var(--fg-muted)]
                outline-none
              "
              placeholder="Ask me about investing, risk, ETFs, strategies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="
                inline-flex items-center justify-center rounded-2xl 
                px-3 py-2 text-xs md:text-sm font-semibold
                bg-[var(--send-btn-bg)]
                text-[var(--send-btn-fg)]
                hover:bg-[var(--send-btn-hover)]
                disabled:opacity-40
                transition
              "
            >
              {loading ? "…" : "Send"}
            </button>
          </form>

          {/* DISCLAIMER */}
          <p className="pt-1 text-[10px] text-[var(--fg-muted)]">
            Quantivo Chat provides educational information only and not advice on single stocks or financial products. Always do your own research before investing.
          </p>
        </div>
      </section>
    </AuthGuard>
  );
}
