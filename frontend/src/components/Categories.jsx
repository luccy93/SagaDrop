import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Search, Heart, Rocket, Compass, Skull, Feather, Baby,
} from "lucide-react";
import BookCard from "@/components/BookCard";
import { fetchBooks } from "@/lib/api";

const CATS = [
  { name: "Fantasy",   icon: Sparkles },
  { name: "Mystery",   icon: Search },
  { name: "Romance",   icon: Heart },
  { name: "Sci-Fi",    icon: Rocket },
  { name: "Adventure", icon: Compass },
  { name: "Horror",    icon: Skull },
  { name: "Classics",  icon: Feather },
  { name: "Children",  icon: Baby },
];

export default function Categories() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetchBooks({ category: selected, limit: 6 })
      .then(setBooks).catch(() => setBooks([])).finally(() => setLoading(false));
  }, [selected]);

  return (
    <section id="categories" className="py-24 md:py-32 bg-[#f6f6f6]" data-testid="categories-section">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between gap-6 mb-14 md:mb-20">
          <div>
            <p className="eyebrow text-[#D90429] mb-4">● 02 / Browse</p>
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-[-0.02em] leading-[0.95] text-[#0a0a0a]">
              Every Genre.<br />Every Mood.
            </h2>
          </div>
          <p className="hidden md:block max-w-xs text-sm text-[#555] leading-relaxed">
            Pick a genre below to preview books — or{" "}
            <button onClick={() => navigate("/categories")} className="underline text-[#D90429] hover:no-underline bg-transparent border-none p-0 cursor-pointer">
              browse all
            </button>.
          </p>
        </div>

        {/* Category tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-[1px] bg-black/10">
          {CATS.map((c, i) => (
            <motion.button
              key={c.name}
              onClick={() => setSelected(selected === c.name ? null : c.name)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              data-testid={`category-${c.name.toLowerCase()}`}
              className={`relative bg-white p-6 md:p-8 no-underline text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors duration-500 aspect-square flex flex-col justify-between overflow-hidden cursor-pointer ${
                selected === c.name ? "bg-[#0a0a0a] text-white" : ""
              }`}
            >
              <c.icon className="w-8 h-8 text-[#D90429] group-hover:text-white transition-colors" strokeWidth={1.6} />
              <div className="text-left">
                <div className="font-display text-2xl md:text-3xl font-bold tracking-tight">{c.name}</div>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M17 7H8M17 7V16" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Books for selected category */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <div className="flex items-baseline gap-4 mb-8">
              <h3 className="font-display text-3xl font-black tracking-tight">{selected}</h3>
              <button onClick={() => navigate(`/categories`)} className="text-[10px] uppercase tracking-[0.15em] text-[#D90429] hover:underline">
                View all →
              </button>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-white animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {books.map((b, i) => (
                  <BookCard key={b.id} book={b} priority={i < 3} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
