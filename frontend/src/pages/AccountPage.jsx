import { useState } from "react";
import { motion } from "framer-motion";
import { User, Package, Lock, LogOut, BookOpen } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, changePassword } from "@/lib/api";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

export default function AccountPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [changing, setChanging] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      await refreshUser();
      toast.success("Profile updated");
    } catch (e) { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!curPw || !newPw) { toast.error("Fill in both fields."); return; }
    if (newPw.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    setChanging(true);
    try {
      await changePassword({ current_password: curPw, new_password: newPw });
      toast.success("Password changed");
      setCurPw(""); setNewPw("");
    } catch (e) {
      const msg = e?.response?.data?.detail || "Failed to change password";
      toast.error(msg);
    } finally { setChanging(false); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  if (!user) {
    return (
      <PageLayout>
        <section className="pt-36 pb-24 bg-white min-h-screen">
          <div className="max-w-[600px] mx-auto px-6 text-center">
            <p className="text-lg text-[#999]">Please <Link to="/login" className="underline text-[#D90429]">log in</Link> to view your account.</p>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[800px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12">
            <p className="eyebrow text-[#D90429] mb-4">● Account</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">Settings</h1>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Link to="/dashboard" className="border border-black/10 p-6 flex items-center gap-4 hover:bg-[#fafafa] transition-colors">
              <BookOpen className="w-6 h-6 text-[#D90429]" />
              <div><p className="font-semibold">Dashboard</p><p className="text-xs text-[#555]">Orders, stats & recommendations</p></div>
            </Link>
            <Link to="/my-orders" className="border border-black/10 p-6 flex items-center gap-4 hover:bg-[#fafafa] transition-colors">
              <Package className="w-6 h-6 text-[#D90429]" />
              <div><p className="font-semibold">My Orders</p><p className="text-xs text-[#555]">View order history</p></div>
            </Link>
            <button onClick={handleLogout} className="border border-black/10 p-6 flex items-center gap-4 hover:bg-[#fafafa] transition-colors text-left">
              <LogOut className="w-6 h-6 text-[#D90429]" />
              <div><p className="font-semibold">Log Out</p><p className="text-xs text-[#555]">{user.email}</p></div>
            </button>
          </div>

          <div className="border border-black/10 p-8 mb-8">
            <h2 className="font-display text-2xl font-black mb-6 flex items-center gap-2"><User className="w-5 h-5" /> Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a]" />
              </div>
              <div>
                <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Email</label>
                <input value={user.email} disabled
                  className="w-full border border-black/10 px-3 py-2.5 text-sm bg-[#f6f6f6] text-[#777]" />
              </div>
              <button onClick={handleUpdate} disabled={saving}
                className="bg-[#0a0a0a] text-white px-6 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#1a1a1a] disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          <div className="border border-black/10 p-8">
            <h2 className="font-display text-2xl font-black mb-6 flex items-center gap-2"><Lock className="w-5 h-5" /> Password</h2>
            <div className="space-y-4">
              <div>
                <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Current password</label>
                <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)}
                  className="w-full border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a]" />
              </div>
              <div>
                <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">New password</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                  className="w-full border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a]" />
              </div>
              <button onClick={handleChangePassword} disabled={changing}
                className="bg-[#0a0a0a] text-white px-6 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#1a1a1a] disabled:opacity-50">
                {changing ? "Changing…" : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
