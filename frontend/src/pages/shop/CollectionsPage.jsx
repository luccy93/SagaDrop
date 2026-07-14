import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import BookCard from "@/components/BookCard";
import { fetchBooks } from "@/lib/api";

const COLLECTIONS = [
  { key: "Editor's Picks",    label: "Editor's Picks",    copy: "Handpicked stories that our team keeps returning to." },
  { key: "New Releases",      label: "New Releases",      copy: "Fresh off the press — 2025–2026's most talked-about titles." },
  { key: "Award Winners",     label: "Award Winners",     copy: "Booker, Pulitzer, Hugo — literature's most decorated shelf." },
  { key: "Collector Editions",label: "Collector Editions",copy: "Slipcased, foil-stamped, signed and numbered." },
  { key: "Limited Editions",  label: "Limited Editions",  copy: "Rare drops. Once they're gone, they're gone." },
];

const SORT_OPTIONS = [
  { value: "",          label: "Default" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating",     label: "Rating" },
  { value: "title",      label: "Title A–Z" },
];

const CATEGORIES = ["All", "Fantasy", "Mystery", "Romance", "Sci-Fi", "Adventure", "Horror", "Classics", "Children"];

export default function CollectionsPage() {
  const [activeCollection, setActiveCollection] = useState(COLLECTIONS[0].key);
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {
      collection: activeCollection,
      limit: 40,
      sort_by: sortBy || undefined,
      min_price: minPrice ? parseFloat(minPrice) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice) : undefined,
    };
    fetchBooks(params)
      .then((data) => {
        let result = data;
        if (category !== "All") {
          result = data.filter((b) => b.category === category);
        }
        setBooks(result);
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [activeCollection, category, minPrice, maxPrice, sortBy]);

  const activeFilters = [minPrice, maxPrice, category !== "All" ? category : null].filter(Boolean).length;

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12">
            <p className="eyebrow text-[#D90429] mb-4">● Shop / Collections</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Curated<br />Shelves.
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">
              Browse by collection, category, and price — find your next great read.
            </p>
          </motion.div>

          {/* Collection tabs */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-10 border-b border-black/10 pb-1">
            {COLLECTIONS.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCollection(c.key)}
                className={`px-5 py-3 text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors ${
                  activeCollection === c.key
                    ? "text-[#D90429] border-b-2 border-[#D90429]"
                    : "text-[#555] hover:text-[#0a0a0a]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 border border-black/15 px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-[#0a0a0a] hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilters > 0 && (
                <span className="bg-[#D90429] text-white w-5 h-5 rounded-full text-[9px] grid place-items-center">{activeFilters}</span>
              )}
            </button>

            {/* Category buttons (desktop inline) */}
            <div className="hidden md:flex items-center gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-semibold transition-colors ${
                    category === cat ? "bg-[#0a0a0a] text-white" : "text-[#555] hover:text-[#0a0a0a]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-black/15 px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold bg-white outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Expandable filter panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-end gap-6 mb-10 p-6 bg-[#f6f6f6]"
            >
              {/* Price range */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#555] mb-2">Price Range</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="0" placeholder="Min ₹"
                    value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                    className="w-24 border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-2 text-sm"
                  />
                  <span className="text-[#999]">–</span>
                  <input
                    type="number" min="0" placeholder="Max ₹"
                    value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-24 border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-2 text-sm"
                  />
                </div>
              </div>

              {/* Category (mobile) */}
              <div className="md:hidden">
                <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#555] mb-2">Category</p>
                <div className="flex flex-wrap gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-semibold transition-colors ${
                        category === cat ? "bg-[#0a0a0a] text-white" : "bg-white border border-black/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); setCategory("All"); setSortBy(""); }}
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] font-semibold text-[#555] hover:text-[#D90429] transition-colors"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            </motion.div>
          )}

          {/* Results count */}
          <p className="text-[11px] text-[#555] uppercase tracking-[0.15em] mb-6">
            {loading ? "Loading…" : `${books.length} book${books.length !== 1 ? "s" : ""}`}
          </p>

          {/* Book grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#f6f6f6] animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-[#999]">No books match your filters — try adjusting them.</p>
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); setCategory("All"); setSortBy(""); }}
                className="mt-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-[#D90429] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {books.map((b, i) => (
                <BookCard key={b.id} book={b} priority={i < 8} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
