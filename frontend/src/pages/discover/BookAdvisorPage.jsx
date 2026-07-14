import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mic, BookOpen, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import BookCard from "@/components/BookCard";
import { getRecommend } from "@/lib/api";

const MOODS   = ["Adventurous", "Romantic", "Mysterious", "Inspirational", "Dark & Gritty", "Light-hearted", "Philosophical", "Thrilling"];
const TONES   = ["Lyrical", "Fast-paced", "Slow burn", "Humorous", "Dramatic", "Poetic", "Cinematic", "Conversational"];

export default function BookAdvisorPage() {
  const [mood, setMood]       = useState("");
  const [tone, setTone]       = useState("");
  const [prompt, setPrompt]   = useState("");
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked]     = useState(false);

  const handleAsk = async () => {
    if (loading) return;
    setLoading(true);
    setAsked(true);
    try {
      const result = await getRecommend(mood || prompt, tone);
      setBooks(Array.isArray(result) ? result : result.books || []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      {/* Hero */}
      <div className="pt-36 pb-16 bg-[#0a0a0a] text-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="eyebrow text-[#D90429] mb-4">● Discover / Book Advisor</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Your Book<br />Advisor.
            </h1>
            <p className="mt-6 text-sm text-white/60 max-w-lg leading-relaxed">
              Describe a feeling, a mood, or what you're craving in a story — and we'll find exactly the right book for you.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="max-w-2xl mx-auto">
            {/* Free-text prompt */}
            <div className="relative mb-8">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. A dark fantasy with morally grey characters and slow-burn romance…"
                className="w-full border border-black/15 px-5 py-4 text-sm focus:outline-none focus:border-[#0a0a0a] resize-none pr-12"
              />
              <Mic className="absolute right-4 top-4 w-4 h-4 text-[#999]" />
            </div>

            {/* Mood chips */}
            <div className="mb-6">
              <p className="eyebrow mb-3">Mood</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button key={m} onClick={() => setMood(mood === m ? "" : m)}
                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] font-semibold border transition-colors ${
                      mood === m ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "border-black/15 hover:border-[#0a0a0a]"
                    }`}>{m}</button>
                ))}
              </div>
            </div>

            {/* Tone chips */}
            <div className="mb-10">
              <p className="eyebrow mb-3">Writing Tone</p>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button key={t} onClick={() => setTone(tone === t ? "" : t)}
                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] font-semibold border transition-colors ${
                      tone === t ? "bg-[#D90429] text-white border-[#D90429]" : "border-black/15 hover:border-[#D90429]"
                    }`}>{t}</button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAsk}
              disabled={loading || (!mood && !prompt)}
              className="w-full bg-[#D90429] hover:bg-[#B00320] disabled:opacity-50 text-white py-4 text-[12px] tracking-[0.18em] uppercase font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Finding your books…" : "Find My Books"}
            </button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {asked && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-20">
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-[#f6f6f6] animate-pulse" />)}
                  </div>
                ) : books.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="w-10 h-10 mx-auto mb-4 text-[#D90429]" />
                    <p className="text-sm text-[#555]">The book advisor is taking a little longer than expected. Try again.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display text-3xl font-black tracking-tight mb-10">Curated for you</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                      {books.map((b, i) => <BookCard key={b.id} book={b} priority={i < 4} />)}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageLayout>
  );
}
