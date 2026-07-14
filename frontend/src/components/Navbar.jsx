import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Heart, ShoppingBag, Menu, X, BookOpen, LogOut } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "Home", href: "/" },
  { label: "Trending", href: "/#trending" },
  { label: "Categories", href: "/#categories" },
  { label: "Recommend", href: "/#recommendation-studio" },
  { label: "Customize", href: "/#customizer" },
  { label: "Collections", href: "/#collections" },
  { label: "Authors", href: "/#authors" },
];

export default function Navbar() {
  const { totals, wishlist, setCartOpen, setWishOpen } = useStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        data-testid="navbar"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-white/85 backdrop-blur-xl border-b border-black/5" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">
          <a href="/" data-testid="logo" className="flex items-center gap-2 no-underline text-black">
            <BookOpen className="w-6 h-6 text-[#D90429]" strokeWidth={2.2} />
            <span className="font-display text-[22px] font-black tracking-tight">
              SAGA<span className="text-[#D90429]">DROP</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-9">
            {links.slice(0, 6).map((l) => (
              <a
                key={l.label}
                href={l.href}
                data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-[13px] font-medium tracking-wide text-[#0a0a0a] hover:text-[#D90429] transition-colors no-underline relative group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D90429] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              data-testid="search-btn"
              className="w-10 h-10 grid place-items-center hover:text-[#D90429] transition-colors"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </button>
            {user && typeof user === "object" ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  data-testid="profile-btn"
                  className="w-9 h-9 grid place-items-center bg-[#0a0a0a] text-white rounded-full text-[13px] font-bold hover:bg-[#D90429] transition-colors"
                  aria-label="Account"
                >
                  {(user.name || "U")[0].toUpperCase()}
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      data-testid="profile-menu"
                      className="absolute right-0 top-12 w-60 bg-white border border-black/10 shadow-xl p-5 z-50"
                    >
                      <div className="font-display font-bold text-base truncate" data-testid="profile-menu-name">{user.name}</div>
                      <div className="text-xs text-[#777] truncate mt-0.5">{user.email}</div>
                      <button onClick={() => { navigate("/dashboard"); setProfileOpen(false); }}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#D90429] hover:bg-[#B00320] text-white py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors">
                        <BookOpen className="w-3.5 h-3.5" /> Dashboard
                      </button>
                      <button onClick={() => { navigate("/account"); setProfileOpen(false); }}
                        className="mt-2 w-full inline-flex items-center justify-center gap-2 border border-black/10 hover:bg-[#f0f0f0] py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors">
                        <User className="w-3.5 h-3.5" /> My Account
                      </button>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        data-testid="logout-btn"
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#0a0a0a] hover:bg-[#D90429] text-white py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                data-testid="profile-btn"
                className="w-10 h-10 grid place-items-center hover:text-[#D90429] transition-colors"
                aria-label="Sign in"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </button>
            )}
            <button
              onClick={() => setWishOpen(true)}
              data-testid="wishlist-btn"
              className="w-10 h-10 grid place-items-center hover:text-[#D90429] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 grid place-items-center bg-[#D90429] text-white text-[10px] font-bold rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              data-testid="cart-btn"
              className="w-10 h-10 grid place-items-center hover:text-[#D90429] transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {totals.items > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 grid place-items-center bg-[#D90429] text-white text-[10px] font-bold rounded-full">
                  {totals.items}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              data-testid="menu-btn"
              className="w-10 h-10 grid place-items-center hover:text-[#D90429] transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-[20px] h-[20px]" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-black/5 bg-white/95 backdrop-blur-xl"
            >
              <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-5 flex items-center gap-3">
                <Search className="w-5 h-5 text-[#555]" />
                <input
                  data-testid="search-input"
                  autoFocus
                  placeholder="Search titles, authors, genres…"
                  className="flex-1 bg-transparent outline-none text-lg placeholder:text-[#999]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
                      setSearchOpen(false);
                    }
                  }}
                />
                <button onClick={() => setSearchOpen(false)} className="text-xs uppercase tracking-widest">Close</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          >
            <motion.aside
              onClick={(e) => e.stopPropagation()}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white flex flex-col"
              data-testid="hamburger-drawer"
            >
              <div className="flex items-center justify-between px-8 h-[72px] border-b border-black/5">
                <span className="eyebrow">Menu</span>
                <button onClick={() => setMenuOpen(false)} data-testid="close-menu-btn"><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex-1 px-8 py-10 flex flex-col gap-6">
                {user && typeof user === "object" && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
                    className="font-display text-4xl md:text-5xl font-black text-[#D90429] hover:text-[#B00320] transition-colors text-left"
                  >
                    Dashboard
                  </motion.button>
                )}
                {links.map((l, i) => (
                  <motion.a
                    key={l.label}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (user && typeof user === "object" ? 1 : 0) * 0.05 + i * 0.05 }}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-4xl md:text-5xl font-black hover:text-[#D90429] transition-colors no-underline text-black"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>
              <div className="px-8 py-6 border-t border-black/5 flex items-center justify-between">
                <span className="eyebrow">Follow</span>
                <div className="flex gap-4 text-xs font-medium">
                  <a href="https://www.instagram.com/sagadrop" target="_blank" rel="noopener noreferrer" className="no-underline text-black hover:text-[#D90429]">Instagram</a>
                  <a href="https://www.tiktok.com/@sagadrop" target="_blank" rel="noopener noreferrer" className="no-underline text-black hover:text-[#D90429]">TikTok</a>
                  <a href="https://x.com/sagadrop" target="_blank" rel="noopener noreferrer" className="no-underline text-black hover:text-[#D90429]">X</a>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
