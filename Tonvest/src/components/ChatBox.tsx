import { useState, forwardRef } from "react";

const AttachIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3 3 0 014.24 4.24l-9.2 9.19a1 1 0 01-1.41-1.41l8.49-8.49"/></svg>
);
const MicIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
);
const SendIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5f5f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
);

export const ChatBox = forwardRef<HTMLFormElement, {
  onSend: (msg: string) => void,
  loading: boolean,
  suggestions?: string[],
  onSuggestionClick?: (s: string) => void,
  setInput?: (s: string) => void,
}>(({ onSend, loading, suggestions = [], onSuggestionClick, setInput }, ref) => {
  const [input, _setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      _setInput("");
      if (setInput) setInput("");
    }
  };

  const handleSuggestion = (s: string) => {
    _setInput(s);
    if (setInput) setInput("");
    if (onSuggestionClick) onSuggestionClick(s);
    onSend(s);
  };

  return (
    <form
      ref={ref}
      onSubmit={handleSend}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 32,
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        background: "linear-gradient(to top, var(--tg-theme-bg-color, #181A20) 90%, transparent)",
        padding: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          width: "100%",
          maxWidth: 600,
          background: "var(--tg-theme-secondary-bg-color, #232e3c)",
          borderRadius: 36,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          border: "1.5px solid #232e3c",
          padding: '18px 24px 18px 24px',
        }}
      >
        {suggestions.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            padding: '12px 0 0 0',
            margin: '0 0 2px 0',
            alignItems: 'center',
          }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestion(s)}
                style={{
                  background: '#232e3c',
                  color: '#f5f5f5',
                  border: 'none',
                  borderRadius: 18,
                  padding: '10px 18px',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s',
                  outline: 'none',
                  marginBottom: 0,
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#353945')}
                onMouseOut={e => (e.currentTarget.style.background = '#232e3c')}
              >{s}</button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 16 }}>
          {/* Attach icon */}
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
            tabIndex={-1}
          >
            <AttachIcon />
          </button>
          {/* Input */}
          <input
            value={input}
            onChange={e => _setInput(e.target.value)}
            placeholder="Ask TONVest anything about DeFi..."
            disabled={loading}
            style={{
              width: "100%",
              minWidth: 0,
              resize: "none",
              minHeight: 48,
              maxHeight: 120,
              borderRadius: 24,
              background: "transparent",
              color: "var(--tg-theme-text-color, #f5f5f5)",
              border: "none",
              fontSize: 19,
              outline: "none",
              boxShadow: "none",
              padding: "14px 0 14px 0",
              textAlign: "left",
              fontWeight: 500,
              letterSpacing: 0.1,
            }}
          />
          {/* Mic icon */}
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
            tabIndex={-1}
          >
            <MicIcon />
          </button>
          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              border: "none",
              background: loading ? "#232e3c" : "#232e3c",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 6,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              flexShrink: 0,
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </form>
  );
}); 