import { useEffect, useState } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { List, Placeholder, Title, Section } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';

export function ProfilePage() {
  const wallet = useTonWallet();
  const [history, setHistory] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet?.account?.address) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`http://localhost:4000/history`, {
        headers: { 'x-wallet-address': wallet.account.address }
      }).then(r => r.json()),
      fetch(`http://localhost:4000/rewards`, {
        headers: { 'x-wallet-address': wallet.account.address }
      }).then(r => r.json())
    ]).then(([hist, rew]) => {
      setHistory(hist.history || []);
      setRewards(rew.rewards || []);
      setLoading(false);
    }).catch(e => {
      setError('Failed to fetch profile data.');
      setLoading(false);
    });
  }, [wallet?.account?.address]);

  if (!wallet) {
    return <Page><Placeholder header="Profile" description="Connect your wallet to view your profile." /></Page>;
  }
  if (loading) {
    return <Page><Placeholder header="Profile" description="Loading..." /></Page>;
  }
  if (error) {
    return <Page><Placeholder header="Profile" description={error} /></Page>;
  }

  return (
    <Page>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <Title level="2" style={{ color: '#f5f5f5', marginBottom: 24 }}>Profile</Title>
        <Section header="History">
          {history.length === 0 ? (
            <Placeholder description="No history yet." />
          ) : (
            <List>
              {history.map((item, i) => (
                <DisplayData
                  key={i}
                  header={item.strategy?.title || 'Strategy'}
                  rows={[
                    { title: 'Description', value: item.strategy?.description },
                    { title: 'APY', value: item.strategy?.apy },
                    { title: 'TVL', value: item.strategy?.tvl },
                    { title: 'Timestamp', value: new Date(item.timestamp).toLocaleString() },
                  ]}
                />
              ))}
            </List>
          )}
        </Section>
        <Section header="Rewards" style={{ marginTop: 32 }}>
          {rewards.length === 0 ? (
            <Placeholder description="No rewards yet." />
          ) : (
            <List>
              {rewards.map((item, i) => (
                <DisplayData
                  key={i}
                  header={item.type === 'star' ? '⭐ Reward' : item.type}
                  rows={[
                    { title: 'Detail', value: item.detail },
                    { title: 'Timestamp', value: new Date(item.timestamp).toLocaleString() },
                  ]}
                />
              ))}
            </List>
          )}
        </Section>
      </div>
    </Page>
  );
} 