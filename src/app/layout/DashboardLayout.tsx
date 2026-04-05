import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Bell, User, LayoutDashboard, Layers, Wallet, Shield, Settings, AlertCircle, LogOut, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useAppData } from '../store/AppContext';
import { AICoach } from '../pages/AICoach';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/' },
  { icon: AlertCircle,     label: 'Crisis Advisor', path: '/crisis', highlight: true },
  { icon: Layers,          label: 'Scenarios',    path: '/scenarios' },
  { icon: Wallet,          label: 'Spending',     path: '/spending' },
  { icon: Shield,          label: 'Insurance',    path: '/insurance' },
  { icon: Settings,        label: 'Settings',     path: '/settings' },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnboarded, resetData } = useAppData();
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!isOnboarded) navigate('/onboarding', { replace: true });
  }, [isOnboarded, navigate]);

  const handleReset = () => {
    resetData();
    navigate('/onboarding', { replace: true });
  };

  if (!isOnboarded) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Crunch</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40 flex flex-col">
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  isActive
                    ? item.highlight ? 'bg-red-50 text-red-600 font-medium' : 'bg-blue-50 text-blue-600 font-medium'
                    : item.highlight ? 'text-red-600 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="absolute right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Reset profile */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Reset Profile
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-8">
        <Outlet />
      </main>

      {/* Floating chat button */}
      <button
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#1C1A16',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        aria-label="Open AI Coach"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
        </svg>
      </button>

      {/* Chat modal */}
      {chatOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 101 }}
            onClick={() => setChatOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 92,
              right: 28,
              width: 400,
              height: 560,
              zIndex: 102,
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>AI Coach</span>
              <button
                onClick={() => setChatOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                aria-label="Close chat"
              >
                <X size={18} color="#6b7280" />
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <AICoach compact />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
