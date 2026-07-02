import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fetchBooks } from "@/lib/api";

const COLLECTIONS = [
  { key: "Editor's Picks", label: "Editor's Picks", copy: "Handpicked stories that our team keeps returning to." },
  { key: "New Releases", label: "New Releases", copy: "Fresh off the press — 2025-2026's most talked-about titles." },
  { key: "Award Winners", label: "Award Winners", copy: "Booker, Pulitzer, Hugo — literature's most decorated shelf." },
  { key: "Collector Editions", label: "Collector Editions", copy: "Slipcased, foil-stamped, signed and numbered." },
  { key: "Limited Editions", label: "Limited Editions", copy: "Rare drops. Once they're gone, they're gone." },
];

export default function Collections() {
  const [active, setActive] = useState(COLLECTIONS[0].key);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks({ collection: active, limit: 6 }).then(setBooks).catch(() => setBooks([]));
  }, [active]);

  return (
    <section id="collections" className="py-24 md:py-32 bg-white" data-testid="collections-section">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-14">
          <div>
            <p className="eyebrow text-[#D90429] mb-4">● 05 / Collections</p>
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-[-0.02em] leading-[0.9]">
              Curated<br />Shelves.
            </h2>
            <div className="mt-12 space-y-1">
              {COLLECTIONS.map((c) => (
                <button
                  key={c.key} onClick={() => setActive(c.key)}
                  data-testid={`collection-${c.key.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  className={`block w-full text-left py-4 border-b border-black/10 transition-colors ${
                    active === c.key ? "text-[#D90429]" : "text-[#0a0a0a] hover:text-[#D90429]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl md:text-3xl font-bold tracking-tight">{c.label}</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${active === c.key ? "translate-x-1" : ""}`} />
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-8 text-sm text-[#555] max-w-sm leading-relaxed">
              {COLLECTIONS.find((c) => c.key === active)?.copy}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {books.map((b, i) => (
              <motion.a
                key={b.id} href="#trending"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.06 }}
                data-testid={`collection-book-${b.id}`}
                className={`group no-underline text-[#0a0a0a] ${i % 5 === 0 ? "md:row-span-2" : ""}`}
              >
                <div className="relative aspect-[3/4] bg-[#f6f6f6] overflow-hidden">
                  <img
                    src={b.cover} alt={b.title} loading="lazy"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format"; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="pt-3">
                  <h3 className="font-display text-base md:text-lg font-bold tracking-tight leading-tight">{b.title}</h3>
                  <p className="text-xs text-[#555] mt-0.5">{b.author}</p>
                </div>
              </motion.a>
            ))}
            {books.length === 0 && (
              <div className="col-span-full text-sm text-[#999]">Loading collection…</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
