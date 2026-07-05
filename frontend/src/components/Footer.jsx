import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const COLS = [
  {
    title: "Shop",
    links: [
      { label: "Trending",          to: "/trending" },
      { label: "New Releases",      to: "/new-releases" },
      { label: "Bestsellers",       to: "/bestsellers" },
      { label: "Collector Editions",to: "/collector-editions" },
      { label: "Gift Cards",        to: "/gift-cards" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Categories",      to: "/categories" },
      { label: "AI Librarian",    to: "/ai-librarian" },
      { label: "Book Customizer", to: "/book-customizer" },
      { label: "Authors",         to: "/authors" },
      { label: "Reviews",         to: "/reviews" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track Order", to: "/track-order" },
      { label: "Shipping",    to: "/shipping" },
      { label: "Returns",     to: "/returns" },
      { label: "FAQ",         to: "/faq" },
      { label: "Contact",     to: "/contact" },
    ],
  },
  {
    title: "SagaDrop",
    links: [
      { label: "About",          to: "/about" },
      { label: "Careers",        to: "/careers" },
      { label: "Press",          to: "/press" },
      { label: "Sustainability", to: "/sustainability" },
      { label: "Terms",          to: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-white text-[#0a0a0a] border-t border-black/10" data-testid="footer">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)] gap-14">
          <div>
            <Link to="/" className="flex items-center gap-2 no-underline text-black">
              <BookOpen className="w-6 h-6 text-[#D90429]" strokeWidth={2.2} />
              <span className="font-display text-[22px] font-black tracking-tight">
                SAGA<span className="text-[#D90429]">DROP</span>
              </span>
            </Link>
            <p className="mt-6 max-w-md text-sm text-[#555] leading-relaxed">
              A premium marketplace for readers who treat books as heirlooms.
              Curated by humans, augmented by AI, printed with love.
            </p>
            <div className="mt-8 flex gap-6 text-xs uppercase tracking-[0.18em] font-semibold">
              {["Instagram", "TikTok", "X", "YouTube"].map((s) => (
                <a key={s} href="#" className="no-underline text-[#0a0a0a] hover:text-[#D90429] transition-colors">{s}</a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {COLS.map((c) => (
              <div key={c.title}>
                <div className="eyebrow mb-5">{c.title}</div>
                <ul className="space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-sm text-[#555] hover:text-[#D90429] no-underline transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-black/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-lg italic tracking-tight">Every Story Begins Here.</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#555]">© 2026 SagaDrop. All rights reserved.</p>
        </div>
      </div>

      {/* Full-width brand mark */}
      <div className="overflow-x-hidden w-full">
        <div
          className="font-display leading-[0.82] font-black tracking-[-0.05em] text-center whitespace-nowrap select-none py-8 w-full"
          style={{
            fontSize: "clamp(80px, 18vw, 280px)",
            WebkitTextStroke: "1.5px #0a0a0a",
            color: "transparent",
          }}
        >
          SAGADROP
        </div>
      </div>
    </footer>
  );
}
