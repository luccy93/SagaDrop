import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { authSendOtp, resetPassword } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // email → otp → done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const r = await authSendOtp({ email, purpose: "reset" });
      toast.success(r.dev_otp ? `DEV OTP: ${r.dev_otp}` : "OTP sent to your email");
      setStep("otp");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPw) { toast.error("Fill in all fields."); return; }
    if (newPw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await resetPassword({ email, otp, new_password: newPw });
      toast.success("Password reset! You can now log in.");
      navigate("/login");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to reset password");
    } finally { setLoading(false); }
  };

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[480px] mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10">
            <Link to="/login" className="text-xs uppercase tracking-[0.14em] text-[#999] hover:text-[#D90429] flex items-center gap-2 mb-6">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
            <p className="eyebrow text-[#D90429] mb-4">● Account</p>
            <h1 className="font-display text-5xl md:text-6xl font-black tracking-[-0.02em] leading-[0.9]">Reset Password</h1>
          </motion.div>

          <div className="border border-black/10 p-8">
            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a]" placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#0a0a0a] text-white py-3 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#1a1a1a] disabled:opacity-50">
                  {loading ? "Sending…" : "Send OTP"}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleReset} className="space-y-5">
                <p className="text-sm text-[#555]">Enter the 6-digit code sent to {email}</p>
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">OTP</label>
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required
                    className="w-full border border-black/10 px-3 py-2.5 text-sm text-center text-2xl tracking-[0.3em] focus:outline-none focus:border-[#0a0a0a]" placeholder="000000" />
                </div>
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">New password</label>
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={6}
                    className="w-full border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a]" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#0a0a0a] text-white py-3 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#1a1a1a] disabled:opacity-50">
                  {loading ? "Resetting…" : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
