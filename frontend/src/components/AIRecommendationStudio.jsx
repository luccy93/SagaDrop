import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight, Wand2 } from "lucide-react";
import { aiRecommend } from "@/lib/api";
import { toast } from "sonner";

const MOODS = [
  { key: "Fantasy", label: "Fantasy", sub: "Kingdoms & Magic", bg: "#0a0a0a", accent: "#c9a56a" },
  { key: "Romance", label: "Romance", sub: "Slow-Burn & Hearts", bg: "#D90429", accent: "#ffffff" },
  { key: "Adventure", label: "Adventure", sub: "Journeys & Quests", bg: "#0a0a0a", accent: "#ffffff" },
  { key: "Mystery", label: "Mystery", sub: "Puzzles & Shadows", bg: "#f6f6f6", accent: "#0a0a0a" },
];

export default function AIRecommendationStudio() {
  const [mood, setMood] = useState("Fantasy");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await aiRecommend(mood, tone);
      setResult(data);
    } catch (e) {
      toast.error("The librarian is resting. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="ai-studio"
      data-testid="ai-studio-section"
      className="py-24 md:py-32 bg-[#0a0a0a] text-white overflow-hidden relative"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-16 items-start">
          <div>
            <p className="eyebrow text-[#D90429] mb-4">● 03 / AI Powered</p>
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-[-0.02em] leading-[0.9]">
              AI Book<br />
              Recommendation<br />
              <span className="italic font-medium text-white/60">Studio.</span>
            </h2>
            <p className="mt-8 max-w-lg text-[15px] text-white/60 leading-relaxed">
              Tell us your mood. Our AI librarian — powered by Claude — reads
              between the lines of thousands of titles to pull the exact book
              you didn't know you needed.
            </p>

            <div className="mt-10">
              <p className="eyebrow text-white/60 mb-4">Choose a Mood</p>
              <div className="grid grid-cols-2 gap-[1px] bg-white/10 max-w-lg">
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    data-testid={`mood-${m.key.toLowerCase()}`}
                    className={`p-6 text-left transition-all ${
                      mood === m.key ? "bg-[#D90429] text-white" : "bg-[#0a0a0a] hover:bg-white/5"
                    }`}
                  >
                    <div className="font-display text-2xl font-bold">{m.label}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] opacity-70 mt-1">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 max-w-lg">
              <p className="eyebrow text-white/60 mb-3">Optional Vibe</p>
              <input
                data-testid="mood-tone-input"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. rainy afternoon, gothic castles, morally grey heroes"
                className="w-full bg-transparent border-b border-white/20 focus:border-[#D90429] outline-none py-3 text-sm placeholder:text-white/30"
              />
            </div>

            <button
              onClick={generate}
              disabled={loading}
              data-testid="generate-recommendations-btn"
              className="mt-10 inline-flex items-center gap-3 bg-[#D90429] hover:bg-[#B00320] text-white px-8 py-4 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span className="text-[13px] font-semibold tracking-[0.15em] uppercase">
                {loading ? "Reading Your Mind…" : "Generate Recommendations"}
              </span>
            </button>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="border border-white/10 p-8 md:p-10 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-6">
                <Wand2 className="w-4 h-4 text-[#D90429]" />
                <span className="eyebrow text-white/60">AI Librarian's Response</span>
              </div>
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="h-3 w-2/3 bg-white/10 mb-3 animate-pulse" />
                    <div className="h-3 w-1/2 bg-white/10 mb-8 animate-pulse" />
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-t border-white/10 py-5 first:border-t-0">
                        <div className="h-4 w-3/4 bg-white/10 mb-2 animate-pulse" />
                        <div className="h-3 w-2/3 bg-white/10 animate-pulse" />
                      </div>
                    ))}
                  </motion.div>
                )}
                {!loading && !result && (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Pick a mood and hit generate — the librarian will surface 4 books tuned to your vibe,
                      with an editorial reason for every pick.
                    </p>
                  </motion.div>
                )}
                {!loading && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    data-testid="ai-result"
                  >
                    <p className="font-display italic text-lg md:text-xl text-white/90 leading-snug mb-6">
                      "{result.summary}"
                    </p>
                    <div className="divide-y divide-white/10">
                      {result.picks.map((p, i) => (
                        <motion.div
                          key={`${p.title}-${i}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className="py-5 flex items-start justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="font-mono-alt text-[10px] text-[#D90429]">0{i + 1}</span>
                              <h3 className="font-display font-bold text-lg tracking-tight truncate">{p.title}</h3>
                            </div>
                            <p className="text-xs text-white/50 mt-1 ml-8">{p.author}</p>
                            <p className="text-sm text-white/75 mt-2 ml-8 leading-relaxed">{p.reason}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#D90429] flex-shrink-0 mt-1" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
