import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";

const STATS = [
  { val: "40,000+", label: "Books in Catalog" },
  { val: "2.1M",    label: "Readers" },
  { val: "180+",    label: "Countries Shipped" },
  { val: "4.9★",    label: "Average Rating" },
];

const TEAM = [
  { name: "Aryan Kapoor",   role: "Founder & CEO",        img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80" },
  { name: "Nisha Mehta",    role: "Chief Creative Officer", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80" },
  { name: "Dev Krishnan",   role: "Head of Curation",       img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80" },
  { name: "Priya Sharma",   role: "Chief Librarian",       img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80" },
];

export default function AboutPage() {
  return (
    <PageLayout>
      {/* Dark hero */}
      <div className="pt-36 pb-24 bg-[#0a0a0a] text-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="eyebrow text-[#D90429] mb-4">● SagaDrop / About</p>
            <h1 className="font-display text-6xl md:text-9xl font-black tracking-[-0.03em] leading-[0.88]">
              Every Story<br />Begins Here.
            </h1>
            <p className="mt-10 text-lg text-white/60 max-w-2xl leading-relaxed">
              SagaDrop was born from a simple belief: books deserve to be experienced, not just purchased. We built a marketplace that treats literature with the reverence it has always deserved.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#D90429] py-16">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="text-white text-center">
              <div className="font-display text-5xl font-black tracking-tight">{s.val}</div>
              <div className="eyebrow text-white/70 mt-2">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="eyebrow text-[#D90429] mb-6">Our Story</p>
            <h2 className="font-display text-5xl md:text-6xl font-black tracking-[-0.02em] leading-[0.9] mb-8">We believe books are heirlooms.</h2>
            <div className="space-y-5 text-sm text-[#555] leading-relaxed">
              <p>Founded in Mumbai in 2023, SagaDrop started as a curated bookshop with twelve titles and a dream of changing how India experiences literature. Today, we serve readers in 180 countries.</p>
              <p>We help you discover stories you didn't know you were looking for — with every recommendation rooted in genuine editorial care. Our curators read every book we carry.</p>
              <p>From standard paperbacks to hand-bound Collector Editions with foil embossing and marbled endpapers, we believe the physical book is an art object worthy of reverence.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="aspect-[4/3] bg-[#f6f6f6] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&auto=format&q=80" alt="Books" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-[#f6f6f6]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <p className="eyebrow text-[#D90429] mb-4">The Team</p>
          <h2 className="font-display text-5xl font-black tracking-[-0.02em] leading-[0.9] mb-14">The people behind the pages.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.6 }}>
                <div className="aspect-[3/4] bg-[#e5e5e5] overflow-hidden mb-5">
                  <img src={p.img} alt={p.name} onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300"; }}
                    className="w-full h-full object-cover object-top grayscale" />
                </div>
                <h3 className="font-display text-xl font-bold tracking-tight">{p.name}</h3>
                <p className="text-xs text-[#555] mt-1">{p.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
