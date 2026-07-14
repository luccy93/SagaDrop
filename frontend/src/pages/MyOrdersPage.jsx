import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { fetchMyOrders } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_BADGE = {
  paid: { label: "Paid", cls: "bg-[#E8F5E9] text-[#2E7D32]" },
  processing: { label: "Processing", cls: "bg-[#FFF3CD] text-[#856404]" },
  shipped: { label: "Shipped", cls: "bg-[#E3F2FD] text-[#1565C0]" },
  delivered: { label: "Delivered", cls: "bg-[#E8F5E9] text-[#2E7D32]" },
  cancelled: { label: "Cancelled", cls: "bg-[#FDECEA] text-[#c62828]" },
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchMyOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [user]);

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Account</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">My Orders</h1>
          </motion.div>

          {!user ? (
            <p className="text-[#999]">Please <a href="/login" className="underline text-[#D90429]">log in</a> to see your orders.</p>
          ) : loading ? (
            <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-[#f6f6f6] animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24">
              <Package className="w-12 h-12 mx-auto text-[#ccc] mb-4" strokeWidth={1} />
              <p className="text-lg text-[#999]">No orders yet.</p>
              <a href="/" className="inline-block mt-4 text-sm underline text-[#D90429]">Start shopping</a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => {
                const s = STATUS_BADGE[o.status] || STATUS_BADGE.paid;
                return (
                  <div key={o.id} className="border border-black/10 p-6 bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-[#999]">Order #{o.id.slice(0, 8)}</p>
                        <p className="text-xs text-[#999] mt-1">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                      <span className={`${s.cls} text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 font-semibold`}>{s.label}</span>
                    </div>
                    <div className="space-y-2">
                      {(o.items || []).map((item, i) => (
                        <div key={i} className="flex items-center gap-4 text-sm">
                          <div className="w-10 h-14 bg-[#f6f6f6] flex-shrink-0 overflow-hidden">
                            <img src={item.cover} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{item.title}</p>
                            <p className="text-[#777] text-xs">{item.author} · Qty {item.qty}</p>
                          </div>
                          <p className="font-bold">₹{item.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    {o.shipping_address && (
                      <div className="mt-4 pt-4 border-t border-black/5 text-xs text-[#555]">
                        <p className="font-semibold mb-1">Shipping to</p>
                        <p>{o.shipping_address.line1}{o.shipping_address.line2 ? `, ${o.shipping_address.line2}` : ""}</p>
                        <p>{o.shipping_address.city}, {o.shipping_address.state} — {o.shipping_address.pincode}</p>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                      <p className="text-xs text-[#999]">{o.provider} · {o.payment_id.slice(0, 12)}…</p>
                      <p className="font-display text-xl font-black">₹{o.total.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
