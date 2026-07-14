export default function Marquee() {
  const items = [
    "New Season 2026",
    "Curated Recommendations",
    "Custom Book Editions",
    "Free Shipping over ₹999",
    "Every Story Begins Here",
    "Custom Cover Studio",
  ];
  const doubled = [...items, ...items, ...items];
  return (
    <section className="border-y border-black/10 py-5 overflow-hidden bg-white" data-testid="marquee-section">
      <div className="marquee">
        {doubled.map((t, i) => (
          <div key={i} className="flex items-center gap-16 flex-shrink-0">
            <span className="font-display text-2xl md:text-3xl italic tracking-tight text-[#0a0a0a]">{t}</span>
            <span className="w-2 h-2 bg-[#D90429]" />
          </div>
        ))}
      </div>
    </section>
  );
}
