import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User, Flame, Coins, Zap, LogOut, Shield, Target, LayoutDashboard, Wallet, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Layout() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(u => {
    setUser(u);
    // Sync profile with Supabase on every load (mirrors signIn event in auth flow)
    base44.functions.invoke('syncUserProfile', {})
      .then(r => setProfile(r?.data?.profile || null))
      .catch(() => {
        // Fallback to read-only fetch if sync fails
        base44.functions.invoke('getUserProfile', {}).then(r => setProfile(r?.data?.profile || null)).catch(() => {});
      });
    }).catch(() => {});
  }, []);

  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    if (!user) return;
    base44.entities.UserStats.filter({ user_id: user.id }).then(r => r[0] && setStats(r[0]));
    base44.functions.invoke('getWallet', {}).then(r => setWalletBalance(r?.data?.balance ?? 0)).catch(() => {});
  }, [user]);

  const xpForLevel = (level) => level * 200;
  const xpProgress = stats ? ((stats.total_xp % xpForLevel(stats.current_level)) / xpForLevel(stats.current_level)) * 100 : 0;

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/money', icon: Wallet, label: 'Money' },
    { to: '/basecamp', icon: ShoppingBag, label: 'Basecamp' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar - desktop, kept white as a deliberate contrast point against the black app body */}
      <aside className="hidden md:flex flex-col w-64 border-r border-black/10 bg-white fixed h-full z-40">
        <div className="p-6 border-b border-black/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2EFD7A] flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-display font-bold text-black">Baseline</span>
          </div>
        </div>

        {/* XP Bar */}
        {stats && (
          <div className="px-5 py-4 border-b border-black/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-black/50">Level {stats.current_level}</span>
              <span className="text-xs font-semibold text-black flex items-center gap-1"><Coins className="w-3 h-3 text-[#1BAE5C]" />{walletBalance !== null ? walletBalance : '---'} Base Coins</span>
            </div>
            <div className="h-2 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2EFD7A] transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-black">{stats.current_streak}</span>
                <span className="text-xs text-black/50">streak</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#2EFD7A]/15 text-black border border-[#2EFD7A]/40'
                    : 'text-black/50 hover:text-black hover:bg-black/5'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                    : 'text-black/50 hover:text-black hover:bg-black/5'
                }`
              }
            >
              <Shield className="w-5 h-5" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-black/10">
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2EFD7A]/20 flex items-center justify-center text-black font-bold text-sm">
                {profile?.first_name?.[0] || user.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">
                  {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.full_name}
                </p>
                <p className="text-xs text-black/40 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => base44.auth.logout('/')}
                className="text-black/40 hover:text-black transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 flex z-50">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-[#1BAE5C]' : 'text-black/40'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-amber-600' : 'text-black/40'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            Admin
          </NavLink>
        )}
        <button
          onClick={() => base44.auth.logout('/')}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-black/40 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </nav>
    </div>
  );
}