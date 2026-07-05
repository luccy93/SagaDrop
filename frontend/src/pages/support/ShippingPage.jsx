import { motion } from "framer-motion";
import { Truck, Globe, Clock, Shield } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const ZONES = [
  { zone: "Metro Cities", cities: "Mumbai · Delhi · Bangalore · Chennai · Kolkata · Hyderabad", time: "2–3 business days", cost: "Free above ₹499" },
  { zone: "Tier 2 Cities", cities: "Pune · Ahmedabad · Jaipur · Lucknow · Surat and 200+ more", time: "4–5 business days", cost: "Free above ₹499" },
  { zone: "Rest of India",  cities: "All PIN codes covered by our logistics network", time: "5–7 business days", cost: "₹49 flat" },
  { zone: "International", cities: "US · UK · Canada · UAE · Singapore · Australia", time: "10–21 business days", cost: "Calculated at checkout" },
];

export default function ShippingPage() {
  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Support / Shipping</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Shipping<br />& Delivery.
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">Every book is packed with care and tracked in real time, from our shelf to yours.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Truck,  title: "Fast Dispatch",    body: "Orders placed before 2 PM IST ship the same day." },
              { icon: Globe,  title: "Ships Worldwide",  body: "We deliver to 30+ countries with full tracking." },
              { icon: Clock,  title: "Real-Time Updates",body: "SMS & email notifications at every stage." },
              { icon: Shield, title: "Safe Packaging",   body: "Rigid mailers and bubble wrap — zero transit damage." },
            ].map(({ icon: Icon, title, body }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="border border-black/10 p-7">
                <Icon className="w-6 h-6 text-[#D90429] mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-bold tracking-tight mb-2">{title}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>

          <h2 className="font-display text-3xl font-black tracking-tight mb-8">Delivery Zones</h2>
          <div className="border border-black/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f6f6f6]">
                {["Zone", "Coverage", "Estimated Time", "Cost"].map((h) => (
                  <th key={h} className="text-left px-6 py-4 eyebrow text-[#555]">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {ZONES.map((z, i) => (
                  <tr key={z.zone} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                    <td className="px-6 py-4 font-semibold">{z.zone}</td>
                    <td className="px-6 py-4 text-[#555]">{z.cities}</td>
                    <td className="px-6 py-4">{z.time}</td>
                    <td className="px-6 py-4 text-[#D90429] font-semibold">{z.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
