import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const u = await register(name, email, password);
      toast.success(`Welcome to SagaDrop, ${u.name}.`);
      navigate("/");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout tagline="New Member" headline={"YOUR\nSTORY\nSTARTS\nHERE."}>
      <p className="eyebrow text-[#D90429] mb-3">● Create Account</p>
      <h2 className="font-display text-4xl font-black tracking-[-0.02em]">Join The Story.</h2>
      <p className="mt-3 text-sm text-[#555]">
        Already a member?{" "}
        <Link to="/login" data-testid="go-to-login-link" className="text-[#D90429] font-semibold no-underline hover:underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={submit} className="mt-10 space-y-8" data-testid="signup-form">
        <div>
          <label className="eyebrow block mb-2">Full Name</label>
          <input
            type="text" required value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="signup-name-input"
            placeholder="Jane Reader"
            className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-lg"
          />
        </div>
        <div>
          <label className="eyebrow block mb-2">Email</label>
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="signup-email-input"
            placeholder="you@example.com"
            className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-lg"
          />
        </div>
        <div>
          <label className="eyebrow block mb-2">Password</label>
          <input
            type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="signup-password-input"
            placeholder="At least 6 characters"
            className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-lg"
          />
        </div>

        {error && (
          <p data-testid="auth-error" className="text-sm text-[#D90429] font-medium">{error}</p>
        )}

        <button
          type="submit" disabled={loading}
          data-testid="signup-submit-btn"
          className="group w-full inline-flex items-center justify-center gap-3 bg-[#D90429] hover:bg-[#B00320] text-white px-8 py-4 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span className="text-[13px] font-semibold tracking-[0.15em] uppercase">
            {loading ? "Creating account…" : "Create Account"}
          </span>
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>
    </AuthLayout>
  );
}
