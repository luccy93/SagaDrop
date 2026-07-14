import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, AlertCircle, Search, CheckCircle, Clock, XCircle, Truck, Package, RotateCcw } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { http } from "@/lib/api";
import { toast } from "sonner";

const STATUS_OPTIONS = ["paid", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES = {
  paid:       { label: "Paid",       cls: "bg-[#E8F5E9] text-[#2E7D32]", icon: CheckCircle },
  processing: { label: "Processing", cls: "bg-[#FFF3CD] text-[#856404]", icon: RotateCcw },
  shipped:    { label: "Shipped",    cls: "bg-[#E3F2FD] text-[#1565C0]", icon: Truck },
  delivered:  { label: "Delivered",  cls: "bg-[#E8F5E9] text-[#2E7D32]", icon: Package },
  cancelled:  { label: "Cancelled",  cls: "bg-[#FDECEA] text-[#c62828]", icon: XCircle },
};

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const load = () => {
    setLoading(true);
    http.get("/checkout/orders")
      .then((r) => { setOrders(r.data || []); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await http.patch(`/checkout/orders/${orderId}/status`, { status });
      toast.success(`Order status → ${status}`);
      load();
    } catch (e) { toast.error("Failed to update status"); }
  };

  const filtered = orders.filter((o) =>
    !search ||
    (o.id || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">Orders</h1>
          <p className="text-sm text-[#555] mt-1">{orders.length} total orders</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID or email…"
            className="w-full pl-10 pr-4 py-2.5 border border-black/10 text-sm focus:outline-none focus:border-[#0a0a0a]" />
        </div>
      </div>

      <div className="bg-white border border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafafa] border-b border-black/10">
                {["Order ID", "Date", "Customer", "Email", "Items", "Total", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 eyebrow text-[#777] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-black/5">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-[#f0f0f0] animate-pulse rounded-sm" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-[#999]">No orders found.</td></tr>
              ) : (
                filtered.map((o, i) => {
                  const ss = STATUS_STYLES[o.status] || STATUS_STYLES.paid;
                  const Icon = ss.icon;
                  return (
                    <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i, 20) * 0.02 }}
                      className={`border-t border-black/5 hover:bg-[#fafafa] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#fdfdfd]"}`}>
                      <td className="px-5 py-3 font-mono text-xs text-[#555]">#{o.id.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-xs text-[#777] whitespace-nowrap">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </td>
                      <td className="px-5 py-3 font-semibold">{o.shipping_address?.line1 ? `${o.shipping_address.line1.slice(0, 20)}…` : "Guest"}</td>
                      <td className="px-5 py-3 text-[#555] text-xs">{o.customer_email || "—"}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[#777]">{(o.items || []).length} item{(o.items || []).length !== 1 ? "s" : ""}</span>
                        <div className="text-[10px] text-[#999] mt-0.5">{(o.items || []).map((x) => x.title?.slice(0, 24)).join(", ").slice(0, 40)}</div>
                      </td>
                      <td className="px-5 py-3 font-bold">₹{o.total?.toLocaleString() || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 ${ss.cls} text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 font-semibold`}>
                          <Icon className="w-3 h-3" /> {ss.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="border border-black/10 px-2 py-1.5 text-[10px] uppercase tracking-[0.1em] bg-white focus:outline-none focus:border-[#0a0a0a]">
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-black/10 bg-[#fafafa] flex items-center justify-between">
          <p className="text-xs text-[#999]">Showing {filtered.length} of {orders.length} orders</p>
        </div>
      </div>
    </AdminLayout>
  );
}
