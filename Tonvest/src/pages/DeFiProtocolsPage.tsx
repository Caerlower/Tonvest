import { useEffect, useState } from 'react';
import { List, Placeholder, Title, Section } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';

export function DeFiProtocolsPage() {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:4000/defi-data')
      .then(r => r.json())
      .then(data => {
        setProtocols(data.protocols || []);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to fetch DeFi protocol data.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Page><Placeholder header="DeFi Protocols" description="Loading..." /></Page>;
  }
  if (error) {
    return <Page><Placeholder header="DeFi Protocols" description={error} /></Page>;
  }

  return (
    <Page>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <Title level="2" style={{ color: '#f5f5f5', marginBottom: 24 }}>DeFi Protocols</Title>
        <Section>
          {protocols.length === 0 ? (
            <Placeholder description="No protocol data available." />
          ) : (
            <List>
              {protocols.map((p, i) => (
                <DisplayData
                  key={i}
                  header={p.name}
                  rows={[
                    { title: 'APY', value: p.apy },
                    { title: 'TVL', value: p.tvl },
                    { title: 'Pools', value: p.pools },
                    { title: 'URL', type: 'link', value: p.url },
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