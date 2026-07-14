import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Star, Plus, Pencil, Trash2, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { fetchTrending, fetchBooks, createBook, updateBook, deleteBook, uploadCover } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = ["All", "Fantasy", "Mystery", "Romance", "Sci-Fi", "Adventure", "Horror", "Historical", "Classics", "Children"];
const EMPTY_FORM = {
  title: "", author: "", price: "", original_price: "", rating: "0", reviews: "0",
  cover: "", category: "Fantasy", badge: "", description: "", collection: "", year: "2025",
};

export default function AdminBooks() {
  const [books, setBooks]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState("");
  const [cat, setCat]           = useState("All");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [modal, setModal]       = useState(null); // null | "add" | book-object (edit)
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      fetchTrending(),
      fetchBooks({ collection: "New Releases", limit: 40 }),
      fetchBooks({ collection: "Award Winners", limit: 40 }),
      fetchBooks({ collection: "Editor's Picks", limit: 40 }),
      fetchBooks({ collection: "Collector Editions", limit: 40 }),
    ])
      .then((results) => {
        const all = results.flat();
        const unique = Array.from(new Map(all.map((b) => [b.id, b])).values());
        setBooks(unique);
        setFiltered(unique);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let out = books;
    if (cat !== "All") out = out.filter((b) => b.category === cat);
    if (search) out = out.filter((b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(out);
  }, [search, cat, books]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (b) => {
    setForm({
      title: b.title, author: b.author, price: String(b.price), original_price: b.original_price ? String(b.original_price) : "",
      rating: String(b.rating), reviews: String(b.reviews), cover: b.cover,
      category: b.category, badge: b.badge || "", description: b.description || "",
      collection: b.collection || "", year: String(b.year),
    });
    setModal(b);
  };

  const handleSave = async () => {
    const payload = {
      title: form.title, author: form.author,
      price: parseFloat(form.price) || 0, original_price: form.original_price ? parseFloat(form.original_price) : null,
      rating: parseFloat(form.rating) || 0, reviews: parseInt(form.reviews) || 0,
      cover: form.cover, category: form.category, badge: form.badge || null,
      description: form.description, collection: form.collection || null, year: parseInt(form.year) || 2025,
    };
    if (!payload.title || !payload.author || !payload.price) {
      toast.error("Title, author, and price are required."); return;
    }
    setSaving(true);
    try {
      if (modal === "add") {
        await createBook(payload);
        toast.success("Book created");
      } else {
        await updateBook(modal.id, payload);
        toast.success("Book updated");
      }
      setModal(null);
      load();
    } catch (e) {
      toast.error("Failed to save book");
    } finally { setSaving(false); }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete "${b.title}"?`)) return;
    try {
      await deleteBook(b.id);
      toast.success("Book deleted");
      load();
    } catch (e) {
      toast.error("Failed to delete book");
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">Books</h1>
          <p className="text-sm text-[#555] mt-1">{books.length} titles in catalog</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#1a1a1a] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Book
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-black/10 p-5 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or author…"
            className="w-full pl-10 pr-4 py-2.5 border border-black/10 text-sm focus:outline-none focus:border-[#0a0a0a]" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[#999]" />
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] font-semibold border transition-colors ${cat === c ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "border-black/15 hover:border-[#0a0a0a]"}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafafa] border-b border-black/10">
                {["Cover", "Title", "Author", "Category", "Collection", "Price", "Rating", "Reviews", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 eyebrow text-[#777]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-t border-black/5">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-[#f0f0f0] animate-pulse rounded-sm" /></td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center text-sm text-[#999]">Failed to load books — <button onClick={load} className="underline text-[#D90429]">retry</button></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center text-sm text-[#999]">No books match your search.</td></tr>
              ) : (
                filtered.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i, 20) * 0.02, duration: 0.3 }}
                    className={`border-t border-black/5 hover:bg-[#fafafa] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#fdfdfd]"}`}>
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
                    <td className="px-5 py-3"><span className="flex items-center gap-1 text-[#D90429] font-semibold"><Star className="w-3 h-3 fill-current" />{b.rating}</span></td>
                    <td className="px-5 py-3 text-[#777]">{b.reviews > 1000 ? `${(b.reviews / 1000).toFixed(1)}K` : b.reviews}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-[#f0f0f0] transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(b)} className="p-1.5 hover:bg-[#f0f0f0] transition-colors text-[#D90429]" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-black/10 bg-[#fafafa] flex items-center justify-between">
          <p className="text-xs text-[#999]">Showing {filtered.length} of {books.length} books</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
            onClick={() => setModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-black tracking-tight">{modal === "add" ? "Add Book" : "Edit Book"}</h2>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-[#f0f0f0]"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {["title", "author", "price", "original_price", "rating", "reviews", "year"].map((f) => (
                  <div key={f}>
                    <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">{f.replace(/_/g, " ")}</label>
                    <input value={form[f]} onChange={(e) => set(f, e.target.value)}
                      className="w-full border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a]" />
                  </div>
                ))}
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Category</label>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)}
                    className="w-full border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a] bg-white">
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {["badge", "description", "collection"].map((f) => (
                  <div key={f}>
                    <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">{f}</label>
                    {f === "description" ? (
                      <textarea value={form[f]} onChange={(e) => set(f, e.target.value)} rows={3}
                        className="w-full border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a] resize-none" />
                    ) : (
                      <input value={form[f]} onChange={(e) => set(f, e.target.value)}
                        className="w-full border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a]" />
                    )}
                  </div>
                ))}
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Cover URL</label>
                  <div className="flex gap-2">
                    <input value={form.cover} onChange={(e) => set("cover", e.target.value)}
                      className="flex-1 border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a]" />
                    <label className="cursor-pointer bg-[#f0f0f0] border border-black/10 px-3 py-2 text-xs uppercase tracking-[0.1em] font-semibold hover:bg-[#e0e0e0] transition-colors whitespace-nowrap self-stretch flex items-center">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        try { const r = await uploadCover(file); set("cover", r.url); toast.success("Uploaded"); } catch { toast.error("Upload failed"); }
                      }} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setModal(null)}
                  className="flex-1 border border-black/10 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#f0f0f0]">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-[#0a0a0a] text-white py-2.5 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#1a1a1a] disabled:opacity-50">
                  {saving ? "Saving…" : modal === "add" ? "Create" : "Update"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
