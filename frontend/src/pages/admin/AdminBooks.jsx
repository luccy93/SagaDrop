import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, Star } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { fetchTrending, fetchBooks } from "@/lib/api";

const CATEGORIES = ["All", "Fantasy", "Mystery", "Romance", "Sci-Fi", "Adventure", "Horror", "Historical", "Classics"];

export default function AdminBooks() {
  const [books, setBooks]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState("");
  const [cat, setCat]           = useState("All");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    // Load all books from trending + collections
    Promise.all([
      fetchTrending(),
      fetchBooks({ collection: "New Releases", limit: 40 }),
      fetchBooks({ collection: "Award Winners", limit: 40 }),
      fetchBooks({ collection: "Editor's Picks", limit: 40 }),
    ])
      .then(([t, nr, aw, ep]) => {
        const all = [...t, ...nr, ...aw, ...ep];
        const unique = Array.from(new Map(all.map((b) => [b.id, b])).values());
        setBooks(unique);
        setFiltered(unique);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let out = books;
    if (cat !== "All") out = out.filter((b) => b.category === cat);
    if (search) out = out.filter((b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(out);
  }, [search, cat, books]);

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">Books</h1>
          <p className="text-sm text-[#555] mt-1">{books.length} titles in catalog</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-black/10 p-5 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or author…"
            className="w-full pl-10 pr-4 py-2.5 border border-black/10 text-sm focus:outline-none focus:border-[#0a0a0a]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[#999]" />
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] font-semibold border transition-colors ${
                cat === c ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "border-black/15 hover:border-[#0a0a0a]"
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafafa] border-b border-black/10">
                {["Cover", "Title", "Author", "Category", "Collection", "Price", "Rating", "Reviews"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 eyebrow text-[#777]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-t border-black/5">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-[#f0f0f0] animate-pulse rounded-sm" /></td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-[#999]">Failed to load books — check API connectivity.</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-[#999]">No books match your search.</td></tr>
              ) : (
                filtered.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i, 20) * 0.02, duration: 0.3 }}
                    className={`border-t border-black/5 hover:bg-[#fafafa] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#fdfdfd]"}`}
                  >
                    <td className="px-5 py-3">
                      <div className="w-8 h-11 bg-[#f0f0f0] overflow-hidden">
                        <img src={b.cover} alt={b.title} className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold max-w-[180px]">
                      <p className="truncate">{b.title}</p>
                      {b.badge && <span className="bg-[#D90429] text-white text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 mt-1 inline-block">{b.badge}</span>}
                    </td>
                    <td className="px-5 py-3 text-[#555]">{b.author}</td>
                    <td className="px-5 py-3"><span className="bg-[#f0f0f0] text-[#555] text-[10px] uppercase tracking-[0.1em] px-2.5 py-1">{b.category}</span></td>
                    <td className="px-5 py-3 text-[#777] text-xs">{b.collection || "—"}</td>
                    <td className="px-5 py-3 font-bold text-[#0a0a0a]">₹{b.price}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-[#D90429] font-semibold">
                        <Star className="w-3 h-3 fill-current" />{b.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#777]">
                      {b.reviews > 1000 ? `${(b.reviews / 1000).toFixed(1)}K` : b.reviews}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-black/10 bg-[#fafafa] flex items-center justify-between">
          <p className="text-xs text-[#999]">Showing {filtered.length} of {books.length} books</p>
          <p className="text-xs text-[#999]">Source: catalog.py (read-only in this demo)</p>
        </div>
      </div>
    </AdminLayout>
  );
}
