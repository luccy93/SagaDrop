import { motion } from "framer-motion";
import { Leaf, Recycle, Zap, Heart } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const PILLARS = [
  { icon: Leaf,    color: "#2E7D32", title: "FSC-certified Paper",       body: "Every book we sell is printed on paper sourced from responsibly managed forests, certified by the Forest Stewardship Council." },
  { icon: Recycle, color: "#0277BD", title: "Recyclable Packaging",      body: "We've eliminated 100% of single-use plastic from our packaging. All mailers and tissue are curbside recyclable." },
  { icon: Zap,     color: "#F57C00", title: "Carbon-Neutral Shipping",   body: "We offset every delivery through Pachama's verified forest protection projects. Free for all orders." },
  { icon: Heart,   color: "#D90429", title: "1% for Libraries",         body: "1% of every order goes directly to public library funding initiatives across India." },
];

export default function SustainabilityPage() {
  return (
    <PageLayout>
      <div className="pt-36 pb-24 bg-[#0a0a0a] text-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="eyebrow text-[#D90429] mb-4">● SagaDrop / Sustainability</p>
            <h1 className="font-display text-6xl md:text-9xl font-black tracking-[-0.03em] leading-[0.88]">
              Print<br />Responsibly.
            </h1>
            <p className="mt-10 text-sm text-white/60 max-w-xl leading-relaxed">
              A book should last a generation. So should the forest it came from.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {PILLARS.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
                className="border border-black/10 p-8">
                <p.icon className="w-8 h-8 mb-6" style={{ color: p.color }} strokeWidth={1.5} />
                <h3 className="font-display text-xl font-bold tracking-tight mb-3">{p.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-[#f6f6f6] p-12 grid md:grid-cols-3 gap-10 text-center">
            {[
              { val: "100%", label: "plastic-free packaging since 2024" },
              { val: "2.1M kg", label: "CO₂ offset through forest projects" },
              { val: "₹4.2Cr", label: "donated to public libraries" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-5xl font-black text-[#D90429] mb-2">{s.val}</div>
                <div className="text-sm text-[#555]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
