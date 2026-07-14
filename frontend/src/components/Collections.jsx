import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BookCard from "@/components/BookCard";
import { fetchBooks } from "@/lib/api";

const COLLECTIONS = [
  { key: "Editor's Picks",    label: "Editor's Picks",    copy: "Handpicked stories that our team keeps returning to." },
  { key: "New Releases",      label: "New Releases",      copy: "Fresh off the press — 2025–2026's most talked-about titles." },
  { key: "Award Winners",     label: "Award Winners",     copy: "Booker, Pulitzer, Hugo — literature's most decorated shelf." },
  { key: "Collector Editions",label: "Collector Editions",copy: "Slipcased, foil-stamped, signed and numbered." },
  { key: "Limited Editions",  label: "Limited Editions",  copy: "Rare drops. Once they're gone, they're gone." },
];

export default function Collections() {
  const [active, setActive] = useState(COLLECTIONS[0].key);
  const [books, setBooks]   = useState([]);

  useEffect(() => {
    fetchBooks({ collection: active, limit: 6 }).then(setBooks).catch(() => setBooks([]));
  }, [active]);

  return (
    <section id="collections" className="py-24 md:py-32 bg-white" data-testid="collections-section">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-14 items-start">

          {/* Left — collection selector */}
          <div>
            <p className="eyebrow text-[#D90429] mb-4">● 05 / Collections</p>
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-[-0.02em] leading-[0.9]">
              Curated<br />Shelves.
            </h2>
            <div className="mt-12 space-y-0">
              {COLLECTIONS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActive(c.key)}
                  data-testid={`collection-${c.key.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  className={`block w-full text-left py-4 border-b border-black/10 transition-colors ${
                    active === c.key ? "text-[#D90429]" : "text-[#0a0a0a] hover:text-[#D90429]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl md:text-3xl font-bold tracking-tight">{c.label}</span>
                    <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform ${active === c.key ? "translate-x-1" : ""}`} />
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-8 text-sm text-[#555] max-w-sm leading-relaxed">
              {COLLECTIONS.find((c) => c.key === active)?.copy}
            </p>

            <Link
              to="/collections"
              className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[#0a0a0a] hover:text-[#D90429] no-underline group transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right — uniform 3-column book grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-6 items-start">
            {books.length === 0 && (
              <div className="col-span-full text-sm text-[#999] py-12 text-center">Loading collection…</div>
            )}
            {books.map((b, i) => (
              <BookCard key={b.id} book={b} priority={i < 3} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
