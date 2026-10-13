import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  LayoutDashboard,
  PlusCircle,
  FileText,
  Briefcase,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analyze', label: 'New Analysis', icon: PlusCircle },
  { path: '/jobs', label: 'Job Discovery', icon: Briefcase },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch {
      toast.error('Failed to log out.');
    }
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-160 border ${
      isActive
        ? 'bg-[#F2EDFC] text-[#49316F] border-[#DDD0FF] font-semibold shadow-xs shadow-[#6845C5]/5'
        : 'text-[#716B85] hover:text-[#26213A] hover:bg-[#F1EDF9] border-transparent font-medium'
    }`;

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[#E7E1F1]">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9C83EC] rounded-xl p-1"
          onClick={onClose}
        >
          <div className="w-8 h-8 rounded-xl bg-[#6845C5] text-white flex items-center justify-center shadow-sm shadow-[#6845C5]/20 group-hover:bg-[#5736AE] transition-colors">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#26213A]">Career Copilot</span>
            <span className="text-[11px] text-[#716B85]">AI Career Platform</span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-[#716B85] hover:text-[#26213A] p-1.5 rounded-lg hover:bg-[#F2EDFC] transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
        <div className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wider uppercase text-[#918BA2]">
          Platform
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={linkClass}
            onClick={onClose}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section & Footer */}
      <div className="p-3.5 border-t border-[#E7E1F1] bg-white">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F2EDFC] border border-transparent hover:border-[#DDD0FF] transition-colors group mb-2"
        >
          <div className="w-8 h-8 rounded-full bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center text-xs font-bold text-[#49316F]">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#26213A] truncate">{user?.name || 'User'}</div>
            <div className="text-[11px] text-[#716B85] truncate">{user?.email || ''}</div>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#716B85] hover:text-[#B83A52] hover:bg-[#FDF0F3] transition-colors w-full border border-transparent hover:border-[#F2BDC9] cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#26213A] flex">
      {/* Desktop Persistent Sidebar */}
      <aside
        className="hidden lg:flex w-64 border-r border-[#E7E1F1] bg-white flex-col fixed inset-y-0 left-0 z-30 shadow-sm shadow-[#49316F]/4"
        aria-label="Sidebar navigation"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#26213A]/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-[#E7E1F1] z-50 lg:hidden shadow-2xl"
              aria-label="Mobile navigation"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-[#F8F7FC]">
        {/* Mobile App Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-[#E7E1F1] bg-white/90 backdrop-blur-md sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[#716B85] hover:text-[#26213A] p-1.5 rounded-lg border border-transparent hover:border-[#E7E1F1]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#6845C5]" />
            <span className="text-sm font-bold tracking-tight text-[#26213A]">Career Copilot</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
