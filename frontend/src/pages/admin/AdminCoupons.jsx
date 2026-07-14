import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Percent, Plus, Trash2, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { fetchCoupons, createCoupon, deleteCoupon } from "@/lib/api";
import { toast } from "sonner";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: "", discount_percent: "10", max_uses: "0", expires_at: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchCoupons().then(setCoupons).catch(() => setCoupons([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.code.trim() || !form.discount_percent) { toast.error("Code and discount are required."); return; }
    setSaving(true);
    try {
      await createCoupon({
        code: form.code.trim(),
        discount_percent: parseFloat(form.discount_percent),
        max_uses: parseInt(form.max_uses) || 0,
        expires_at: form.expires_at || null,
      });
      toast.success("Coupon created");
      setShowAdd(false);
      setForm({ code: "", discount_percent: "10", max_uses: "0", expires_at: "" });
      load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed to create coupon"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try { await deleteCoupon(code); toast.success("Deleted"); load(); }
    catch (e) { toast.error("Failed to delete"); }
  };

  const isExpired = (exp) => {
    if (!exp) return false;
    return new Date(exp) < new Date();
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">Coupons</h1>
          <p className="text-sm text-[#555] mt-1">{coupons.length} promo codes</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#1a1a1a]">
          <Plus className="w-3.5 h-3.5" /> New Coupon
        </button>
      </div>

      <div className="bg-white border border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafafa] border-b border-black/10">
                {["Code", "Discount", "Uses", "Max Uses", "Expires", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 eyebrow text-[#777]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-t border-black/5">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-[#f0f0f0] animate-pulse" /></td>
                  ))}
                </tr>
              )) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-[#999]">No coupons yet.</td></tr>
              ) : coupons.map((c, i) => {
                const expired = isExpired(c.expires_at);
                const reached = c.max_uses > 0 && c.uses >= c.max_uses;
                const inactive = !c.active || expired || reached;
                return (
                  <tr key={c.code} className={`border-t border-black/5 hover:bg-[#fafafa] ${inactive ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3 font-mono font-bold text-sm">{c.code}</td>
                    <td className="px-5 py-3"><span className="bg-[#0a0a0a] text-white text-xs px-2 py-0.5">{c.discount_percent}%</span></td>
                    <td className="px-5 py-3 text-[#555]">{c.uses}</td>
                    <td className="px-5 py-3 text-[#555]">{c.max_uses || "∞"}</td>
                    <td className="px-5 py-3 text-xs text-[#777]">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 font-semibold ${inactive ? "bg-[#FDECEA] text-[#c62828]" : "bg-[#E8F5E9] text-[#2E7D32]"}`}>
                        {inactive ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(c.code)} className="p-1.5 hover:bg-[#f0f0f0] text-[#D90429]"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-black">New Coupon</h2>
                <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-[#f0f0f0]"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Code</label>
                  <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a]" placeholder="SAVE20" />
                </div>
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Discount %</label>
                  <input type="number" value={form.discount_percent} onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))}
                    min={1} max={100} className="w-full border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a]" />
                </div>
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Max Uses (0 = unlimited)</label>
                  <input type="number" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                    min={0} className="w-full border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a]" />
                </div>
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Expires At (optional)</label>
                  <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                    className="w-full border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a]" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 border border-black/10 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold">Cancel</button>
                <button onClick={handleCreate} disabled={saving}
                  className="flex-1 bg-[#0a0a0a] text-white py-2.5 text-xs uppercase tracking-[0.14em] font-semibold disabled:opacity-50">
                  {saving ? "Creating…" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
