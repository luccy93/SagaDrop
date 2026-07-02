import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, ShoppingBag, Share2 } from "lucide-react";
import { aiGenerateCover, createShare } from "@/lib/api";
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
  { key: "red", label: "Red", hex: "#D90429" },
  { key: "black", label: "Obsidian", hex: "#0a0a0a" },
  { key: "white", label: "Ivory", hex: "#ffffff" },
];
const FONTS = [
  { key: "font-display", label: "Serif Classic" },
  { key: "font-sans", label: "Sans Modern" },
  { key: "font-mono-alt", label: "Monospace" },
];
const ADDONS = ["Bookmark", "Gift Box", "Dust Jacket"];

export default function BookCustomizer() {
  const { addToCart } = useStore();
  const [title, setTitle] = useState("The Cartographer");
  const [author, setAuthor] = useState("A. Elouan");
  const [material, setMaterial] = useState("Hardcover");
  const [foil, setFoil] = useState("gold");
  const [font, setFont] = useState("font-display");
  const [addons, setAddons] = useState(["Bookmark", "Dust Jacket"]);
  const [aiCover, setAiCover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [share, setShare] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const toggleAddon = (a) => setAddons((cur) => cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]);

  const price = (MATERIALS.find((m) => m.key === material)?.price || 0)
    + (addons.includes("Gift Box") ? 299 : 0)
    + (addons.includes("Dust Jacket") ? 199 : 0)
    + (addons.includes("Bookmark") ? 99 : 0);

  const genCover = async () => {
    setLoading(true);
    try {
      const data = await aiGenerateCover({
        title, author, material,
        style: `${material.toLowerCase()} luxury editorial illustration`,
        foil,
      });
      setAiCover(`data:${data.mime_type};base64,${data.data}`);
      setShare(null);
      toast.success("Your AI cover is ready.");
    } catch (e) {
      toast.error("Cover generation failed. Try again.");
    } finally { setLoading(false); }
  };

  const addCustom = () => {
    addToCart({
      id: `custom-${Date.now()}`,
      title: `${title} (Custom ${material})`,
      author,
      price,
      cover: aiCover || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format",
    });
    toast.success("Custom edition added to cart");
  };

  const shareBook = async () => {
    if (!aiCover) return;
    if (share) { setShareOpen(true); return; }
    setSharing(true);
    try {
      const [meta, data] = aiCover.split(",");
      const mime = meta.match(/data:(.*);base64/)[1];
      const res = await createShare({ title, author, material, foil, mime_type: mime, cover_data: data });
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
            <div className="mt-14 book-3d-scene grid place-items-center min-h-[420px]">
              <div className="book-3d">
                <div
                  className="book-3d__face book-3d__cover"
                  style={{ background: aiCover ? `url(${aiCover}) center/cover` : "linear-gradient(135deg,#1a1a1a,#3b1d10)" }}
                >
                  {!aiCover && (
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
                <div className="book-3d__face book-3d__back" style={{ background: "#0a0a0a" }} />
                <div className="book-3d__face book-3d__spine">
                  <div className={`h-full w-full grid place-items-center ${font} rotate-90 text-[10px] tracking-[0.3em] foil-${foil}`}>
                    {title.toUpperCase().slice(0, 20)}
                  </div>
                </div>
                <div className="book-3d__face book-3d__pages" />
                <div className="book-3d__face book-3d__top" />
                <div className="book-3d__face book-3d__bottom" />
                {addons.includes("Bookmark") && (
                  <div className="absolute right-6 top-0 w-2 h-24" style={{ background: FOILS.find((f) => f.key === foil)?.hex, transform: "translateZ(20px)" }} />
                )}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
              <div>
                <div className="eyebrow text-[#555]">Estimated Total</div>
                <div className="font-display text-4xl font-black text-[#0a0a0a] mt-1">₹{price.toLocaleString()}</div>
              </div>
              <button
                onClick={addCustom}
                data-testid="add-custom-btn"
                className="bg-[#0a0a0a] hover:bg-[#333] text-white px-6 py-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] font-semibold"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
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

            <div className="border-t border-black/10 pt-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#D90429]" />
                <p className="eyebrow">AI Generated Cover · Nano Banana</p>
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
                {loading ? "Painting your cover…" : "Generate AI Cover"}
              </button>
              {aiCover && (
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
        cover={aiCover}
        title={title}
        author={author}
      />
    </section>
  );
}
