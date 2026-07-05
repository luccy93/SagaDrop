import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import BookCard from "@/components/BookCard";
import { fetchBooks } from "@/lib/api";

const CATS = [
  { name: "Fantasy",    emoji: "🧙", color: "#6C3082" },
  { name: "Mystery",    emoji: "🔍", color: "#1B2A4A" },
  { name: "Romance",    emoji: "❤️",  color: "#D90429" },
  { name: "Sci-Fi",     emoji: "🚀", color: "#0A2463" },
  { name: "Adventure",  emoji: "⚔️",  color: "#2E7D32" },
  { name: "Horror",     emoji: "🕷️",  color: "#1A1A1A" },
  { name: "Historical", emoji: "📜", color: "#795548" },
  { name: "Children",   emoji: "🌈", color: "#F57C00" },
  { name: "Manga",      emoji: "✏️",  color: "#E91E63" },
  { name: "Classics",   emoji: "🏛️", color: "#455A64" },
];

export default function CategoriesPage() {
  const [active, setActive] = useState(null);
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    fetchBooks({ category: active, limit: 20 })
      .then(setBooks).catch(() => setBooks([])).finally(() => setLoading(false));
  }, [active]);

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Discover / Categories</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Every<br />Genre.
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">
              Ten worlds to get lost in. Pick your genre and find your next obsession.
            </p>
          </motion.div>

          {/* Category grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-16">
            {CATS.map((c, i) => (
              <motion.button
                key={c.name}
                onClick={() => setActive(active === c.name ? null : c.name)}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.5 }}
                className="relative aspect-[4/3] overflow-hidden group text-left"
                style={{ backgroundColor: active === c.name ? c.color : "#f6f6f6" }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all">
                  <span className="text-3xl">{c.emoji}</span>
                  <span
                    className="font-display font-bold text-sm tracking-tight"
                    style={{ color: active === c.name ? "#fff" : "#0a0a0a" }}
                  >
                    {c.name}
                  </span>
                </div>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: c.color, mixBlendMode: "multiply" }}
                />
              </motion.button>
            ))}
          </div>

          {/* Books for selected category */}
          {active && (
            <div>
              <div className="flex items-baseline gap-4 mb-10">
                <h2 className="font-display text-4xl font-black tracking-tight">{active}</h2>
                <button onClick={() => setActive(null)} className="text-xs text-[#999] hover:text-[#D90429] uppercase tracking-widest">Clear ×</button>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-[#f6f6f6] animate-pulse" />)}
                </div>
              ) : books.length === 0 ? (
                <p className="text-sm text-[#999] py-12">No books found in this category yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                  {books.map((b, i) => <BookCard key={b.id} book={b} priority={i < 8} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
