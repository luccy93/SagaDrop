import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, BookOpen, Star, AlertCircle } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { fetchTrending } from "@/lib/api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const REVENUE = [124000, 198000, 167000, 241000, 312000, 289000, 341000];
const MAX_REV = Math.max(...REVENUE);

function Bar({ val, max, label, i }) {
  const pct = (val / max) * 100;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07, duration: 0.4 }}
      className="flex flex-col items-center gap-2"
    >
      <span className="text-[10px] text-[#999]">₹{(val / 1000).toFixed(0)}K</span>
      <div className="flex-1 w-full flex items-end" style={{ height: 120 }}>
        <motion.div
          initial={{ height: 0 }} animate={{ height: `${pct}%` }}
          transition={{ delay: i * 0.07 + 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full bg-[#D90429] min-h-[4px]"
        />
      </div>
      <span className="text-[10px] text-[#555]">{label}</span>
    </motion.div>
  );
}

export default function AdminAnalytics() {
  const [topBooks, setTopBooks] = useState([]);

  useEffect(() => {
    fetchTrending()
      .then((b) => setTopBooks([...b].sort((a, z) => (z.rating ?? 0) - (a.rating ?? 0)).slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-black tracking-tight">Analytics</h1>
        <p className="text-sm text-[#555] mt-1">Performance overview — demo data shown (connect MongoDB for live metrics).</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="mb-6 flex items-start gap-3 bg-[#EEF2FF] border border-[#C7D2FE] p-4 text-sm">
        <AlertCircle className="w-4 h-4 text-[#4338CA] flex-shrink-0 mt-0.5" />
        <p className="text-[#4338CA]">Revenue and sales data below are illustrative. Live data requires MongoDB + order tracking.</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Revenue (Jul)",  val: "₹3.41L",  delta: "+18%",   icon: TrendingUp, color: "#D90429" },
          { label: "Orders (Jul)",   val: "214",      delta: "+12%",   icon: BarChart3,  color: "#0277BD" },
          { label: "Catalog",        val: "40",       delta: "books",  icon: BookOpen,   color: "#2E7D32" },
          { label: "Avg. Rating",    val: "4.8★",     delta: "readers love us", icon: Star, color: "#F57C00" },
        ].map(({ label, val, delta, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.5 }}
            className="bg-white border border-black/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#999]">{label}</p>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="font-display text-3xl font-black tracking-tight">{val}</p>
            <p className="text-xs text-[#999] mt-1">{delta}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-black/10 p-8 mb-8">
        <h2 className="font-display text-xl font-bold tracking-tight mb-8">Monthly Revenue (₹)</h2>
        <div className="grid grid-cols-7 gap-3 items-end" style={{ height: 160 }}>
          {REVENUE.map((v, i) => <Bar key={MONTHS[i]} val={v} max={MAX_REV} label={MONTHS[i]} i={i} />)}
        </div>
      </div>

      {/* Top rated books */}
      <div className="bg-white border border-black/10">
        <div className="px-7 py-5 border-b border-black/10">
          <h2 className="font-display text-lg font-bold tracking-tight">Top-Rated Books</h2>
        </div>
        <div className="divide-y divide-black/5">
          {topBooks.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 + 0.3, duration: 0.5 }}
              className="flex items-center gap-5 px-7 py-4">
              <span className="font-display text-2xl font-black text-[#ddd] w-8 text-center">{i + 1}</span>
              <div className="w-9 h-12 bg-[#f0f0f0] overflow-hidden flex-shrink-0">
                <img src={b.cover} alt={b.title} className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{b.title}</p>
                <p className="text-xs text-[#555]">{b.author}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-[#D90429]">{b.rating}★</p>
                <p className="text-xs text-[#999]">{b.reviews > 1000 ? `${(b.reviews / 1000).toFixed(1)}K reviews` : `${b.reviews} reviews`}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
