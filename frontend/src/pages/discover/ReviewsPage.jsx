import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, MessageSquare } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { fetchTrending, createReview, fetchReviews } from "@/lib/api";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const STATIC_REVIEWS = [
  { name: "Aanya Mehta", avatar: "AM", rating: 5, book: "The Song of Achilles", text: "Madeline Miller writes with such aching beauty. I cried on the last page and immediately reread the first chapter.", date: "June 2026", location: "Mumbai" },
  { name: "Rohan Verma", avatar: "RV", rating: 5, book: "Ready Player One", text: "Pure nostalgia fuel. Cline packs every page with references that hit just right.", date: "May 2026", location: "Bangalore" },
  { name: "Priya Krishnamurthy", avatar: "PK", rating: 4, book: "Project Hail Mary", text: "The science is mind-bending, the humour disarming, and the friendship at the core genuinely moving.", date: "May 2026", location: "Chennai" },
  { name: "Dev Sharma", avatar: "DS", rating: 5, book: "The Way of Kings", text: "Sanderson's world-building is in another dimension. Stormlight is the fantasy series of our generation.", date: "April 2026", location: "Delhi" },
  { name: "Meera Nair", avatar: "MN", rating: 5, book: "It Ends with Us", text: "CoHo makes you feel every emotion at full volume. I haven't been this affected by a book in years.", date: "April 2026", location: "Kochi" },
  { name: "Arjun Patel", avatar: "AP", rating: 4, book: "Dune", text: "Herbert built a universe that feels genuinely real. Dense, political, ecological.", date: "March 2026", location: "Ahmedabad" },
];

function Stars({ n, interactive, onChange }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button" disabled={!interactive}
          onClick={() => onChange?.(i + 1)}
          className={`w-4 h-4 ${interactive ? "cursor-pointer hover:scale-110" : ""} transition-transform ${i < n ? "text-[#D90429]" : "text-[#ddd]"}`}>
          <Star className={`w-full h-full ${i < n ? "fill-current" : ""}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [liveReviews, setLiveReviews] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrending().then(setBooks).catch(() => {});
    // Load reviews for first few books
    fetchReviews("b1").then(setLiveReviews).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook || !comment.trim()) { toast.error("Select a book and write a review."); return; }
    setSubmitting(true);
    try {
      await createReview({ book_id: selectedBook, rating, comment: comment.trim() });
      toast.success("Review submitted!");
      setComment("");
      const updated = await fetchReviews(selectedBook);
      setLiveReviews(updated);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to submit review");
    } finally { setSubmitting(false); }
  };

  const allReviews = [
    ...liveReviews.map((r) => ({
      id: r.id,
      name: r.user_name,
      avatar: (r.user_name || "U")[0].toUpperCase(),
      rating: r.rating,
      book: books.find((b) => b.id === r.book_id)?.title || r.book_id,
      text: r.comment,
      date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "",
      location: "",
    })),
    ...STATIC_REVIEWS,
  ];

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Discover / Reviews</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">Reader Stories.</h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">Real words from real readers. Every review is a story about a story.</p>
          </motion.div>

          {/* Write a review */}
          <div className="border border-black/10 p-8 mb-16">
            <h2 className="font-display text-2xl font-black mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Write a Review</h2>
            {!user ? (
              <p className="text-sm text-[#999]"><Link to="/login" className="underline text-[#D90429]">Sign in</Link> to leave a review.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Book</label>
                  <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)}
                    className="w-full border border-black/10 px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#0a0a0a]">
                    <option value="">Select a book…</option>
                    {books.map((b) => <option key={b.id} value={b.id}>{b.title} by {b.author}</option>)}
                  </select>
                </div>
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Rating</label>
                  <Stars n={rating} interactive onChange={setRating} />
                </div>
                <div>
                  <label className="eyebrow text-[10px] text-[#777] uppercase tracking-[0.14em] block mb-1">Review</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={2000}
                    className="w-full border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a] resize-none" placeholder="What did you think?" />
                </div>
                <button type="submit" disabled={submitting}
                  className="bg-[#0a0a0a] text-white px-6 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#1a1a1a] disabled:opacity-50">
                  {submitting ? "Posting…" : "Post Review"}
                </button>
              </form>
            )}
          </div>

          {/* All reviews */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allReviews.map((r, i) => (
              <motion.article key={r.name + i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: Math.min(i, 20) * 0.05, duration: 0.6 }}
                className="border border-black/10 p-8 flex flex-col gap-5">
                <Quote className="w-7 h-7 text-[#D90429]" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-[#333] flex-1">"{r.text}"</p>
                <div>
                  <Stars n={r.rating} />
                  <p className="mt-2 text-[11px] text-[#D90429] uppercase tracking-[0.14em] font-semibold">{r.book}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                  <div className="w-9 h-9 rounded-full bg-[#0a0a0a] grid place-items-center text-white text-[11px] font-bold flex-shrink-0">{r.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{r.name}</p>
                    <p className="text-[11px] text-[#999]">{r.location}{r.location && r.date ? " · " : ""}{r.date}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
