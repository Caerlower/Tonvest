import { useMemo } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { retrieveLaunchParams, useSignal, isMiniAppDark } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { routes } from '@/navigation/routes.tsx';
import { ToastProvider } from '@/components/ToastProvider';
import { User, CreditCard, Home, BarChart2 } from 'react-feather';

export function App() {
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const isDark = useSignal(isMiniAppDark);
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    { label: 'Home', path: '/', icon: <Home size={22} /> },
    { label: 'Protocols', path: '/protocols', icon: <BarChart2 size={22} /> },
    { label: 'Profile', path: '/profile', icon: <User size={22} /> },
    { label: 'Wallet', path: '/ton-connect', icon: <CreditCard size={22} /> },
  ];

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
          <ToastProvider>
          <Routes>
            {routes.map((route) => <Route key={route.path} {...route} />)}
            <Route path="*" element={<Navigate to="/"/>}/>
          </Routes>
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100, background: 'var(--tg-theme-secondary-bg-color, #232e3c)', display: 'flex', justifyContent: 'space-around', borderTop: '1.5px solid #353945', height: 60 }}>
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: location.pathname.startsWith(item.path) ? '#8ee4af' : '#b0b8c1',
                  fontWeight: location.pathname.startsWith(item.path) ? 700 : 500,
                  fontSize: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'color 0.2s',
                  height: '100%',
                }}
              >
                {item.icon}
                <span style={{ marginTop: 2 }}>{item.label}</span>
              </button>
            ))}
          </div>
         </ToastProvider>
    </AppRoot>
  );
}
