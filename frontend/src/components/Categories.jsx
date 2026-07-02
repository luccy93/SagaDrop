import { motion } from "framer-motion";
import {
  Sparkles, Search, Heart, Rocket, Compass, Skull, Feather, Baby,
} from "lucide-react";

const CATS = [
  { name: "Fantasy", icon: Sparkles, count: 5 },
  { name: "Mystery", icon: Search, count: 5 },
  { name: "Romance", icon: Heart, count: 5 },
  { name: "Sci-Fi", icon: Rocket, count: 5 },
  { name: "Adventure", icon: Compass, count: 5 },
  { name: "Horror", icon: Skull, count: 5 },
  { name: "Classics", icon: Feather, count: 5 },
  { name: "Children", icon: Baby, count: 5 },
];

export default function Categories() {
  return (
    <section id="categories" className="py-24 md:py-32 bg-[#f6f6f6]" data-testid="categories-section">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between gap-6 mb-14 md:mb-20">
          <div>
            <p className="eyebrow text-[#D90429] mb-4">● 02 / Browse</p>
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-[-0.02em] leading-[0.95] text-[#0a0a0a]">
              Every Genre.<br />Every Mood.
            </h2>
          </div>
          <p className="hidden md:block max-w-xs text-sm text-[#555] leading-relaxed">
            Eight curated worlds. Pick a genre and disappear into it.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-[1px] bg-black/10">
          {CATS.map((c, i) => (
            <motion.a
              key={c.name}
              href="#trending"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              data-testid={`category-${c.name.toLowerCase()}`}
              className="group relative bg-white p-6 md:p-8 no-underline text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors duration-500 aspect-square flex flex-col justify-between overflow-hidden"
            >
              <c.icon className="w-8 h-8 text-[#D90429] group-hover:text-white transition-colors" strokeWidth={1.6} />
              <div>
                <div className="font-display text-2xl md:text-3xl font-bold tracking-tight">{c.name}</div>
                <div className="mt-1 text-[10px] tracking-[0.2em] uppercase opacity-70">{c.count.toLocaleString()} Titles</div>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M17 7H8M17 7V16" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
