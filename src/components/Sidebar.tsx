import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Leaf, LayoutDashboard, Package, Calendar, TrendingUp,
  BookHeart, Target, Flag, ScanLine, Settings, LogOut
} from 'lucide-react'

const navItems = [
  { label: 'Home Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Product Inventory', icon: Package, to: '/inventory' },
  { label: 'Routine Scheduler', icon: Calendar, to: '/routines' },
  { label: 'Progression Tracker', icon: TrendingUp, to: '/actives' },
  { label: 'Reaction Log', icon: BookHeart, to: '/reactions' },
  { label: 'Project Pan', icon: Target, to: '/project-pan' },
  { label: 'Milestones', icon: Flag, to: '/milestones' },
  { label: 'Skin Analysis Log', icon: ScanLine, to: '/skin-analysis' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="w-64 bg-white border-r border-border-soft h-screen flex flex-col shrink-0 hidden md:flex">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-border-soft">
        <Leaf className="text-sage w-5 h-5" />
        <span className="text-ink font-bold text-lg tracking-tight font-serif">Slow Glow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-sage/10 text-ink'
                  : 'text-ink/50 hover:bg-paper hover:text-ink'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-sage' : ''}`} />
              {label}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-border-soft/60 space-y-1">
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/settings'
                ? 'bg-sage/10 text-ink'
                : 'text-ink/50 hover:bg-paper hover:text-ink'
            }`}
          >
            <Settings className={`w-4 h-4 shrink-0 ${pathname === '/settings' ? 'text-sage' : ''}`} />
            Settings
          </Link>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink/50 hover:bg-paper hover:text-ink transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Log out
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border-soft">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center text-sage text-sm font-semibold">
            J
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Jane Doe</p>
            <p className="text-xs text-ink/50">Combination Skin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
