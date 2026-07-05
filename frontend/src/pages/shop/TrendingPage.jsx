import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import BookCard from "@/components/BookCard";
import { fetchTrending } from "@/lib/api";

export default function TrendingPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending().then(setBooks).catch(() => setBooks([])).finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Shop / Trending</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Trending<br />Books.
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">
              What the world is reading right now — curated by our librarians, ranked by real reader devotion.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#f6f6f6] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {books.map((b, i) => <BookCard key={b.id} book={b} priority={i < 8} />)}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
