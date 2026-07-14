import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, ShoppingBag, Share2 } from "lucide-react";
import { createShare } from "@/lib/api";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import ShareModal from "@/components/ShareModal";

const MATERIALS = [
  { key: "Hardcover", price: 1499 },
  { key: "Paperback", price: 799 },
  { key: "Special Edition", price: 2499 },
];
const FOILS = [
  { key: "gold", label: "Gold", hex: "#d4af37" },
  { key: "silver", label: "Silver", hex: "#c0c0c0" },
  { key: "rose-gold", label: "Rose Gold", hex: "#e0a8a0" },
  { key: "copper", label: "Copper", hex: "#b87333" },
  { key: "red", label: "Red", hex: "#D90429" },
  { key: "emerald", label: "Emerald", hex: "#50c878" },
  { key: "sapphire", label: "Sapphire", hex: "#0f52ba" },
  { key: "amethyst", label: "Amethyst", hex: "#9966cc" },
  { key: "bronze", label: "Bronze", hex: "#cd7f32" },
  { key: "black", label: "Obsidian", hex: "#0a0a0a" },
  { key: "white", label: "Ivory", hex: "#ffffff" },
];
const FONTS = [
  { key: "font-display", label: "Serif Classic" },
  { key: "font-serif", label: "Elegant Serif" },
  { key: "font-slab", label: "Slab Serif" },
  { key: "font-sans", label: "Sans Modern" },
  { key: "font-script", label: "Script" },
  { key: "font-mono-alt", label: "Monospace" },
  { key: "font-mono", label: "Mono Tech" },
];
const ADDONS = ["Bookmark", "Gift Box", "Dust Jacket"];
const SIZES = [
  { key: "pocket", label: "Pocket", dim: "4.25″ × 6.87″", price: 0 },
  { key: "standard", label: "Standard", dim: "5.5″ × 8.5″", price: 300 },
  { key: "large", label: "Large", dim: "6.14″ × 9.21″", price: 600 },
];
const PAPERS = [
  { key: "cream", label: "Cream", desc: "Warm archival" },
  { key: "white", label: "White", desc: "Crisp bright" },
  { key: "recycled", label: "Recycled", desc: "Eco craft" },
];
const FINISHES = [
  { key: "matte", label: "Matte", desc: "Subtle sophistication" },
  { key: "glossy", label: "Glossy", desc: "Vibrant sheen" },
  { key: "velvet", label: "Velvet Soft-touch", desc: "Luxury feel" },
];
const EDGE_STAINS = [
  { key: "none", label: "None", hex: "" },
  { key: "gold", label: "Gold", hex: "#d4af37" },
  { key: "red", label: "Red", hex: "#D90429" },
  { key: "black", label: "Black", hex: "#0a0a0a" },
];

const MATERIAL_COLORS = {
  Hardcover: { cover: "#1a1a1a", spine: "linear-gradient(90deg,#0a0a0a,#1c1c1c)", back: "#0a0a0a" },
  Paperback: { cover: "#2c1810", spine: "linear-gradient(90deg,#1a0f0a,#2c1810)", back: "#1a0f0a" },
  "Special Edition": { cover: "#3d0c11", spine: "linear-gradient(90deg,#1f0709,#3d0c11)", back: "#1f0709" },
};

export default function BookCustomizer() {
  const { addToCart } = useStore();
  const [title, setTitle] = useState("The Cartographer");
  const [author, setAuthor] = useState("A. Elouan");
  const [material, setMaterial] = useState("Hardcover");
  const [rotX, setRotX] = useState(6);
  const [rotY, setRotY] = useState(-28);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [foil, setFoil] = useState("gold");
  const [font, setFont] = useState("font-display");
  const [addons, setAddons] = useState(["Bookmark", "Dust Jacket"]);
  const [size, setSize] = useState("standard");
  const [paper, setPaper] = useState("cream");
  const [finish, setFinish] = useState("matte");
  const [edgeStain, setEdgeStain] = useState("none");
  const [quantity, setQuantity] = useState(1);
  const [giftMessage, setGiftMessage] = useState("");
  const [coverImg, setCoverImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [share, setShare] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const onPointerDown = useCallback((e) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX || e.touches?.[0]?.clientX, y: e.clientY || e.touches?.[0]?.clientY };
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const cx = e.clientX || e.touches?.[0]?.clientX;
    const cy = e.clientY || e.touches?.[0]?.clientY;
    if (cx == null || cy == null) return;
    const dx = cx - lastPos.current.x;
    const dy = cy - lastPos.current.y;
    setRotY((r) => r + dx * 0.5);
    setRotX((r) => Math.max(-45, Math.min(45, r - dy * 0.3)));
    lastPos.current = { x: cx, y: cy };
  }, []);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  const toggleAddon = (a) => setAddons((cur) => cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]);

  const basePrice = (MATERIALS.find((m) => m.key === material)?.price || 0)
    + (SIZES.find((s) => s.key === size)?.price || 0)
    + (finish === "velvet" ? 400 : finish === "glossy" ? 200 : 0)
    + (edgeStain !== "none" ? 250 : 0)
    + (addons.includes("Gift Box") ? 299 : 0)
    + (addons.includes("Dust Jacket") ? 199 : 0)
    + (addons.includes("Bookmark") ? 99 : 0);
  const price = basePrice * quantity;

  const genCover = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setCoverImg("https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format");
      setShare(null);
      toast.success("Your custom cover is ready.");
    } catch (e) {
      toast.error("Cover creation failed. Try again.");
    } finally { setLoading(false); }
  };

  const specs = `${material} · ${SIZES.find((s) => s.key === size)?.label} · ${finish} · ${PAPERS.find((p) => p.key === paper)?.label}${edgeStain !== "none" ? ` · ${EDGE_STAINS.find((e) => e.key === edgeStain)?.label} edge` : ""}`;

  const addCustom = () => {
    addToCart({
      id: `custom-${Date.now()}`,
      title: `${title} (Custom ${material})`,
      author,
      price,
      quantity,
      specs,
      cover: coverImg || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format",
    });
    toast.success(`${quantity} × custom edition added to cart`);
  };

  const shareBook = async () => {
    if (!coverImg) return;
    if (share) { setShareOpen(true); return; }
    setSharing(true);
    try {
      const [meta, data] = coverImg.split(",");
      const mime = meta.match(/data:(.*);base64/)[1];
      const res = await createShare({ title, author, material, foil, size, paper, finish, edge_stain: edgeStain, mime_type: mime, cover_data: data });
      setShare(res);
      setShareOpen(true);
    } catch (e) {
      toast.error("Could not create share link. Try again.");
    } finally { setSharing(false); }
  };

  return (
    <section id="customizer" className="py-24 md:py-32 bg-white" data-testid="customizer-section">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — 3D preview */}
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow text-[#D90429] mb-4">● 04 / Bespoke</p>
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-[-0.02em] leading-[0.9]">
              Design Your<br />Edition.
            </h2>
            <div
              className="mt-14 book-3d-scene grid place-items-center min-h-[420px] select-none"
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            >
              <div
                className="book-3d"
                style={{
                  transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
                  cursor: dragging.current ? "grabbing" : "grab",
                }}
              >
                <div
                  className="book-3d__face book-3d__cover"
                  style={{ background: aiCover ? `url(${aiCover}) center/cover` : `linear-gradient(135deg,${MATERIAL_COLORS[material].cover},${MATERIAL_COLORS[material].back})` }}
                >
                  {!coverImg && (
                    <div className="absolute inset-0 flex flex-col justify-between p-5 text-center">
                      <div className={`text-[10px] uppercase tracking-[0.28em] foil-${foil}`}>SagaDrop</div>
                      <div>
                        <div className={`${font} text-2xl md:text-3xl font-black leading-tight foil-${foil}`}>{title.toUpperCase()}</div>
                        <div className={`mt-3 text-[11px] uppercase tracking-[0.25em] foil-${foil} opacity-90`}>{author}</div>
                      </div>
                      <div className={`text-[10px] uppercase tracking-[0.25em] foil-${foil}`}>Edition · 2026</div>
                    </div>
                  )}
                </div>
                <div className="book-3d__face book-3d__back" style={{ background: MATERIAL_COLORS[material].back }} />
                <div className="book-3d__face book-3d__spine" style={{ background: MATERIAL_COLORS[material].spine }}>
                  <div className={`h-full w-full grid place-items-center ${font} rotate-90 text-[10px] tracking-[0.3em] foil-${foil}`}>
                    {title.toUpperCase().slice(0, 20)}
                  </div>
                </div>
                <div className="book-3d__face book-3d__pages" />
                <div className="book-3d__face book-3d__top" style={edgeStain !== "none" ? { background: EDGE_STAINS.find((e) => e.key === edgeStain)?.hex } : {}} />
                <div className="book-3d__face book-3d__bottom" style={edgeStain !== "none" ? { background: EDGE_STAINS.find((e) => e.key === edgeStain)?.hex } : {}} />
                {addons.includes("Bookmark") && (
                  <div className="absolute right-6 top-0 w-2 h-24" style={{ background: FOILS.find((f) => f.key === foil)?.hex, transform: "translateZ(20px)" }} />
                )}
              </div>
            </div>

            <div className="mt-10 border-t border-black/10 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="eyebrow text-[#555]">Estimated Total</div>
                  <div className="font-display text-4xl font-black text-[#0a0a0a] mt-1">₹{price.toLocaleString()}</div>
                  {quantity > 1 && <div className="text-xs text-[#999] mt-1">₹{basePrice.toLocaleString()} Ã— {quantity} copies</div>}
                </div>
                <button
                  onClick={addCustom}
                  data-testid="add-custom-btn"
                  className="bg-[#0a0a0a] hover:bg-[#333] text-white px-6 py-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] font-semibold"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>
              </div>
              <p className="text-[11px] text-[#555] mt-3 leading-relaxed">{specs}{giftMessage ? ` · "${giftMessage}"` : ""}</p>
            </div>
          </div>

          {/* Right — controls */}
          <div className="space-y-10">
            <div>
              <p className="eyebrow mb-3">Title</p>
              <input
                data-testid="custom-title-input"
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 font-display text-2xl"
              />
              <p className="eyebrow mt-6 mb-3">Author</p>
              <input
                data-testid="custom-author-input"
                value={author} onChange={(e) => setAuthor(e.target.value)}
                className="w-full border-b-2 border-black/10 focus:border-[#D90429] bg-transparent outline-none py-3 text-lg"
              />
            </div>

            <div>
              <p className="eyebrow mb-3">Cover Material</p>
              <div className="grid grid-cols-3 gap-[1px] bg-black/10">
                {MATERIALS.map((m) => (
                  <button
                    key={m.key} onClick={() => setMaterial(m.key)}
                    data-testid={`material-${m.key.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`p-4 text-left ${material === m.key ? "bg-[#0a0a0a] text-white" : "bg-white hover:bg-[#f6f6f6]"}`}
                  >
                    <div className="font-display font-bold text-lg">{m.key}</div>
                    <div className="text-[11px] opacity-70 mt-1">₹{m.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Foil Color</p>
              <div className="flex gap-3 flex-wrap">
                {FOILS.map((f) => (
                  <button
                    key={f.key} onClick={() => setFoil(f.key)}
                    data-testid={`foil-${f.key}`}
                    className={`w-14 h-14 relative ${foil === f.key ? "ring-2 ring-[#D90429] ring-offset-2" : ""}`}
                    style={{ background: f.hex, border: f.key === "white" ? "1px solid #e5e5e5" : "none" }}
                    aria-label={f.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Title Font</p>
              <div className="grid grid-cols-3 gap-[1px] bg-black/10">
                {FONTS.map((f) => (
                  <button
                    key={f.key} onClick={() => setFont(f.key)}
                    data-testid={`font-${f.key}`}
                    className={`p-4 text-center ${font === f.key ? "bg-[#D90429] text-white" : "bg-white hover:bg-[#f6f6f6]"}`}
                  >
                    <div className={`${f.key} text-lg font-bold`}>Aa</div>
                    <div className="text-[10px] opacity-70 mt-1 uppercase tracking-[0.15em]">{f.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Add-Ons</p>
              <div className="flex flex-wrap gap-2">
                {ADDONS.map((a) => (
                  <button
                    key={a} onClick={() => toggleAddon(a)}
                    data-testid={`addon-${a.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`px-5 py-3 text-[11px] tracking-[0.15em] uppercase font-semibold border transition-colors ${
                      addons.includes(a)
                        ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                        : "border-black/15 hover:border-[#0a0a0a]"
                    }`}
                  >{a}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Trim Size</p>
              <div className="grid grid-cols-3 gap-[1px] bg-black/10">
                {SIZES.map((s) => (
                  <button
                    key={s.key} onClick={() => setSize(s.key)}
                    data-testid={`size-${s.key}`}
                    className={`p-4 text-left ${size === s.key ? "bg-[#0a0a0a] text-white" : "bg-white hover:bg-[#f6f6f6]"}`}
                  >
                    <div className="font-display font-bold">{s.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{s.dim}</div>
                    {s.price > 0 && <div className="text-[10px] opacity-70">+₹{s.price}</div>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Paper Type</p>
              <div className="grid grid-cols-3 gap-[1px] bg-black/10">
                {PAPERS.map((p) => (
                  <button
                    key={p.key} onClick={() => setPaper(p.key)}
                    data-testid={`paper-${p.key}`}
                    className={`p-4 text-center ${paper === p.key ? "bg-[#0a0a0a] text-white" : "bg-white hover:bg-[#f6f6f6]"}`}
                  >
                    <div className="font-display font-bold">{p.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Cover Finish</p>
              <div className="grid grid-cols-3 gap-[1px] bg-black/10">
                {FINISHES.map((f) => (
                  <button
                    key={f.key} onClick={() => setFinish(f.key)}
                    data-testid={`finish-${f.key}`}
                    className={`p-4 text-center ${finish === f.key ? "bg-[#0a0a0a] text-white" : "bg-white hover:bg-[#f6f6f6]"}`}
                  >
                    <div className="font-display font-bold text-sm">{f.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{f.desc}</div>
                    {(f.key === "glossy" || f.key === "velvet") && <div className="text-[10px] opacity-70">+₹{f.key === "velvet" ? 400 : 200}</div>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Edge Staining</p>
              <div className="flex gap-3 flex-wrap">
                {EDGE_STAINS.map((e) => (
                  <button
                    key={e.key} onClick={() => setEdgeStain(e.key)}
                    data-testid={`edge-${e.key}`}
                    className={`px-5 py-3 text-[11px] tracking-[0.15em] uppercase font-semibold border transition-colors ${
                      edgeStain === e.key
                        ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                        : "border-black/15 hover:border-[#0a0a0a]"
                    } ${e.key !== "none" ? "flex items-center gap-2" : ""}`}
                  >
                    {e.key !== "none" && (
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: e.hex }} />
                    )}
                    {e.label}
                    {e.key !== "none" && <span className="opacity-70">+₹250</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border border-black/15 grid place-items-center hover:bg-[#0a0a0a] hover:text-white transition-colors text-lg"
                >−</button>
                <span className="font-display text-3xl font-black w-16 text-center" data-testid="custom-qty">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(50, quantity + 1))}
                  className="w-12 h-12 border border-black/15 grid place-items-center hover:bg-[#0a0a0a] hover:text-white transition-colors text-lg"
                >+</button>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Gift Message <span className="text-[#999] font-normal">(optional)</span></p>
              <textarea
                value={giftMessage} onChange={(e) => setGiftMessage(e.target.value.slice(0, 200))}
                placeholder="Write a personal note…"
                className="w-full border border-black/10 bg-transparent outline-none p-4 text-sm resize-none h-24 focus:border-[#D90429] transition-colors"
                data-testid="gift-message-input"
              />
              <p className="text-[10px] text-[#999] mt-1">{giftMessage.length}/200</p>
            </div>

            <div className="border-t border-black/10 pt-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#D90429]" />
                <p className="eyebrow">Custom Cover</p>
              </div>
              <p className="text-sm text-[#555] mb-4">
                Generate a bespoke cover illustration based on your title, material and foil.
              </p>
              <button
                onClick={genCover} disabled={loading}
                data-testid="generate-cover-btn"
                className="inline-flex items-center gap-2 border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white px-6 py-3 text-[12px] uppercase tracking-[0.18em] font-semibold disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Creating your cover…" : "Generate Cover"}
              </button>
              {coverImg && (
                <button
                  onClick={shareBook} disabled={sharing}
                  data-testid="share-custom-btn"
                  className="ml-3 inline-flex items-center gap-2 bg-[#D90429] hover:bg-[#B00320] text-white px-6 py-3 text-[12px] uppercase tracking-[0.18em] font-semibold disabled:opacity-60"
                >
                  {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  {sharing ? "Publishing…" : "Share This Edition"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        share={share}
        cover={coverImg}
        title={title}
        author={author}
      />
    </section>
  );
}
