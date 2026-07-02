import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name || "reader"}.`);
      navigate("/");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout tagline="Member Access" headline={"EVERY\nSTORY\nAWAITS."}>
      <p className="eyebrow text-[#D90429] mb-3">● Sign In</p>
      <h2 className="font-display text-4xl font-black tracking-[-0.02em]">Welcome Back.</h2>
      <p className="mt-3 text-sm text-[#555]">
        New to SagaDrop?{" "}
        <Link to="/signup" data-testid="go-to-signup-link" className="text-[#D90429] font-semibold no-underline hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={submit} className="mt-10 space-y-8" data-testid="login-form">
        <div>
          <label className="eyebrow block mb-2">Email</label>
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="login-email-input"
            placeholder="you@example.com"
            className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-lg"
          />
        </div>
        <div>
          <label className="eyebrow block mb-2">Password</label>
          <input
            type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="login-password-input"
            placeholder="••••••••"
            className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-lg"
          />
        </div>

        {error && (
          <p data-testid="auth-error" className="text-sm text-[#D90429] font-medium">{error}</p>
        )}

        <button
          type="submit" disabled={loading}
          data-testid="login-submit-btn"
          className="group w-full inline-flex items-center justify-center gap-3 bg-[#0a0a0a] hover:bg-[#D90429] text-white px-8 py-4 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span className="text-[13px] font-semibold tracking-[0.15em] uppercase">
            {loading ? "Signing in…" : "Sign In"}
          </span>
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>
    </AuthLayout>
  );
}
