import { motion } from "framer-motion";
import { Download, ExternalLink } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const PRESS = [
  { pub: "The Hindu",       date: "June 2026", headline: "SagaDrop redefines what a bookstore can be in the digital age", href: "#" },
  { pub: "Forbes India",    date: "May 2026",  headline: "The startup turning book-buying into a luxury experience", href: "#" },
  { pub: "Mint",            date: "April 2026",headline: "How SagaDrop is building India's Awwwards-winning marketplace for stories", href: "#" },
  { pub: "YourStory",       date: "March 2026",headline: "SagaDrop crosses 2 million readers in 18 months", href: "#" },
  { pub: "Business Standard",date:"Feb 2026",  headline: "Inside SagaDrop's editorial engine — books curated by real readers", href: "#" },
];

export default function PressPage() {
  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● SagaDrop / Press</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              In the<br />News.
            </h1>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-16">
            <div>
              <div className="border border-black/10 p-8 mb-8">
                <h3 className="font-display text-lg font-bold tracking-tight mb-4">Press Kit</h3>
                <p className="text-sm text-[#555] leading-relaxed mb-6">Logos, brand assets, product screenshots, and leadership bios — all in one download.</p>
                <button className="w-full border border-[#0a0a0a] py-3 text-[11px] uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2 hover:bg-[#0a0a0a] hover:text-white transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download Press Kit
                </button>
              </div>
              <div className="p-8 bg-[#f6f6f6]">
                <h3 className="font-display text-lg font-bold tracking-tight mb-4">Press Contact</h3>
                <p className="text-sm text-[#555]">press@sagadrop.com</p>
                <p className="text-sm text-[#555] mt-1">+91 98765 43210</p>
                <p className="text-sm text-[#999] mt-4 text-xs">We respond within 2 business hours.</p>
              </div>
            </div>

            <div>
              <div className="space-y-0">
                {PRESS.map((p, i) => (
                  <motion.a key={p.pub} href={p.href} target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }}
                    className="flex items-start justify-between py-6 border-b border-black/10 gap-6 no-underline text-[#0a0a0a] hover:text-[#D90429] group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="eyebrow text-[#D90429]">{p.pub}</span>
                        <span className="text-[11px] text-[#999]">{p.date}</span>
                      </div>
                      <h3 className="font-display text-lg font-bold tracking-tight leading-snug">{p.headline}</h3>
                    </div>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
