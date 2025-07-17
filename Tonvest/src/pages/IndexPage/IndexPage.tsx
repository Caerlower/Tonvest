import { useEffect, useRef, useState } from 'react';
import { Title, Textarea, Button, Card } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { Page } from '@/components/Page.tsx';
import { ChatBox } from '@/components/ChatBox';

// SVG icons
const PaperPlaneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
);
const AttachIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3 3 0 014.24 4.24l-9.2 9.19a1 1 0 01-1.41-1.41l8.49-8.49"/></svg>
);
const MicIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
);

const SUGGESTIONS = [
  'Show top DeFi strategies',
  'What is the best APY on TON?',
  'How do I stake my TON?',
  'Show me safe yield options',
  'Explain SBT rewards',
];

export const IndexPage = () => {
  const wallet = useTonWallet();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLFormElement>(null);
  const [chatBoxHeight, setChatBoxHeight] = useState(180);
  const [greeting, setGreeting] = useState('Hello, DeFi Explorer!');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, strategies]);
  useEffect(() => {
    if (chatBoxRef.current) {
      setChatBoxHeight(chatBoxRef.current.offsetHeight + 32); // add extra for spacing
    }
  }, []);

  const handleSend = async (msg?: string) => {
    const messageToSend = (typeof msg === 'string' ? msg : input).trim();
    if (!messageToSend) return;
    setMessages([...messages, { role: 'user', text: messageToSend }]);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageToSend })
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { role: 'ai', text: data.answer }]);
      setStrategies(data.strategies || []);
    } catch (e) {
      setMessages(msgs => [...msgs, { role: 'ai', text: 'Error fetching strategies from backend.' }]);
      setStrategies([]);
    }
    setLoading(false);
    setInput('');
  };

  const handleExecute = (strategyTitle: string) => {
    alert(`Executing: ${strategyTitle} (stub)`);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <Page back={false}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--tg-theme-bg-color, #181A20)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0 24px' }}>
          <Title level="1" style={{ margin: 0, fontWeight: 600, fontSize: 24, color: '#f5f5f5', letterSpacing: 0.5 }}>TONVest</Title>
          <div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)', borderRadius: 20, overflow: 'hidden' }}>
            <TonConnectButton style={{ background: '#232e3c', color: '#8ee4af', borderRadius: 20, fontWeight: 500, fontSize: 16, padding: '8px 18px', border: 'none' }} />
          </div>
        </div>
        {/* Chat area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: `0 0 ${chatBoxHeight}px 0`, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: messages.length === 0 ? 'center' : 'flex-start', position: 'relative' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '-10vh' }}>
              <div style={{ fontSize: 32, fontWeight: 600, color: '#8ee4af', marginBottom: 12 }}>{greeting}</div>
              <div style={{ color: '#b0b8c1', fontSize: 18, marginBottom: 32 }}>Ask anything about DeFi on TON!</div>
            </div>
          )}
          {/* Chat messages */}
          <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: msg.role === 'user' ? 'linear-gradient(90deg, #232e3c 60%, #3a7afe 100%)' : '#232e3c',
                color: msg.role === 'user' ? '#fff' : '#f5f5f5',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '14px 20px',
                fontSize: 17,
                fontWeight: 500,
                marginBottom: 2,
                whiteSpace: 'pre-line',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                textAlign: msg.role === 'user' ? 'right' : 'left',
                marginLeft: msg.role === 'user' ? '20%' : 0,
                marginRight: msg.role === 'user' ? 0 : '20%',
              }}>
                {msg.text}
              </div>
            ))}
            {/* Show strategies as cards after AI reply */}
            {strategies.length > 0 && (
              <div style={{ marginTop: 16, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {strategies.map((strategy, i) => (
                  <Card key={i} style={{ background: '#232e3c', color: '#f5f5f5', border: '1.5px solid #353945', borderRadius: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{strategy.title}</span>
                      <span style={{ color: '#b0b8c1', fontSize: 15 }}>{strategy.description}</span>
                      <span style={{ fontSize: 14, marginTop: 4, color: '#b0b8c1' }}>APY: <b style={{ color: '#fff' }}>{strategy.apy}</b> | TVL: <b style={{ color: '#fff' }}>{strategy.tvl}</b></span>
                      <button
                        style={{
                          marginTop: 12,
                          alignSelf: 'flex-end',
                          background: '#3a7afe',
                          color: '#fff',
                          borderRadius: 12,
                          fontWeight: 600,
                          border: 'none',
                          padding: '8px 22px',
                          fontSize: 16,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = '#2563eb')}
                        onMouseOut={e => (e.currentTarget.style.background = '#3a7afe')}
                        onClick={() => handleExecute(strategy.title)}
                      >
                        Execute
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        <ChatBox ref={chatBoxRef} onSend={handleSend} loading={loading} suggestions={SUGGESTIONS} setInput={setInput} />
      </div>
    </Page>
  );
};
