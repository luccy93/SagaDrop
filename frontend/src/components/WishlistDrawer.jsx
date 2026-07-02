import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

export default function WishlistDrawer() {
  const { wishlist, toggleWishlist, addToCart, wishOpen, setWishOpen } = useStore();

  return (
    <AnimatePresence>
      {wishOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
          onClick={() => setWishOpen(false)}
        >
          <motion.aside
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="wishlist-drawer"
            className="absolute top-0 right-0 h-full w-full sm:w-[460px] bg-white flex flex-col"
          >
            <div className="flex items-center justify-between px-8 h-[72px] border-b border-black/5">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#D90429]" />
                <span className="eyebrow">Wishlist</span>
                <span className="eyebrow text-[#D90429]">· {wishlist.length}</span>
              </div>
              <button onClick={() => setWishOpen(false)} data-testid="close-wishlist-btn"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {wishlist.length === 0 ? (
                <div className="text-center py-24 text-sm text-[#555]">
                  <Heart className="w-8 h-8 mx-auto mb-4 text-[#D90429]" />
                  Save the books your heart lingers on.
                </div>
              ) : (
                <ul className="space-y-6">
                  {wishlist.map((item) => (
                    <li key={item.id} className="flex gap-4 border-b border-black/5 pb-6">
                      <div className="w-20 h-28 bg-[#f6f6f6] overflow-hidden flex-shrink-0">
                        <img src={item.cover} alt={item.title}
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200"; }}
                          className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-base leading-tight truncate">{item.title}</h3>
                        <p className="text-xs text-[#555] mt-1">{item.author}</p>
                        <div className="mt-3 font-display font-bold text-sm">₹{item.price.toLocaleString()}</div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => { addToCart(item); toast.success("Moved to cart"); }}
                            className="inline-flex items-center gap-1 bg-[#0a0a0a] text-white px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-semibold"
                          >
                            <ShoppingBag className="w-3 h-3" /> Add
                          </button>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="text-[10px] uppercase tracking-[0.15em] text-[#999] hover:text-[#D90429]"
                          >Remove</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
