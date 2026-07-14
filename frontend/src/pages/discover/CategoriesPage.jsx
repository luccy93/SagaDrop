import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import BookCard from "@/components/BookCard";
import { fetchBooks } from "@/lib/api";

const CATS = [
  { name: "Fantasy",   emoji: "🧙" },
  { name: "Mystery",   emoji: "🔍" },
  { name: "Romance",   emoji: "❤️" },
  { name: "Sci-Fi",    emoji: "🚀" },
  { name: "Adventure", emoji: "⚔️" },
  { name: "Horror",    emoji: "🕷️" },
  { name: "Classics",  emoji: "🏛️" },
  { name: "Children",  emoji: "🌈" },
];

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts]   = useState({});

  useEffect(() => {
    fetchBooks({ limit: 200 }).then((all) => {
      const c = {};
      CATS.forEach((cat) => { c[cat.name] = all.filter((b) => b.category === cat.name).length; });
      setCounts(c);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    fetchBooks({ category: active, limit: 40 })
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
              Eight genres. Click any to see every book we carry.
            </p>
          </motion.div>

          {/* Category grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {CATS.map((c, i) => (
              <motion.button
                key={c.name}
                onClick={() => setActive(active === c.name ? null : c.name)}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.5 }}
                className={`relative aspect-[4/3] overflow-hidden group text-left border ${
                  active === c.name ? "border-[#D90429]" : "border-black/10"
                }`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="text-4xl">{c.emoji}</span>
                  <span className="font-display font-bold text-lg tracking-tight">{c.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#999]">
                    {counts[c.name] ?? "—"} titles
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Books for selected category */}
          {active && (
            <div>
              <div className="flex items-baseline gap-4 mb-10">
                <h2 className="font-display text-4xl font-black tracking-tight">{active}</h2>
                <span className="text-xs text-[#999]">{books.length} book{books.length !== 1 ? "s" : ""}</span>
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
