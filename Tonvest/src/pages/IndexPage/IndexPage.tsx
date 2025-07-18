import { useEffect, useRef, useState } from 'react';
import { Title, Card } from '@telegram-apps/telegram-ui';
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Page } from '@/components/Page.tsx';
import { ChatBox } from '@/components/ChatBox';
import { useToast } from '../../components/ToastProvider';

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
  const [swarmResults, setSwarmResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLFormElement>(null);
  const [chatBoxHeight, setChatBoxHeight] = useState(180);
  const [greeting] = useState('Hello, DeFi Explorer!');
  const toast = useToast();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, swarmResults]);
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
    setSwarmResults(null);
    try {
      const res = await fetch('http://localhost:4000/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageToSend })
      });
      if (!res.ok) {
        const err = await res.json();
        toast('AI swarm error: ' + (err.error || 'Unknown error'), 'error');
        setMessages(msgs => [...msgs, { role: 'ai', text: 'Error fetching strategies from AI swarm.' }]);
        setSwarmResults(null);
        setLoading(false);
        setInput('');
        return;
      }
      const data = await res.json();
      if (data.agents) {
        setMessages(msgs => [...msgs, { role: 'ai', text: 'Here are the strategies from our DeFi swarm agents:' }]);
        setSwarmResults(data);
      } else {
        toast('AI swarm error: Invalid response', 'error');
        setMessages(msgs => [...msgs, { role: 'ai', text: 'Error fetching strategies from AI swarm.' }]);
        setSwarmResults(null);
      }
    } catch (e) {
      toast('Network or backend error: ' + (e instanceof Error ? e.message : String(e)), 'error');
      setMessages(msgs => [...msgs, { role: 'ai', text: 'Error fetching strategies from backend.' }]);
      setSwarmResults(null);
    }
    setLoading(false);
    setInput('');
  };

  const handleExecute = async (strategy: any) => {
    if (!wallet || !wallet.account?.address) {
      toast('Please connect your wallet to execute a strategy.', 'error');
      return;
    }
    try {
      const res = await fetch('http://localhost:4000/execute-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy, walletAddress: wallet.account.address })
      });
      const data = await res.json();
      if (res.ok) {
        toast('Strategy executed! (Demo) Reward granted.', 'success');
        // Optionally, fetch and update rewards/history here
      } else {
        toast('Failed to execute strategy: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (e) {
      toast('Failed to execute strategy: ' + (e instanceof Error ? e.message : String(e)), 'error');
    }
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
          {loading && (
            <div style={{ textAlign: 'center', margin: '32px 0', color: '#8ee4af', fontWeight: 600, fontSize: 18 }}>
              <span>AI swarm is thinking...</span>
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
            {/* Swarm agent answers */}
            {swarmResults && swarmResults.agents && (
              <div style={{ marginTop: 16, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {swarmResults.agents.map((agent: any, i: number) => (
                  <Card key={i} style={{ background: '#232e3c', color: '#f5f5f5', border: '1.5px solid #353945', borderRadius: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#8ee4af', marginBottom: 2 }}>{agent.agent}</span>
                      {agent.error ? (
                        <span style={{ color: '#ffb3b3', fontSize: 15 }}>{agent.error}</span>
                      ) : (
                        <>
                          <span style={{ color: '#b0b8c1', fontSize: 15 }}>{agent.answer}</span>
                          {agent.strategies && agent.strategies.map((s: any, j: number) => (
                            <div key={j} style={{ marginTop: 8, padding: 10, background: '#181A20', borderRadius: 10, border: '1px solid #353945' }}>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{s.title}</div>
                              <div style={{ color: '#b0b8c1', fontSize: 14 }}>{s.description}</div>
                              <div style={{ fontSize: 13, marginTop: 4, color: '#b0b8c1' }}>APY: <b style={{ color: '#fff' }}>{s.apy}</b> | TVL: <b style={{ color: '#fff' }}>{s.tvl}</b></div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </Card>
                ))}
                {/* Consensus strategy */}
                {swarmResults.consensus && (
                  <Card style={{ background: '#3a7afe', color: '#fff', border: '2px solid #8ee4af', borderRadius: 20, boxShadow: '0 4px 16px rgba(58,122,254,0.10)', padding: 24, marginTop: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Swarm Consensus</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{swarmResults.consensus.title}</div>
                    <div style={{ color: '#e0e0e0', fontSize: 15 }}>{swarmResults.consensus.description}</div>
                    <div style={{ fontSize: 14, marginTop: 4 }}>APY: <b style={{ color: '#fff' }}>{swarmResults.consensus.apy}</b> | TVL: <b style={{ color: '#fff' }}>{swarmResults.consensus.tvl}</b></div>
                  </Card>
                )}
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
