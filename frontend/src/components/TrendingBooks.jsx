import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import BookCard from "@/components/BookCard";
import { fetchTrending } from "@/lib/api";

export default function TrendingBooks() {
  const [books, setBooks] = useState([]);
  const scroller = useRef(null);

  useEffect(() => { fetchTrending().then(setBooks).catch(() => setBooks([])); }, []);

  const scroll = (dir) => {
    if (!scroller.current) return;
    scroller.current.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <section id="trending" className="py-24 md:py-32 bg-white" data-testid="trending-section">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p className="eyebrow text-[#D90429] mb-4">● 01 / Bestselling</p>
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-[-0.02em] leading-[0.95] text-[#0a0a0a]">
              Trending<br />Books.
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <p className="max-w-sm text-sm text-[#555] leading-relaxed">
              What the world is reading right now — carefully curated by our librarians,
              ranked by real reader devotion.
            </p>
            <div className="flex gap-2">
              <button onClick={() => scroll(-1)} data-testid="trending-prev" className="w-11 h-11 border border-black/15 grid place-items-center hover:bg-[#0a0a0a] hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scroll(1)} data-testid="trending-next" className="w-11 h-11 border border-black/15 grid place-items-center hover:bg-[#0a0a0a] hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-5 md:gap-7 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {books.map((b, i) => (
            <div key={b.id} className="snap-start flex-shrink-0 w-[260px] md:w-[300px]">
              <BookCard book={b} priority={i < 4} />
            </div>
          ))}
        </div>

        <motion.a
          href="#collections"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a] hover:text-[#D90429] no-underline group"
        >
          View entire catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.a>
      </div>
    </section>
  );
}
