import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, ShoppingBag, Users, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { fetchTrending, http } from "@/lib/api";

const CARD_COLORS = ["#D90429", "#0a0a0a", "#2E7D32", "#0277BD"];

function StatCard({ label, value, sub, icon: Icon, color, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07, duration: 0.5 }}
      className="bg-white border border-black/10 p-7 flex items-start justify-between"
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#999] mb-3">{label}</p>
        <p className="font-display text-4xl font-black tracking-tight text-[#0a0a0a]">{value}</p>
        {sub && <p className="text-xs text-[#999] mt-2">{sub}</p>}
      </div>
      <div className="w-11 h-11 grid place-items-center rounded-sm" style={{ backgroundColor: color + "18" }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [books, setBooks]   = useState([]);
  const [dbOk, setDbOk]     = useState(null);

  useEffect(() => {
    fetchTrending().then(setBooks).catch(() => setBooks([]));
    http.get("/auth/me").then(() => setDbOk(true)).catch((e) => {
      setDbOk(e?.response?.status === 503 ? false : true);
    });
  }, []);

  const stats = [
    { label: "Books in Catalog", value: "40",           sub: "From catalog.py",             icon: BookOpen,    color: CARD_COLORS[0] },
    { label: "Total Orders",     value: dbOk ? "—" : "DB offline", sub: "Connect MongoDB",  icon: ShoppingBag, color: CARD_COLORS[1] },
    { label: "Customers",        value: dbOk ? "—" : "DB offline", sub: "Connect MongoDB",  icon: Users,       color: CARD_COLORS[2] },
    { label: "Avg. Rating",      value: "4.8★",          sub: "Across all books",            icon: TrendingUp,  color: CARD_COLORS[3] },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#555] mt-1">Welcome back. Here's what's happening at SagaDrop.</p>
      </div>

      {!dbOk && dbOk !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-6 flex items-start gap-3 bg-[#FFF3CD] border border-[#FFECB5] p-4 text-sm">
          <AlertCircle className="w-4 h-4 text-[#856404] flex-shrink-0 mt-0.5" />
          <p className="text-[#856404]">
            MongoDB is not connected — order and customer data is unavailable. Add a valid <code className="bg-[#856404]/10 px-1 rounded">MONGO_URL</code> secret to enable all features.
          </p>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s, i) => <StatCard key={s.label} {...s} i={i} />)}
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-5 mb-10">
        {[
          { to: "/admin/books",     label: "Manage Books",    body: "Browse and edit the full catalog of 40 books." },
          { to: "/admin/orders",    label: "View Orders",     body: "Review all customer purchases and payment status." },
          { to: "/admin/analytics", label: "Analytics",       body: "Revenue trends, top titles, and reader behaviour." },
        ].map(({ to, label, body }) => (
          <Link key={to} to={to} className="no-underline group">
            <div className="bg-white border border-black/10 p-7 hover:border-[#D90429] transition-colors h-full">
              <h3 className="font-display text-lg font-bold tracking-tight text-[#0a0a0a] group-hover:text-[#D90429] transition-colors mb-2 flex items-center justify-between">
                {label} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-[#555]">{body}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Book table preview */}
      <div className="bg-white border border-black/10">
        <div className="flex items-center justify-between px-7 py-5 border-b border-black/10">
          <h2 className="font-display text-lg font-bold tracking-tight">Top Books</h2>
          <Link to="/admin/books" className="text-[11px] uppercase tracking-[0.16em] text-[#555] hover:text-[#D90429] no-underline transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafafa] text-[#999]">
                {["Cover", "Title", "Author", "Category", "Price", "Rating"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 eyebrow">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {books.slice(0, 8).map((b, i) => (
                <tr key={b.id} className={`border-t border-black/5 ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]/50"}`}>
                  <td className="px-6 py-3">
                    <div className="w-8 h-10 bg-[#f0f0f0] overflow-hidden flex-shrink-0">
                      <img src={b.cover} alt={b.title} className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    </div>
                  </td>
                  <td className="px-6 py-3 font-semibold max-w-[200px] truncate">{b.title}</td>
                  <td className="px-6 py-3 text-[#555]">{b.author}</td>
                  <td className="px-6 py-3">
                    <span className="bg-[#f0f0f0] text-[#555] text-[10px] uppercase tracking-[0.12em] px-2.5 py-1">{b.category}</span>
                  </td>
                  <td className="px-6 py-3 font-semibold">₹{b.price}</td>
                  <td className="px-6 py-3 text-[#D90429] font-semibold">{b.rating}★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
