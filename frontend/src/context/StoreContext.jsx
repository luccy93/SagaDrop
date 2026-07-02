import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAccountState, saveAccountState } from "@/lib/api";

const StoreContext = createContext(null);
const KEY_CART = "sagadrop:cart";
const KEY_WISH = "sagadrop:wishlist";

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY_CART) || "[]"); }
    catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY_WISH) || "[]"); }
    catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const { user } = useAuth();
  const syncedRef = useRef(false);

  useEffect(() => { localStorage.setItem(KEY_CART, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(KEY_WISH, JSON.stringify(wishlist)); }, [wishlist]);

  // Load account state on login; local state wins if server is empty
  useEffect(() => {
    if (user && typeof user === "object") {
      fetchAccountState()
        .then((s) => {
          if (s.cart?.length) setCart(s.cart);
          if (s.wishlist?.length) setWishlist(s.wishlist);
        })
        .catch(() => {})
        .finally(() => { syncedRef.current = true; });
    } else {
      syncedRef.current = false;
    }
  }, [user]);

  // Persist cart/wishlist to account (debounced)
  useEffect(() => {
    if (!user || typeof user !== "object" || !syncedRef.current) return;
    const t = setTimeout(() => {
      saveAccountState({ cart, wishlist }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [cart, wishlist, user]);

  const addToCart = (book, qty = 1) => {
    setCart((cur) => {
      const found = cur.find((c) => c.id === book.id);
      if (found) return cur.map((c) => c.id === book.id ? { ...c, qty: c.qty + qty } : c);
      return [...cur, { id: book.id, title: book.title, author: book.author, price: book.price, cover: book.cover, qty }];
    });
    setCartOpen(true);
  };
  const removeFromCart = (id) => setCart((cur) => cur.filter((c) => c.id !== id));
  const updateQty = (id, qty) => setCart((cur) =>
    qty <= 0 ? cur.filter((c) => c.id !== id) : cur.map((c) => c.id === id ? { ...c, qty } : c)
  );
  const clearCart = () => setCart([]);

  const toggleWishlist = (book) => {
    setWishlist((cur) => {
      const idx = cur.findIndex((c) => c.id === book.id);
      if (idx >= 0) return cur.filter((c) => c.id !== book.id);
      return [...cur, { id: book.id, title: book.title, author: book.author, price: book.price, cover: book.cover }];
    });
  };
  const isWished = (id) => wishlist.some((w) => w.id === id);

  const totals = useMemo(() => {
    const items = cart.reduce((s, c) => s + c.qty, 0);
    const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
    return { items, subtotal };
  }, [cart]);

  const value = {
    cart, wishlist, totals,
    addToCart, removeFromCart, updateQty, clearCart,
    toggleWishlist, isWished,
    cartOpen, setCartOpen, wishOpen, setWishOpen,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};
