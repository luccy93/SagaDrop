import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, AlertCircle, Search, CheckCircle, Clock, XCircle } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { http } from "@/lib/api";

const STATUS_STYLES = {
  paid:    { label: "Paid",       cls: "bg-[#E8F5E9] text-[#2E7D32]", icon: CheckCircle },
  pending: { label: "Pending",    cls: "bg-[#FFF3CD] text-[#856404]", icon: Clock },
  failed:  { label: "Failed",     cls: "bg-[#FDECEA] text-[#c62828]", icon: XCircle },
};

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [dbOk, setDbOk]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    http.get("/orders")
      .then((r) => { setOrders(r.data || []); setDbOk(true); })
      .catch((e) => {
        setDbOk(e?.response?.status !== 503);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) =>
    !search ||
    o.id?.includes(search) ||
    o.customer_email?.includes(search) ||
    o.provider?.includes(search)
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-black tracking-tight">Orders</h1>
        <p className="text-sm text-[#555] mt-1">{orders.length} total orders</p>
      </div>

      {dbOk === false && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-6 flex items-start gap-3 bg-[#FFF3CD] border border-[#FFECB5] p-5">
          <AlertCircle className="w-5 h-5 text-[#856404] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#856404]">Database not connected</p>
            <p className="text-sm text-[#856404]/80 mt-1">Orders are stored in MongoDB. Add a valid <code className="bg-[#856404]/10 px-1 rounded">MONGO_URL</code> secret and restart the backend to view orders here.</p>
          </div>
        </motion.div>
      )}

      <div className="bg-white border border-black/10 p-5 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or email…"
            className="w-full pl-10 pr-4 py-2.5 border border-black/10 text-sm focus:outline-none focus:border-[#0a0a0a]"
          />
        </div>
      </div>

      <div className="bg-white border border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafafa] border-b border-black/10">
                {["Order ID", "Customer", "Provider", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 eyebrow text-[#777]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-black/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-[#f0f0f0] animate-pulse rounded-sm" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center">
                    <ShoppingBag className="w-10 h-10 text-[#ddd] mx-auto mb-3" />
                    <p className="text-sm text-[#999]">{dbOk === false ? "Connect MongoDB to view orders." : "No orders yet."}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((o, i) => {
                  const s = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
                  const StatusIcon = s.icon;
                  return (
                    <tr key={o.id} className={`border-t border-black/5 ${i % 2 === 0 ? "bg-white" : "bg-[#fdfdfd]"}`}>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#555]">{o.id?.slice(0, 8)}…</td>
                      <td className="px-5 py-3.5">{o.customer_email || "—"}</td>
                      <td className="px-5 py-3.5 capitalize">{o.provider}</td>
                      <td className="px-5 py-3.5 text-[#777]">{o.items?.length ?? "—"}</td>
                      <td className="px-5 py-3.5 font-bold">₹{o.total?.toLocaleString() ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] font-semibold ${s.cls}`}>
                          <StatusIcon className="w-3 h-3" />{s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#777] text-xs">{o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
