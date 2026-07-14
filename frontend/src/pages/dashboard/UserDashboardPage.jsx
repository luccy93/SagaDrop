import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, ShoppingBag, Heart, Star,
  Lock, CreditCard, MapPin, User, LogOut,
  Loader2, Menu, X, Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { fetchMyOrders, fetchBooks, fetchTrending } from "@/lib/api";
import { toast } from "sonner";

const SIDEBAR_ITEMS = [
  { icon: BookOpen, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Library", href: "#" },
  { icon: BookOpen, label: "Continue Reading", href: "#" },
  { icon: ShoppingBag, label: "Orders", href: "/my-orders" },
  { icon: Heart, label: "Wishlist", href: "#" },
  { icon: Star, label: "Reviews & Ratings", href: "#" },
  { icon: Star, label: "Rewards", href: "#" },
  { icon: Mail, label: "Notifications", href: "#" },
  { icon: CreditCard, label: "Payment Methods", href: "#" },
  { icon: MapPin, label: "Addresses", href: "#" },
  { icon: User, label: "Profile", href: "/account" },
  { icon: Lock, label: "Settings", href: "/account" },
  { icon: BookOpen, label: "Help Center", href: "#" },
];

const ACHIEVEMENTS = [
  { icon: ShoppingBag, label: "First Purchase", earned: false, desc: "Make your first purchase" },
  { icon: BookOpen, label: "Read 10 Books", earned: false, desc: "Complete 10 books" },
  { icon: Star, label: "Reviewer", earned: false, desc: "Write 5 reviews" },
  { icon: Heart, label: "Bookworm", earned: false, desc: "Read 25 books" },
];

const QUICK_ACTIONS = [
  { icon: BookOpen, label: "Browse Books", href: "/" },
  { icon: Heart, label: "Wishlist", href: "#" },
  { icon: BookOpen, label: "My Library", href: "#" },
  { icon: ShoppingBag, label: "Track Order", href: "/my-orders" },
  { icon: Star, label: "Redeem Rewards", href: "#" },
];

const COLLECTIONS = ["Mystery", "Sci-Fi", "Fantasy", "Business", "History", "Romance", "Thriller", "Biography"];

const FALLBACK_COVER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format";

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="border border-black/10 p-5 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#777]">{label}</span>
        <Icon className={`w-4 h-4 ${accent || "text-[#D90429]"}`} strokeWidth={1.8} />
      </div>
      <p className="font-display text-3xl font-black tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 bg-[#0a0a0a] text-white text-[9px] uppercase tracking-[0.15em] font-semibold px-2.5 py-1">
      {children}
    </span>
  );
}

export default function UserDashboardPage() {
  const { user, logout } = useAuth();
  const { wishlist, isWished } = useStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || typeof user !== "object") { setOrdersLoading(false); setDataLoading(false); return; }
    Promise.all([
      fetchMyOrders().then(setOrders).catch(() => setOrders([])),
      fetchBooks({ limit: 6 }).then(setRecommended).catch(() => setRecommended([])),
      fetchTrending().then(setTrending).catch(() => setTrending([])),
    ]).finally(() => { setOrdersLoading(false); setDataLoading(false); });
  }, [user]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 3);
  }, [orders]);

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const processing = orders.filter((o) => o.status === "processing" || o.status === "paid").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    return { total: orders.length, delivered, processing, cancelled };
  }, [orders]);

  const initials = useMemo(() => {
    if (!user?.name) return "?";
    return user.name.split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2);
  }, [user]);

  const handleLogout = () => { logout(); navigate("/"); };

  const continueReading = useMemo(() => {
    return wishlist.slice(0, 4);
  }, [wishlist]);

  if (!user || typeof user !== "object") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center px-6">
          <BookOpen className="w-12 h-12 mx-auto text-[#D90429] mb-6" strokeWidth={1.2} />
          <h1 className="font-display text-3xl font-black text-white mb-3">Welcome to SagaDrop</h1>
          <p className="text-[#888] text-sm mb-8">Sign in to access your dashboard.</p>
          <Link to="/login" className="inline-block bg-[#D90429] hover:bg-[#B00320] text-white px-10 py-3.5 text-xs uppercase tracking-[0.15em] font-semibold transition-colors no-underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D90429]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a] text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D90429] flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-base truncate">{user.name}</p>
              <Badge>Gold Member</Badge>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] mt-4">
            Last login: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors no-underline group
                ${item.href === "/dashboard"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-[#888] hover:text-white hover:bg-white/5"
                }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-[#888] hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#f5f5f0]/90 backdrop-blur-md border-b border-black/5">
          <div className="flex items-center justify-between px-4 md:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-black/5 rounded"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 lg:gap-6">
              <Link to="/" className="font-display text-lg font-black tracking-tight text-[#0a0a0a] no-underline">
                SagaDrop
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#555] cursor-pointer hover:text-[#0a0a0a] transition-colors" strokeWidth={1.5} />
              <Link to="/account" className="w-8 h-8 rounded-full bg-[#D90429] flex items-center justify-center text-white text-xs font-bold no-underline">
                {initials}
              </Link>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="eyebrow text-[#D90429] text-[10px] uppercase tracking-[0.18em] font-semibold mb-2">● Dashboard</p>
                <h1 className="font-display text-4xl md:text-5xl font-black tracking-[-0.02em] leading-[0.92]">
                  Welcome back, <span className="text-[#D90429]">{user.name?.split(" ")[0] || "Reader"}</span>
                </h1>
                <p className="text-[#555] text-sm mt-3">Ready to discover your next great read?</p>
              </div>
              <Link to="/" className="inline-flex items-center gap-2 bg-[#0a0a0a] hover:bg-[#333] text-white px-6 py-3 text-[11px] uppercase tracking-[0.18em] font-semibold no-underline transition-colors">
                Browse Books <BookOpen className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
                <StatCard icon={ShoppingBag} label="Books Purchased" value={stats.total} sub={`${stats.delivered} delivered`} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <StatCard icon={Heart} label="Wishlist" value={wishlist.length} sub="Books saved" accent="text-[#D90429]" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                <StatCard icon={BookOpen} label="Currently Reading" value={continueReading.length} sub="In progress" accent="text-[#0a0a0a]" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                <StatCard icon={Star} label="Reward Points" value="1,250" sub="500 to next reward" accent="text-[#D4A017]" />
              </motion.div>
            </div>

            {/* Continue Reading */}
            {continueReading.length > 0 && (
              <div className="mb-12">
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <p className="eyebrow text-[#D90429] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1.5">● Pick Up Where You Left Off</p>
                    <h2 className="font-display text-2xl font-black tracking-tight">Continue Reading.</h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {continueReading.map((book, i) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      <div className="relative overflow-hidden bg-[#f6f6f6] aspect-[3/4] mb-3">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.src = FALLBACK_COVER; }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full w-[35%] bg-[#D90429] rounded-full" />
                          </div>
                          <p className="text-[10px] text-white/80 mt-1.5">35% complete</p>
                        </div>
                      </div>
                      <h3 className="font-display text-sm font-bold leading-tight truncate">{book.title}</h3>
                      <p className="text-[11px] text-[#555] truncate mt-0.5">{book.author}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders + Rewards side by side */}
            <div className="grid lg:grid-cols-3 gap-6 mb-12">
              {/* Recent Orders */}
              <div className="lg:col-span-2">
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <p className="eyebrow text-[#D90429] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1.5">● Order History</p>
                    <h2 className="font-display text-2xl font-black tracking-tight">Recent Orders.</h2>
                  </div>
                  {orders.length > 3 && (
                    <Link to="/my-orders" className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#D90429] no-underline hover:underline">
                      View All
                    </Link>
                  )}
                </div>
                {ordersLoading ? (
                  <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 bg-[#e8e8e0] animate-pulse" />)}</div>
                ) : recentOrders.length === 0 ? (
                  <div className="border border-black/10 p-8 text-center bg-white">
                    <ShoppingBag className="w-8 h-8 mx-auto text-[#ccc] mb-3" strokeWidth={1} />
                    <p className="text-sm text-[#777]">No orders yet.</p>
                    <Link to="/" className="inline-block mt-3 text-xs uppercase tracking-[0.15em] font-semibold text-[#D90429] no-underline hover:underline">Start shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((o) => {
                      const statusLabel = o.status === "delivered" ? "Delivered" : o.status === "processing" ? "Processing" : o.status === "shipped" ? "Shipped" : o.status === "cancelled" ? "Cancelled" : "Paid";
                      const statusColor = o.status === "delivered" ? "text-[#2E7D32]" : o.status === "processing" ? "text-[#856404]" : o.status === "cancelled" ? "text-[#c62828]" : "text-[#1565C0]";
                      return (
                        <div key={o.id} className="border border-black/10 p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[#999]">
                              Order #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                            <span className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${statusColor}`}>{statusLabel}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {(o.items || []).slice(0, 2).map((item, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm flex-1 min-w-0">
                                <div className="w-8 h-11 bg-[#f6f6f6] flex-shrink-0 overflow-hidden">
                                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold truncate">{item.title}</p>
                                  <p className="text-[10px] text-[#777]">{item.author}</p>
                                </div>
                              </div>
                            ))}
                            {(o.items || []).length > 2 && (
                              <span className="text-[10px] text-[#999] flex-shrink-0">+{o.items.length - 2} more</span>
                            )}
                          </div>
                          <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between">
                            <Link to="/my-orders" className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#D90429] no-underline hover:underline">View Details</Link>
                            <p className="font-display text-sm font-bold">₹{o.total.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Rewards panel */}
              <div>
                <p className="eyebrow text-[#D90429] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1.5">● Rewards</p>
                <h2 className="font-display text-2xl font-black tracking-tight mb-5">Your Rewards.</h2>
                <div className="border border-black/10 p-6 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <Star className="w-8 h-8 text-[#D4A017]" strokeWidth={1.2} />
                    <span className="font-display text-3xl font-black">1,250</span>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#555] mb-1">Next Milestone</p>
                  <p className="text-[13px] text-[#777] mb-3">500 points to Gold Elite</p>
                  <div className="h-1.5 bg-[#f0f0e8] rounded-full overflow-hidden mb-5">
                    <div className="h-full w-[72%] bg-[#D4A017] rounded-full" />
                  </div>
                  <button className="w-full bg-[#D4A017] hover:bg-[#b8890f] text-white py-3 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors">
                    Redeem Rewards
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended For You */}
            {recommended.length > 0 && (
              <div className="mb-12">
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <p className="eyebrow text-[#D90429] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1.5">● Based on Your Interests</p>
                    <h2 className="font-display text-2xl font-black tracking-tight">Recommended For You.</h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recommended.map((book, i) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      <div className="relative overflow-hidden bg-[#f6f6f6] aspect-[3/4] mb-2.5">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.src = FALLBACK_COVER; }}
                        />
                      </div>
                      <h3 className="font-display text-xs font-bold leading-tight truncate">{book.title}</h3>
                      <p className="text-[10px] text-[#555] truncate">{book.author}</p>
                      <p className="font-display text-xs font-bold mt-1">₹{book.price}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Collections + Reading Goals + Achievements in a grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {/* Collections */}
              <div>
                <p className="eyebrow text-[#D90429] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1.5">● Collections</p>
                <h2 className="font-display text-2xl font-black tracking-tight mb-5">Explore Genres.</h2>
                <div className="grid grid-cols-2 gap-2">
                  {COLLECTIONS.map((genre) => (
                    <Link
                      key={genre}
                      to={`/categories`}
                      className="border border-black/10 px-4 py-3 bg-white text-xs font-semibold uppercase tracking-[0.1em] no-underline text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Reading Goals */}
              <div>
                <p className="eyebrow text-[#D90429] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1.5">● Goals</p>
                <h2 className="font-display text-2xl font-black tracking-tight mb-5">Reading Goals.</h2>
                <div className="border border-black/10 p-6 bg-white">
                  <div className="flex items-center gap-3 mb-5">
                    <Star className="w-6 h-6 text-[#D90429]" strokeWidth={1.5} />
                    <div>
                      <p className="font-display text-lg font-black">Books This Month</p>
                      <p className="text-[11px] text-[#555]">Set a personal goal</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-display text-4xl font-black">7</span>
                    <span className="text-[#999] text-sm">/ 10</span>
                  </div>
                  <div className="h-2 bg-[#f0f0e8] rounded-full overflow-hidden mb-4">
                    <div className="h-full w-[70%] bg-[#D90429] rounded-full" />
                  </div>
                  <p className="text-[11px] text-[#555]">3 more books to reach your goal</p>
                  <button className="mt-4 w-full border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white py-3 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors">
                    Set New Goal
                  </button>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <p className="eyebrow text-[#D90429] text-[10px] uppercase tracking-[0.18em] font-semibold mb-1.5">● Badges</p>
                <h2 className="font-display text-2xl font-black tracking-tight mb-5">Achievements.</h2>
                <div className="border border-black/10 p-6 bg-white">
                  <div className="space-y-4">
                    {ACHIEVEMENTS.map((ach) => (
                      <div key={ach.label} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ach.earned ? "bg-[#D90429] text-white" : "bg-[#f0f0e8] text-[#bbb]"}`}>
                          <ach.icon className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${ach.earned ? "text-[#0a0a0a]" : "text-[#999]"}`}>{ach.label}</p>
                          <p className="text-[10px] text-[#bbb]">{ach.desc}</p>
                        </div>
                        {ach.earned && (
                          <span className="ml-auto text-[#2E7D32] text-[9px] uppercase tracking-[0.12em] font-semibold">Earned</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-10">
              <p className="eyebrow text-[#D90429] text-[10px] uppercase tracking-[0.18em] font-semibold mb-3">● Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.label}
                    to={action.href}
                    className="inline-flex items-center gap-2 border border-black/10 bg-white px-5 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold no-underline text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                  >
                    <action.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black/10 pt-6 pb-12 text-center text-[11px] text-[#999]">
              <p>SagaDrop — Premium Digital Bookstore</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
