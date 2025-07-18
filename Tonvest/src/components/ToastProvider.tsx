import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  message: string;
  type: 'success' | 'error';
  id: number;
}

const ToastContext = createContext<(msg: string, type?: 'success' | 'error') => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { message, type, id }]);
    setTimeout(() => {
      setToasts(ts => ts.filter(t => t.id !== id));
    }, 3000);
  }, []);
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 70, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              minWidth: 200,
              maxWidth: 400,
              margin: '8px 0',
              background: t.type === 'success' ? 'linear-gradient(90deg, #232e3c 60%, #3a7afe 100%)' : '#ec3942',
              color: '#fff',
              borderRadius: 16,
              padding: '14px 28px',
              fontWeight: 600,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              pointerEvents: 'auto',
              textAlign: 'center',
              letterSpacing: 0.1,
              border: t.type === 'error' ? '2px solid #ffb3b3' : 'none',
              opacity: 0.98,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
} 