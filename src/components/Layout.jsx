import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User, Flame, Coins, LogOut, Shield, Target, LayoutDashboard, Wallet, ShoppingBag } from 'lucide-react';
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
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home', iconColor: 'text-[#2EA0FD]' },
    { to: '/money', icon: Wallet, label: 'Money', iconColor: 'text-[#2EFD7A]' },
    { to: '/basecamp', icon: ShoppingBag, label: 'Basecamp', iconColor: 'text-[#2EA0FD]' },
    { to: '/goals', icon: Target, label: 'Goals', iconColor: 'text-[#2EFD7A]' },
    { to: '/profile', icon: User, label: 'Profile', iconColor: 'text-[#2EA0FD]' },
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar - desktop, dark translucent glass to blend with the black dashboard */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/60 backdrop-blur-xl fixed h-full z-40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/156742c3c_2c64e420d_b567a13c189ab17b1195db0aba380e0ba8854e8c.png"
              alt="Baseline"
              className="w-9 h-9 object-contain"
            />
            <span className="text-xl font-display font-bold text-white">Baseline</span>
          </div>
        </div>

        {/* XP Bar */}
        {stats && (
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#2BF9E9]">Level {stats.current_level}</span>
              <span className="text-xs font-semibold text-white flex items-center gap-1"><Coins className="w-3 h-3 text-[#2EA0FD]" />{walletBalance !== null ? walletBalance : '---'} Base Coins</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2EFD7A] to-[#2EA0FD] shadow-[0_0_8px_rgba(46,160,253,0.6)] transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-white/70" />
                <span className="text-sm font-semibold text-white">{stats.current_streak}</span>
                <span className="text-xs text-white/60">day streak</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, iconColor }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? 'bg-white/10 text-white border-white/50 shadow-[0_0_16px_rgba(255,255,255,0.15)]'
                    : 'text-white/70 border-transparent hover:text-white hover:bg-white/5 hover:translate-x-1'
                }`
              }
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-6 ${iconColor}`} />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Shield className="w-5 h-5" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2EA0FD]/15 border border-[#2EA0FD]/40 flex items-center justify-center text-[#2EA0FD] font-bold text-sm">
                {profile?.first_name?.[0] || user.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.full_name}
                </p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => base44.auth.logout('/')}
                className="text-white/40 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 bg-black">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-xl border-t border-white/10 flex z-50">
        {navItems.map(({ to, icon: Icon, label, iconColor }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-white' : 'text-white/60'
              }`
            }
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
            {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-amber-400' : 'text-white/40'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            Admin
          </NavLink>
        )}
        <button
          onClick={() => base44.auth.logout('/')}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-white/40 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </nav>
    </div>
  );
}