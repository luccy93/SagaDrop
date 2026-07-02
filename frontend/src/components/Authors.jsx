import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const AUTHORS = [
  {
    name: "Madeline Miller",
    img: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG9mJTIwYXV0aG9yJTIwd3JpdGVyfGVufDB8fHx8MTc4Mjk5NDY2Nnww&ixlib=rb-4.1.0&q=85",
    known: "Circe, The Song of Achilles",
    tag: "Mythology · Award Winner",
  },
  {
    name: "Andy Weir",
    img: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxwb3J0cmFpdCUyMG9mJTIwYXV0aG9yJTIwd3JpdGVyfGVufDB8fHx8MTc4Mjk5NDY2Nnww&ixlib=rb-4.1.0&q=85",
    known: "Project Hail Mary, The Martian",
    tag: "Sci-Fi · Hugo Nominee",
  },
  {
    name: "Delia Owens",
    img: "https://images.unsplash.com/photo-1600188768149-f27db3bc6ef9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHw0fHxwb3J0cmFpdCUyMG9mJTIwYXV0aG9yJTIwd3JpdGVyfGVufDB8fHx8MTc4Mjk5NDY2Nnww&ixlib=rb-4.1.0&q=85",
    known: "Where the Crawdads Sing",
    tag: "Mystery · #1 NYT Bestseller",
  },
  {
    name: "Sarah J. Maas",
    img: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxwb3J0cmFpdCUyMG9mJTIwYXV0aG9yJTIwd3JpdGVyfGVufDB8fHx8MTc4Mjk5NDY2Nnww&ixlib=rb-4.1.0&q=85",
    known: "ACOTAR, Throne of Glass",
    tag: "Fantasy Romance · 40M Copies",
  },
];

export default function Authors() {
  return (
    <section id="authors" className="py-24 md:py-32 bg-[#f6f6f6]" data-testid="authors-section">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between gap-6 mb-14">
          <div>
            <p className="eyebrow text-[#D90429] mb-4">● 06 / Voices</p>
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-[-0.02em] leading-[0.9]">
              Authors<br />We Love.
            </h2>
          </div>
          <p className="hidden md:block max-w-xs text-sm text-[#555] leading-relaxed">
            The storytellers behind our shelves — and the reason we keep the lights on late.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {AUTHORS.map((a, i) => (
            <motion.article
              key={a.name}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              data-testid={`author-${a.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative bg-white overflow-hidden"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={a.img} alt={a.name}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-4 right-4 w-10 h-10 grid place-items-center bg-white/90 backdrop-blur">
                  <ArrowUpRight className="w-4 h-4 text-[#0a0a0a]" />
                </div>
              </div>
              <div className="p-6">
                <div className="eyebrow text-[#D90429] mb-2">{a.tag}</div>
                <h3 className="font-display text-2xl font-bold tracking-tight">{a.name}</h3>
                <p className="text-sm text-[#555] mt-2">{a.known}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
