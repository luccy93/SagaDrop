import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const REVIEWS = [
  { name: "Aanya Mehta",      avatar: "AM", rating: 5, book: "The Song of Achilles", text: "Madeline Miller writes with such aching beauty. I cried on the last page and immediately reread the first chapter.", date: "June 2026", location: "Mumbai" },
  { name: "Rohan Verma",      avatar: "RV", rating: 5, book: "Ready Player One",      text: "Pure nostalgia fuel. Cline packs every page with references that hit just right. A book that celebrates why we love stories.", date: "May 2026", location: "Bangalore" },
  { name: "Priya Krishnamurthy", avatar: "PK", rating: 4, book: "Project Hail Mary", text: "Weir does it again. The science is mind-bending, the humour disarming, and the friendship at the core genuinely moving.", date: "May 2026", location: "Chennai" },
  { name: "Dev Sharma",       avatar: "DS", rating: 5, book: "The Way of Kings",     text: "1000 pages felt short. Sanderson's world-building is in another dimension. Stormlight is the fantasy series of our generation.", date: "April 2026", location: "Delhi" },
  { name: "Meera Nair",       avatar: "MN", rating: 5, book: "It Ends with Us",      text: "CoHo makes you feel every emotion at full volume. I haven't been this affected by a book in years.", date: "April 2026", location: "Kochi" },
  { name: "Arjun Patel",      avatar: "AP", rating: 4, book: "Dune",                 text: "A masterwork of science fiction. Dense, political, ecological — Herbert built a universe that feels genuinely real.", date: "March 2026", location: "Ahmedabad" },
];

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < n ? "fill-[#D90429] text-[#D90429]" : "text-[#ddd]"}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Discover / Reviews</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Reader<br />Stories.
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">
              Real words from real readers. Every review is a story about a story.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {REVIEWS.map((r, i) => (
              <motion.article
                key={r.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.6 }}
                className="border border-black/10 p-8 flex flex-col gap-5"
              >
                <Quote className="w-7 h-7 text-[#D90429]" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-[#333] flex-1">"{r.text}"</p>
                <div>
                  <Stars n={r.rating} />
                  <p className="mt-2 text-[11px] text-[#D90429] uppercase tracking-[0.14em] font-semibold">{r.book}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                  <div className="w-9 h-9 rounded-full bg-[#0a0a0a] grid place-items-center text-white text-[11px] font-bold flex-shrink-0">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{r.name}</p>
                    <p className="text-[11px] text-[#999]">{r.location} · {r.date}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
