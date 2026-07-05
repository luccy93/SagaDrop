import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, BookOpen, ShoppingBag, BarChart3,
  Settings, Users, Tag, LogOut, ChevronRight,
} from "lucide-react";

const NAV = [
  { to: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
  { to: "/admin/books",     label: "Books",      icon: BookOpen },
  { to: "/admin/orders",    label: "Orders",     icon: ShoppingBag },
  { to: "/admin/analytics", label: "Analytics",  icon: BarChart3 },
  { to: "/admin/customers", label: "Customers",  icon: Users },
  { to: "/admin/coupons",   label: "Coupons",    icon: Tag },
  { to: "/admin/settings",  label: "Settings",   icon: Settings },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  // Redirect if not admin
  if (user === false) return <Navigate to="/login" replace />;
  if (user && user.role !== "admin") return <Navigate to="/" replace />;
  if (user === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] text-white flex flex-col flex-shrink-0 fixed top-0 left-0 bottom-0 z-40">
        <div className="px-6 py-7 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <BookOpen className="w-5 h-5 text-[#D90429]" strokeWidth={2.2} />
            <span className="font-display text-lg font-black tracking-tight text-white">
              SAGA<span className="text-[#D90429]">DROP</span>
            </span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1.5 ml-7">Admin</p>
        </div>

        <nav className="flex-1 py-6 px-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/admin" && pathname.startsWith(to));
            return (
              <Link
                key={to} to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium no-underline mb-1 transition-colors ${
                  active ? "bg-[#D90429] text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-6 border-t border-white/10">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-semibold text-white truncate">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm text-white/60 hover:text-[#D90429] transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-black/10 px-8 h-16 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm text-[#999]">
            <Link to="/admin" className="no-underline text-[#999] hover:text-[#0a0a0a]">Admin</Link>
            {pathname !== "/admin" && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#0a0a0a] capitalize">
                  {pathname.split("/").pop().replace(/-/g, " ")}
                </span>
              </>
            )}
          </div>
          <Link to="/" className="text-[11px] uppercase tracking-[0.16em] text-[#555] hover:text-[#D90429] no-underline transition-colors">
            ← Back to Store
          </Link>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
