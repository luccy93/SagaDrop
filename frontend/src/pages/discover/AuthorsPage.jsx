import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const AUTHORS = [
  { name: "Colleen Hoover",  genre: "Romance · Contemporary",   books: 24, img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80" },
  { name: "Brandon Sanderson", genre: "Fantasy · Epic",        books: 37, img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80" },
  { name: "Madeline Miller",  genre: "Literary · Historical",   books: 4,  img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80" },
  { name: "Stephen King",     genre: "Horror · Thriller",       books: 65, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" },
  { name: "Agatha Christie",  genre: "Mystery · Cozy Crime",    books: 66, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80" },
  { name: "Ernest Cline",     genre: "Sci-Fi · Adventure",      books: 3,  img: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=80" },
  { name: "Sarah J. Maas",    genre: "Fantasy · Romance",       books: 12, img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80" },
  { name: "Andy Weir",        genre: "Sci-Fi · Hard Science",   books: 4,  img: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&auto=format&fit=crop&q=80" },
];

export default function AuthorsPage() {
  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Discover / Authors</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              The<br />Voices.
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">
              Meet the storytellers behind the world's most unforgettable books.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {AUTHORS.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.6 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f6f6f6] mb-5">
                  <img
                    src={a.img} alt={a.name} loading="lazy"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format"; }}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="inline-flex items-center gap-1 text-white text-[11px] uppercase tracking-widest font-semibold">
                      View Books <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold tracking-tight">{a.name}</h3>
                <p className="text-xs text-[#555] mt-1">{a.genre}</p>
                <p className="text-[11px] text-[#D90429] mt-1 uppercase tracking-[0.12em]">{a.books} books</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
