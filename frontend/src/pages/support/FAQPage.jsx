import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const FAQS = [
  { q: "How long does delivery take?", a: "Standard delivery takes 4–7 business days across India. Express (1–2 days) is available at checkout. International shipping is 10–21 days depending on destination." },
  { q: "Can I return a book?", a: "Yes — we accept returns within 14 days of delivery, provided the book is in its original condition. Collector and Limited Editions must be in their original packaging." },
  { q: "Are the Collector Editions signed?", a: "Many are. Each listing specifies whether it includes a signature, bookplate, or certificate of authenticity. Signed editions are final sale." },
  { q: "How does the AI Librarian work?", a: "Our AI Librarian uses your mood, preferred tone, and free-text description to match books from our catalog. It improves as you interact with it." },
  { q: "Can I customize the book cover?", a: "Yes — visit the Book Customizer to choose cover material, foil colour, font, and embossing. AI Cover Generator is also available for original artwork." },
  { q: "What payment methods do you accept?", a: "We accept all major cards via Stripe (international), and UPI, net banking, and Indian debit/credit cards via Razorpay." },
  { q: "Do you offer gift wrapping?", a: "Yes. Select 'Gift Wrap' at checkout. You can add a handwritten message card and choose from our premium tissue and ribbon options." },
  { q: "How do I track my order?", a: "Once dispatched, you'll receive an email with a tracking number. You can also view live tracking in My Orders under your account." },
  { q: "Are digital / ebook versions available?", a: "We are focused on physical books for now. A digital library is planned for Q3 2026." },
];

function FAQ({ item, i }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.5 }}
      className="border-b border-black/10"
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="font-display text-lg font-bold tracking-tight">{item.q}</span>
        {open ? <Minus className="w-4 h-4 flex-shrink-0 text-[#D90429]" /> : <Plus className="w-4 h-4 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <p className="pb-5 text-sm text-[#555] leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Support / FAQ</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Frequently<br />Asked.
            </h1>
          </motion.div>
          <div className="max-w-3xl">
            {FAQS.map((item, i) => <FAQ key={i} item={item} i={i} />)}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
