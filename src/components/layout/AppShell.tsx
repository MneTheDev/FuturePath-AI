import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Bell, LayoutDashboard, Briefcase, FileText, GraduationCap, CheckCircle, Bot } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/hooks/useAuthStore'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { path: '/',       label: 'Home',      Icon: LayoutDashboard },
  { path: '/jobs',   label: 'Jobs',      Icon: Briefcase },
  { path: '/cv',     label: 'Build CV',  Icon: FileText },
  { path: '/learn',  label: 'Learn',     Icon: GraduationCap },
  { path: '/ai',     label: 'AI Copilot',Icon: Bot },
  { path: '/verify', label: 'Verify',    Icon: CheckCircle },
]

export function AppShell() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [showNotifs, setShowNotifs] = useState(false)
  const unreadCount = 2

  return (
    <div className="app-shell">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-[--outline-v] px-4 py-2.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          {/* Clicking the avatar opens the Profile page */}
          <UserAvatar
            avatarUrl={user?.avatar_url}
            fullName={user?.full_name}
            size={36}
            onClick={() => navigate('/profile')}
          />
          <span className="font-bold text-lg text-[--primary]">FuturePath</span>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[--surf-cont] text-[--primary]"
            >
              Admin
            </button>
          )}
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[--surf-cont] transition-colors"
            onClick={() => setShowNotifs(true)}
          >
            <Bell size={20} className="text-[--on-surf-v]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────── */}
      <main className="pb-20 overflow-y-auto min-h-[calc(100vh-120px)]">
        <Outlet />
      </main>

      {/* ── Bottom nav ─────────────────────────────────── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[--outline-v] flex z-50">
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 border-none bg-transparent cursor-pointer text-[10px] font-semibold font-sans transition-colors',
                active ? 'text-[--secondary]' : 'text-[--on-surf-v]'
              )}
            >
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center transition-colors', active && 'bg-[--sec-c]')}>
                <Icon size={17} />
              </div>
              {label}
            </button>
          )
        })}
        {/* Profile tab — shows the user's real avatar as the icon */}
        <button
          onClick={() => navigate('/profile')}
          className={clsx(
            'flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 border-none bg-transparent cursor-pointer text-[10px] font-semibold font-sans transition-colors',
            pathname === '/profile' ? 'text-[--secondary]' : 'text-[--on-surf-v]'
          )}
        >
          <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center transition-colors overflow-hidden', pathname === '/profile' && 'ring-2 ring-[--secondary]')}>
            <UserAvatar
              avatarUrl={user?.avatar_url}
              fullName={user?.full_name}
              size={28}
            />
          </div>
          Profile
        </button>
      </nav>

      {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
    </div>
  )
}
