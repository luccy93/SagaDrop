import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import BookCard from "@/components/BookCard";
import { searchBooks } from "@/lib/api";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) { setBooks([]); setLoading(false); return; }
    setLoading(true);
    searchBooks(q).then(setBooks).catch(() => setBooks([])).finally(() => setLoading(false));
  }, [q]);

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Search</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              {q ? `"${q}"` : "Search"}
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">
              {loading ? "Searching…" : q ? `${books.length} result${books.length !== 1 ? "s" : ""} found` : "Enter a keyword to find books."}
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#f6f6f6] animate-pulse" />
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {books.map((b, i) => <BookCard key={b.id} book={b} priority={i < 8} />)}
            </div>
          ) : q ? (
            <div className="text-center py-24">
              <Search className="w-12 h-12 mx-auto text-[#ccc] mb-4" strokeWidth={1} />
              <p className="text-lg text-[#999]">No books found for "{q}"</p>
              <Link to="/categories" className="inline-block mt-4 text-sm underline text-[#D90429]">Browse categories</Link>
            </div>
          ) : null}
        </div>
      </section>
    </PageLayout>
  );
}
