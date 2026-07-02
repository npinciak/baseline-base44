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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card fixed h-full z-40">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">Baseline</span>
          </div>
        </div>

        {/* XP Bar */}
        {stats && (
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Level {stats.current_level}</span>
              <span className="text-xs font-semibold text-primary flex items-center gap-1"><Coins className="w-3 h-3" />{walletBalance !== null ? walletBalance : '---'} Base Coins</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full xp-shimmer transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-foreground">{stats.current_streak}</span>
                <span className="text-xs text-muted-foreground">streak</span>
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
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
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
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <Shield className="w-5 h-5" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {profile?.first_name?.[0] || user.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.full_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={() => base44.auth.logout('/')}
                className="text-muted-foreground hover:text-foreground transition-colors"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-50">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
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
                isActive ? 'text-amber-400' : 'text-muted-foreground'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            Admin
          </NavLink>
        )}
        <button
          onClick={() => base44.auth.logout('/')}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </nav>
    </div>
  );
}