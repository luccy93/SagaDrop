import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { subscribeNewsletter } from "@/lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try { await subscribeNewsletter(email); setStatus("done"); }
    catch { setStatus("idle"); }
  };

  return (
    <section className="py-28 md:py-40 bg-[#0a0a0a] text-white overflow-hidden" data-testid="newsletter-section">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-14 items-end">
          <div>
            <p className="eyebrow text-[#D90429] mb-6">● 08 / Newsletter</p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="font-display text-6xl md:text-8xl font-black tracking-[-0.03em] leading-[0.86]"
            >
              A Letter.<br />
              Once a Week.<br />
              <span className="italic text-white/40 font-medium">Never Spam.</span>
            </motion.h2>
            <p className="mt-8 max-w-lg text-white/60 text-sm leading-relaxed">
              Editor's picks, upcoming drops, and exclusive covers
              you'll want to frame — delivered every Sunday.
            </p>
          </div>

          <form onSubmit={submit} className="w-full" data-testid="newsletter-form">
            {status !== "done" ? (
              <>
                <p className="eyebrow text-white/60 mb-3">Email</p>
                <div className="flex items-center gap-4 border-b-2 border-white/20 focus-within:border-[#D90429] transition-colors">
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@library.com"
                    data-testid="newsletter-email"
                    className="flex-1 bg-transparent outline-none py-4 text-base placeholder:text-white/30"
                  />
                  <button
                    type="submit" disabled={status === "loading"}
                    data-testid="newsletter-submit"
                    className="inline-flex items-center gap-2 bg-[#D90429] hover:bg-[#B00320] text-white px-6 py-3 text-[12px] tracking-[0.18em] uppercase font-semibold disabled:opacity-60"
                  >
                    {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Subscribe
                  </button>
                </div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/40 mt-4">
                  By subscribing, you agree to our editorial letter policy.
                </p>
              </>
            ) : (
              <div className="flex items-center gap-3 text-[#D90429]" data-testid="newsletter-success">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-display text-2xl">You're on the list. Welcome to SagaDrop.</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
