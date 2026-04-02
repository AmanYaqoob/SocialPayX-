import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { MessageCircle, Send, X, Users, ChevronDown, AlertCircle } from "lucide-react";
import { AuthContext } from "../App.jsx";
import apiService from "../services/api.js";

const POLL_INTERVAL = 3000;      // poll for new messages every 3s
const HEARTBEAT_INTERVAL = 20000; // heartbeat every 20s
const MAX_VISIBLE = 80;           // keep at most 80 messages in DOM

export default function GroupChat() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [onlineCount, setOnlineCount] = useState(1);
  const [unread, setUnread] = useState(0);
  const [atBottom, setAtBottom] = useState(true);

  const messagesEndRef = useRef(null);
  const listRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const pollTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Check if scrolled near bottom
  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAtBottom(nearBottom);
    if (nearBottom) setUnread(0);
  };

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiService.request("/chat/messages?limit=50");
      setMessages(data.messages || []);
      if (data.messages?.length) {
        lastTimestampRef.current = new Date(
          data.messages[data.messages.length - 1].createdAt
        ).getTime();
      }
      setTimeout(scrollToBottom, 100);
    } catch (_) {}
  }, [isAuthenticated, scrollToBottom]);

  // Poll for new messages
  const pollMessages = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const since = lastTimestampRef.current
        ? `&since=${lastTimestampRef.current}`
        : "";
      const data = await apiService.request(`/chat/messages?limit=30${since}`);
      const newMsgs = data.messages || [];
      if (newMsgs.length === 0) return;

      // Update last timestamp
      lastTimestampRef.current = new Date(
        newMsgs[newMsgs.length - 1].createdAt
      ).getTime();

      setMessages(prev => {
        const combined = [...prev, ...newMsgs].slice(-MAX_VISIBLE);
        return combined;
      });

      if (!isOpenRef.current || !atBottom) {
        setUnread(n => n + newMsgs.length);
      }

      if (isOpenRef.current && atBottom) {
        setTimeout(scrollToBottom, 50);
      }
    } catch (_) {}
  }, [isAuthenticated, atBottom, scrollToBottom]);

  // Heartbeat for online count
  const sendHeartbeat = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiService.request("/chat/heartbeat", { method: "POST" });
      setOnlineCount(data.onlineCount || 1);
    } catch (_) {}
  }, [isAuthenticated]);

  // Start/stop polling based on auth
  useEffect(() => {
    if (!isAuthenticated) return;
    loadMessages();
    sendHeartbeat();

    pollTimerRef.current = setInterval(pollMessages, POLL_INTERVAL);
    heartbeatTimerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(pollTimerRef.current);
      clearInterval(heartbeatTimerRef.current);
    };
  }, [isAuthenticated, loadMessages, pollMessages, sendHeartbeat]);

  // Scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, scrollToBottom]);

  // Auto-scroll when new messages arrive and user is at bottom
  useEffect(() => {
    if (atBottom && isOpen) scrollToBottom();
  }, [messages, atBottom, isOpen, scrollToBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);
    setError("");

    try {
      const data = await apiService.request("/chat/send", {
        method: "POST",
        body: { message: text },
      });

      // Optimistically add own message
      setMessages(prev => {
        const updated = [...prev, data.message].slice(-MAX_VISIBLE);
        return updated;
      });
      lastTimestampRef.current = new Date(data.message.createdAt).getTime();
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setError(err.message || "Failed to send");
      setInput(text); // restore input on failure
      setTimeout(() => setError(""), 4000);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!isAuthenticated) return null;

  const currentUserId = user?.id;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full btn-gradient shadow-lg flex items-center justify-center btn-glow transition-all hover:scale-110"
        aria-label="Open group chat"
      >
        <MessageCircle className="w-5 h-5 text-foreground" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] h-[480px] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-secondary/20 to-primary/20 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground text-sm">Community Chat</span>
              <span className="text-xs text-muted-foreground">(24h)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <Users className="w-3 h-3" />
                <span>{onlineCount}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scroll-smooth"
          >
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-8">
                No messages yet. Say hello! 👋
              </div>
            )}
            {messages.map((msg, i) => {
              const isOwn = msg.userId === currentUserId ||
                msg.userId?.toString() === currentUserId?.toString();
              const showName =
                i === 0 || messages[i - 1]?.userId?.toString() !== msg.userId?.toString();
              const time = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg._id || `${msg.userId}-${i}`}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  {showName && (
                    <span className={`text-[10px] font-semibold mb-0.5 px-1 ${
                      isOwn ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {isOwn ? "You" : msg.username}
                    </span>
                  )}
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-snug break-words ${
                    isOwn
                      ? "bg-primary/20 text-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    {msg.message}
                    <span className="block text-[9px] text-muted-foreground/70 mt-0.5 text-right">
                      {time}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {!atBottom && (
            <button
              onClick={() => { scrollToBottom(); setUnread(0); }}
              className="absolute bottom-[72px] right-4 w-7 h-7 bg-primary/80 rounded-full flex items-center justify-center shadow text-foreground hover:bg-primary transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="px-3 pb-1 flex items-center gap-1 text-destructive text-xs">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-3 py-2 border-t border-border bg-background flex-shrink-0"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              maxLength={300}
              disabled={sending}
              className="flex-1 px-3 py-2 bg-input border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none input-glow disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-9 h-9 flex items-center justify-center btn-gradient rounded-xl disabled:opacity-40 transition-all hover:scale-105 flex-shrink-0"
            >
              {sending ? (
                <div className="w-3.5 h-3.5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-foreground" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
