import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Check } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { toast } from "sonner";

const AMOUNTS = [250, 500, 1000, 2000, 5000];
const DESIGNS = [
  { id: "classic", label: "Classic",   bg: "#0a0a0a", text: "#ffffff" },
  { id: "red",     label: "Crimson",   bg: "#D90429", text: "#ffffff" },
  { id: "cream",   label: "Parchment", bg: "#F5F0E8", text: "#0a0a0a" },
  { id: "navy",    label: "Midnight",  bg: "#1B2A4A", text: "#ffffff" },
];

export default function GiftCardsPage() {
  const [amount, setAmount]   = useState(1000);
  const [design, setDesign]   = useState(DESIGNS[0]);
  const [custom, setCustom]   = useState("");
  const [to, setTo]           = useState("");
  const [msg, setMsg]         = useState("");

  const finalAmount = custom ? Number(custom) : amount;

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Shop / Gift Cards</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Gift<br />Cards.
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">
              The perfect gift for every reader. Delivered instantly by email, valid forever.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Preview */}
            <div>
              <motion.div
                animate={{ backgroundColor: design.bg }}
                transition={{ duration: 0.4 }}
                className="aspect-[1.6/1] rounded-sm flex flex-col justify-between p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-black tracking-tight" style={{ color: design.text }}>
                    SAGA<span style={{ opacity: 0.6 }}>DROP</span>
                  </span>
                  <Gift className="w-6 h-6" style={{ color: design.text, opacity: 0.7 }} />
                </div>
                <div>
                  <div className="font-display text-5xl font-black" style={{ color: design.text }}>
                    ₹{finalAmount.toLocaleString()}
                  </div>
                  {msg && <p className="mt-2 text-sm leading-relaxed opacity-70" style={{ color: design.text }}>{msg}</p>}
                  {to && <p className="mt-1 text-xs opacity-50 uppercase tracking-widest" style={{ color: design.text }}>For {to}</p>}
                </div>
              </motion.div>

              {/* Design picker */}
              <div className="mt-6 flex gap-3">
                {DESIGNS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDesign(d)}
                    style={{ backgroundColor: d.bg }}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${design.id === d.id ? "border-[#D90429] scale-110" : "border-transparent"}`}
                  />
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-8">
              <div>
                <p className="eyebrow mb-4">Choose Amount</p>
                <div className="flex flex-wrap gap-3">
                  {AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setAmount(a); setCustom(""); }}
                      className={`px-5 py-3 border text-sm font-semibold tracking-wide transition-colors ${
                        amount === a && !custom ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "border-black/20 hover:border-[#0a0a0a]"
                      }`}
                    >
                      ₹{a.toLocaleString()}
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Custom"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    className="w-28 px-4 py-3 border border-black/20 text-sm focus:outline-none focus:border-[#0a0a0a]"
                  />
                </div>
              </div>

              <div>
                <p className="eyebrow mb-4">Recipient Email</p>
                <input
                  type="email" placeholder="friend@email.com" value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a]"
                />
              </div>

              <div>
                <p className="eyebrow mb-4">Personal Message (optional)</p>
                <textarea
                  placeholder="For every story you haven't read yet…"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={3}
                  className="w-full border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] resize-none"
                />
              </div>

              <button
                onClick={() => toast.success("Gift card added to cart!")}
                className="w-full bg-[#D90429] hover:bg-[#B00320] text-white py-4 text-[12px] tracking-[0.18em] uppercase font-semibold transition-colors"
              >
                Add to Cart — ₹{(finalAmount || 0).toLocaleString()}
              </button>
              <p className="text-[11px] text-[#999] text-center">Delivered instantly by email · Valid for life · No expiry</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
