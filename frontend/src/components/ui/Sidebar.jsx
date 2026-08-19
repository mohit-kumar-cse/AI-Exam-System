// src/components/ui/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, FileText, BarChart3, User,
  ChevronLeft, ChevronRight, ClipboardList,
  PlusCircle, Upload, Activity, Users,
  ShieldCheck, FileSearch, LogOut, Menu, X,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  exams:     FileText,
  results:   BarChart3,
  profile:   User,
  manage:    ClipboardList,
  create:    PlusCircle,
  upload:    Upload,
  monitor:   Activity,
  users:     Users,
  assign:    ShieldCheck,
  logs:      FileSearch,
  questions: FileText,
};

export default function Sidebar({ title, links }) {
  const [collapsed, setCollapsed]         = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isRootPath = (item) =>
    links.some((l) => l.path !== item.path && l.path.startsWith(item.path + "/"));

  // ── MOBILE: slide-over drawer ──────────────────────────────────────────────
  const MobileDrawer = () => (
    <>
      {/* Hamburger trigger — shown only on mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-white backdrop-blur-md shadow-lg touch-manipulation"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72
          bg-gradient-to-b from-[#020617] to-[#0f172a]
          border-r border-white/10
          flex flex-col px-3 py-6
          transition-transform duration-300 ease-in-out
          md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 hover:text-white transition p-1 touch-manipulation"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={isRootPath(item)}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200 touch-manipulation
                  ${isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10"
                  }
                `}
              >
                {Icon && <Icon size={20} className="shrink-0" />}
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 touch-manipulation"
          >
            <LogOut size={20} className="shrink-0" />
            <span>Logout</span>
          </button>
          <p className="text-xs text-center text-gray-600 mt-3">AI Exam System</p>
        </div>
      </aside>
    </>
  );

   
  return (
    <>
      {/* Mobile drawer */}
      <MobileDrawer />

      {/* Desktop sidebar */}
      <aside className={`
        hidden md:flex
        ${collapsed ? "w-20" : "w-64"}
        min-h-screen px-3 py-6
        bg-gradient-to-b from-[#020617] to-[#0f172a]
        border-r border-white/10
        flex-col
        transition-all duration-300
        shrink-0
      `}>
        {/* Title + collapse */}
        <div className="flex items-center justify-between mb-8 px-2">
          {!collapsed && (
            <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {links.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={isRootPath(item)}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                {Icon && <Icon size={20} className="shrink-0" />}
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl
              text-gray-400 hover:text-red-400 hover:bg-red-500/10
              transition-all duration-200
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          {!collapsed && (
            <p className="text-xs text-center text-gray-600 mt-3">AI Exam System</p>
          )}
        </div>
      </aside>
    </>
  );
}