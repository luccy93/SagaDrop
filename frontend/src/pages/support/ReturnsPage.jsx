import { motion } from "framer-motion";
import { RotateCcw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function ReturnsPage() {
  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Support / Returns</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Returns &<br />Exchanges.
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">We want you to love every book. If something's not right, we'll make it right.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              { icon: CheckCircle, color: "#2E7D32", title: "14-Day Returns",      body: "Return any standard book within 14 days of delivery in its original condition for a full refund or exchange." },
              { icon: AlertCircle, color: "#F57C00", title: "Collector Editions",   body: "Collector and Limited Editions must be in unopened original packaging. Signed editions are final sale." },
              { icon: XCircle,     color: "#D90429", title: "Non-Returnable",       body: "Gift cards, digital content, and personalised / custom-printed books cannot be returned." },
            ].map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="border border-black/10 p-8">
                <Icon className="w-7 h-7 mb-5" style={{ color }} strokeWidth={1.5} />
                <h3 className="font-display text-xl font-bold tracking-tight mb-3">{title}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-black tracking-tight mb-8">How to Return</h2>
            <div className="space-y-6">
              {[
                { n: "01", t: "Initiate Return",   d: "Go to My Orders → select item → click 'Return or Exchange'. Your return label is generated instantly." },
                { n: "02", t: "Pack the Book",     d: "Use the original packaging where possible. Include the packing slip and any accessories." },
                { n: "03", t: "Drop Off",          d: "Hand the package to any BlueDart or Delhivery drop point near you. It's pre-paid." },
                { n: "04", t: "Refund Processed",  d: "Refunds are processed within 2 business days of us receiving the item. You'll get an email confirmation." },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-6 items-start border-b border-black/5 pb-6">
                  <span className="font-display text-3xl font-black text-[#D90429] leading-none flex-shrink-0">{n}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight mb-1">{t}</h3>
                    <p className="text-sm text-[#555] leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 bg-[#f6f6f6] p-6">
              <div className="flex items-center gap-2 mb-2"><RotateCcw className="w-4 h-4 text-[#D90429]" /><span className="font-semibold text-sm">Refund Timeline</span></div>
              <p className="text-sm text-[#555]">Stripe / card payments: 3–5 business days. UPI / bank transfer: 1–2 business days.</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
