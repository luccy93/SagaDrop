import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, ShieldCheck, RefreshCw, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";

const RESEND_COOLDOWN = 60; // seconds

export default function SignupPage() {
  const { register, sendOtp, verifyOtp, loginWithGoogle, googleClientId } = useAuth();
  const navigate = useNavigate();

  // Step 1 fields
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // Step management
  const [step, setStep]       = useState(1); // 1 = form, 2 = OTP
  const [otp, setOtp]         = useState("");
  const [countdown, setCountdown] = useState(0);

  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await sendOtp(email, name, password, "signup");
      setStep(2);
      setCountdown(RESEND_COOLDOWN);
      toast.success("Verification code sent to your email.");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) { setError("Please enter the full 6-digit code."); return; }
    setLoading(true);
    try {
      const u = await verifyOtp(email, otp, "signup");
      toast.success(`Welcome to SagaDrop, ${u.name}. 🎉`);
      navigate("/");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setLoading(true);
    try {
      await sendOtp(email, name, password, "signup");
      setCountdown(RESEND_COOLDOWN);
      setOtp("");
      toast.success("New code sent.");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Google signup ─────────────────────────────────────────────────────────
  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const u = await loginWithGoogle(tokenResponse.access_token);
        toast.success(`Welcome to SagaDrop, ${u.name}.`);
        navigate("/");
      } catch (err) {
        setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google sign-up failed. Please try again."),
  });

  // ─── Step 1: Registration form ────────────────────────────────────────────
  if (step === 1) {
    return (
      <AuthLayout tagline="New Member" headline={"YOUR\nSTORY\nSTARTS\nHERE."}>
        <p className="eyebrow text-[#D90429] mb-3">● Create Account</p>
        <h2 className="font-display text-4xl font-black tracking-[-0.02em]">Join The Story.</h2>
        <p className="mt-3 text-sm text-[#555]">
          Already a member?{" "}
          <Link to="/login" className="text-[#D90429] font-semibold no-underline hover:underline">
            Sign in
          </Link>
        </p>

        {/* Google button */}
        {googleClientId && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => googleSignup()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border-2 border-black/10 hover:border-black/30 bg-white hover:bg-[#f8f8f8] px-6 py-3.5 transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              <span className="text-[13px] font-semibold tracking-[0.1em] uppercase text-[#0a0a0a]">
                Continue with Google
              </span>
            </button>
            <div className="flex items-center gap-4 mt-6 mb-2">
              <div className="flex-1 h-px bg-black/10" />
              <span className="text-xs text-[#999] uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-black/10" />
            </div>
          </div>
        )}

        <form onSubmit={handleSendOtp} className="mt-6 space-y-7">
          <div>
            <label className="eyebrow block mb-2">Full Name</label>
            <input
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Jane Reader"
              className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-lg"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-lg"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-lg"
            />
          </div>

          {error && <p className="text-sm text-[#D90429] font-medium">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-3 bg-[#D90429] hover:bg-[#B00320] text-white px-8 py-4 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            <span className="text-[13px] font-semibold tracking-[0.15em] uppercase">
              {loading ? "Sending code…" : "Send Verification Code"}
            </span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </AuthLayout>
    );
  }

  // ─── Step 2: OTP verification ─────────────────────────────────────────────
  return (
    <AuthLayout tagline="Verify Email" headline={"CHECK\nYOUR\nINBOX."}>
      <p className="eyebrow text-[#D90429] mb-3">● Email Verification</p>
      <h2 className="font-display text-4xl font-black tracking-[-0.02em]">Enter Your Code.</h2>
      <p className="mt-3 text-sm text-[#555] leading-relaxed">
        We sent a 6-digit code to <strong>{email}</strong>.<br />
        It expires in {10} minutes.
      </p>

      <form onSubmit={handleVerifyOtp} className="mt-8 space-y-7">
        <div>
          <label className="eyebrow block mb-2">Verification Code</label>
          <input
            type="text" required inputMode="numeric" maxLength={6}
            value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-3xl font-mono tracking-[0.5em] text-center"
          />
        </div>

        {error && <p className="text-sm text-[#D90429] font-medium">{error}</p>}

        <button
          type="submit" disabled={loading || otp.length !== 6}
          className="group w-full inline-flex items-center justify-center gap-3 bg-[#D90429] hover:bg-[#B00320] text-white px-8 py-4 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span className="text-[13px] font-semibold tracking-[0.15em] uppercase">
            {loading ? "Verifying…" : "Verify & Create Account"}
          </span>
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      {/* Resend + back */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button" onClick={() => { setStep(1); setError(""); setOtp(""); }}
          className="text-[#555] hover:text-black transition-colors"
        >
          ← Change email
        </button>
        <button
          type="button" onClick={handleResend} disabled={countdown > 0 || loading}
          className="flex items-center gap-1.5 text-[#D90429] hover:text-[#B00320] disabled:text-[#999] disabled:cursor-not-allowed transition-colors font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
        </button>
      </div>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
