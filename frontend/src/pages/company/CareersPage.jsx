import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const ROLES = [
  { title: "Senior Frontend Engineer",   team: "Engineering",   loc: "Mumbai / Remote",  type: "Full-time" },
  { title: "AI / ML Engineer",            team: "AI Studio",     loc: "Bangalore / Remote", type: "Full-time" },
  { title: "Editorial Curator",           team: "Books",         loc: "Mumbai",           type: "Full-time" },
  { title: "Brand Designer",             team: "Creative",      loc: "Remote",           type: "Full-time" },
  { title: "Growth Marketing Manager",   team: "Marketing",     loc: "Mumbai / Delhi",   type: "Full-time" },
  { title: "Customer Experience Lead",   team: "Support",       loc: "Remote",           type: "Full-time" },
];

export default function CareersPage() {
  return (
    <PageLayout>
      <div className="pt-36 pb-24 bg-[#0a0a0a] text-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="eyebrow text-[#D90429] mb-4">● SagaDrop / Careers</p>
            <h1 className="font-display text-6xl md:text-9xl font-black tracking-[-0.03em] leading-[0.88]">
              Build the<br />Future of<br />Reading.
            </h1>
            <p className="mt-10 text-sm text-white/60 max-w-xl leading-relaxed">
              We're a team of readers, designers, and engineers on a mission to make literature more beautiful and more accessible. Come build with us.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            {["Remote-first", "Equity for all", "₹5K book budget / yr"].map((b, i) => (
              <motion.div key={b} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="border border-black/10 p-8 text-center">
                <p className="font-display text-2xl font-bold tracking-tight">{b}</p>
              </motion.div>
            ))}
          </div>

          <h2 className="font-display text-4xl font-black tracking-tight mb-10">Open Roles</h2>
          <div className="space-y-3">
            {ROLES.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5 }}
                className="border border-black/10 px-7 py-5 flex items-center justify-between hover:border-[#D90429] transition-colors group cursor-pointer">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight group-hover:text-[#D90429] transition-colors">{r.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-[11px] text-[#999]">
                    <span className="uppercase tracking-[0.12em]">{r.team}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.loc}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.type}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#D90429] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>

          <div className="mt-16 bg-[#f6f6f6] p-10 text-center">
            <h3 className="font-display text-3xl font-black tracking-tight mb-4">Don't see your role?</h3>
            <p className="text-sm text-[#555] mb-6">We're always interested in exceptional people. Send us your story.</p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-[#D90429] text-white px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-[#B00320] transition-colors no-underline">
              Say Hello <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
