import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success("Message sent! We'll reply within 24 hours.");
  };

  const field = (key, label, type = "text", rows) => (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      {rows ? (
        <textarea rows={rows} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] resize-none" />
      ) : (
        <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a]" />
      )}
    </div>
  );

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Support / Contact</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Get in<br />Touch.
            </h1>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-16">
            <div className="space-y-10">
              {[
                { icon: Mail,    label: "Email",    val: "hello@sagadrop.com" },
                { icon: Phone,   label: "Phone",    val: "+91 98765 43210" },
                { icon: MapPin,  label: "Address",  val: "12 Literary Lane, Bandra West, Mumbai 400050" },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-10 h-10 border border-black/15 grid place-items-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#D90429]" />
                  </div>
                  <div>
                    <p className="eyebrow mb-1">{label}</p>
                    <p className="text-sm text-[#555]">{val}</p>
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-black/10">
                <p className="eyebrow mb-2">Hours</p>
                <p className="text-sm text-[#555]">Mon–Sat · 9 AM – 7 PM IST</p>
                <p className="text-sm text-[#555]">Sunday · 11 AM – 4 PM IST</p>
              </div>
            </div>

            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 border border-black/10 text-center">
                <Send className="w-10 h-10 text-[#D90429] mb-4" />
                <h2 className="font-display text-3xl font-black tracking-tight mb-3">Message received.</h2>
                <p className="text-sm text-[#555] max-w-xs">We'll get back to you within 24 hours. Check your inbox.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {field("name", "Your Name")}
                  {field("email", "Email Address", "email")}
                </div>
                {field("subject", "Subject")}
                {field("message", "Message", "text", 6)}
                <button type="submit"
                  className="w-full bg-[#D90429] hover:bg-[#B00320] text-white py-4 text-[12px] tracking-[0.18em] uppercase font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Send className="w-3.5 h-3.5" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
