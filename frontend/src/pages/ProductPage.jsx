import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Heart, ShoppingBag, Loader2, BookOpen } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import BookCard from "@/components/BookCard";
import { fetchBook, fetchBooks } from "@/lib/api";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format";

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isWished } = useStore();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchBook(id)
      .then((data) => {
        setBook(data);
        document.title = `${data.title} — SagaDrop`;
        fetchBooks({ category: data.category, limit: 5 })
          .then((all) => setRelated(all.filter((b) => b.id !== data.id).slice(0, 4)))
          .catch(() => {});
      })
      .catch((e) => setError(e?.response?.status === 404 ? "notfound" : "network"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="grid place-items-center py-52"><Loader2 className="w-8 h-8 animate-spin text-[#D90429]" /></div>
      </PageLayout>
    );
  }

  if (error === "notfound") {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto px-6 py-40 text-center">
          <p className="eyebrow text-[#D90429] mb-4">● 404</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">Book Not Found.</h1>
          <p className="mt-4 text-[#555]">This book may have been removed or doesn't exist.</p>
          <Link to="/" className="mt-8 inline-flex items-center gap-2 bg-[#D90429] text-white px-8 py-4 no-underline text-[12px] uppercase tracking-[0.15em] font-semibold">
            Back to SagaDrop <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (error === "network" || !book) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto px-6 py-40 text-center">
          <p className="eyebrow text-[#D90429] mb-4">● Connection Issue</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">Couldn't Load Book.</h1>
          <p className="mt-4 text-[#555]">Check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="mt-8 inline-flex items-center gap-2 bg-[#0a0a0a] hover:bg-[#333] text-white px-8 py-4 text-[12px] uppercase tracking-[0.15em] font-semibold">Retry</button>
        </div>
      </PageLayout>
    );
  }

  const wished = isWished(book.id);

  return (
    <PageLayout>
      <section className="pt-28 pb-24 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[#555] hover:text-[#D90429] no-underline mb-12 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
          </Link>

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            {/* Left — Cover */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="flex justify-center">
              <div className="relative w-full max-w-[420px]">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
                  onError={(e) => { e.currentTarget.src = FALLBACK_COVER; }}
                />
                {book.badge && (
                  <div className="absolute top-4 left-4 bg-[#D90429] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]">
                    {book.badge}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right — Details */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              {/* Category + Collection */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1.5 bg-[#0a0a0a] text-white text-[9px] uppercase tracking-[0.15em] font-semibold">{book.category}</span>
                {book.collection && (
                  <span className="px-3 py-1.5 border border-black/15 text-[9px] uppercase tracking-[0.15em] font-semibold">{book.collection}</span>
                )}
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.02em] leading-[0.92]">{book.title}</h1>
              <p className="mt-3 text-lg text-[#555]">by {book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-5">
                <Star className="w-4 h-4 fill-[#D90429] text-[#D90429]" />
                <span className="text-sm font-semibold">{book.rating}</span>
                <span className="text-xs text-[#999]">({book.reviews > 1000 ? `${(book.reviews / 1000).toFixed(1)}K` : book.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-8 flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold">₹{book.price}</span>
                {book.original_price && (
                  <span className="text-base text-[#999] line-through">₹{book.original_price}</span>
                )}
              </div>

              {/* Description */}
              <p className="mt-6 text-sm text-[#555] leading-relaxed max-w-lg">{book.description}</p>

              {/* Meta */}
              <div className="mt-8 border-t border-black/10 pt-6 grid grid-cols-2 gap-4 max-w-xs text-[11px] uppercase tracking-[0.15em]">
                <div><span className="text-[#999]">Year</span><p className="font-semibold mt-0.5">{book.year}</p></div>
                <div><span className="text-[#999]">Category</span><p className="font-semibold mt-0.5">{book.category}</p></div>
                {book.collection && (
                  <div className="col-span-2"><span className="text-[#999]">Collection</span><p className="font-semibold mt-0.5">{book.collection}</p></div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { addToCart(book); toast.success(`${book.title} added to cart`); }}
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-[#D90429] hover:bg-[#B00320] text-white px-8 py-4 text-[13px] font-semibold tracking-[0.15em] uppercase transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={() => { toggleWishlist(book); toast(wished ? "Removed from wishlist" : "Added to wishlist"); }}
                  className="inline-flex items-center justify-center gap-2 border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white px-8 py-4 text-[13px] uppercase tracking-[0.15em] font-semibold transition-colors"
                >
                  <Heart className={`w-4 h-4 ${wished ? "fill-[#D90429] text-[#D90429]" : ""}`} strokeWidth={1.8} />
                  {wished ? "Wishlisted" : "Wishlist"}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Related Books */}
          {related.length > 0 && (
            <div className="mt-24">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="eyebrow text-[#D90429] mb-3">● More in {book.category}</p>
                  <h2 className="font-display text-3xl md:text-4xl font-black tracking-[-0.02em]">Related Books.</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {related.map((b, i) => (
                  <BookCard key={b.id} book={b} priority={i < 2} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
