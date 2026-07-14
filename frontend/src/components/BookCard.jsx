import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, ShoppingBag, Star } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

export default function BookCard({ book, priority = false, variant = "default" }) {
  const { addToCart, toggleWishlist, isWished } = useStore();
  const navigate = useNavigate();
  const wished = isWished(book.id);

  return (
    <motion.article
      data-testid={`book-card-${book.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col bg-white"
    >
      <div className="relative overflow-hidden bg-[#f6f6f6] aspect-[3/4]">
        {book.badge && (
          <div className="absolute top-3 left-3 z-10 bg-[#D90429] text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em]">
            {book.badge}
          </div>
        )}
        <button
          onClick={() => { toggleWishlist(book); toast(wished ? "Removed from wishlist" : "Added to wishlist"); }}
          data-testid={`wishlist-${book.id}`}
          className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center bg-white/90 backdrop-blur hover:bg-white transition-colors"
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${wished ? "fill-[#D90429] text-[#D90429]" : "text-[#0a0a0a]"}`} strokeWidth={1.8} />
        </button>
        <img
          src={book.cover}
          alt={book.title}
          loading={priority ? "eager" : "lazy"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format";
          }}
        />
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-white p-3 flex gap-2 border-t border-black/5">
          <button
            onClick={() => { addToCart(book); toast.success(`${book.title} added to cart`); }}
            data-testid={`add-to-cart-${book.id}`}
            className="flex-1 bg-[#D90429] text-white text-[10px] tracking-[0.18em] uppercase font-semibold py-3 hover:bg-[#B00320] transition-colors inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
          </button>
          <button
            onClick={() => navigate(`/book/${book.id}`)}
            className="w-11 grid place-items-center border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
            data-testid={`quick-view-${book.id}`}
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pt-5 flex flex-col gap-1.5">
        <h3 className="font-display text-lg md:text-xl leading-tight font-bold tracking-tight text-[#0a0a0a]">
          {book.title}
        </h3>
        <p className="text-[13px] text-[#555]">{book.author}</p>
        <div className="flex items-center gap-2 mt-1">
          <Star className="w-3.5 h-3.5 fill-[#D90429] text-[#D90429]" />
          <span className="text-[12px] font-semibold text-[#0a0a0a]">{book.rating}</span>
          <span className="text-[11px] text-[#999]">
            ({book.reviews > 1000 ? `${(book.reviews / 1000).toFixed(1)}K` : book.reviews})
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display font-bold text-lg text-[#0a0a0a]">₹{book.price}</span>
          {book.original_price && (
            <span className="text-xs text-[#999] line-through">₹{book.original_price}</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
