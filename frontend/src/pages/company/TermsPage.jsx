import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";

const SECTIONS = [
  { title: "1. Acceptance of Terms", body: "By accessing or using SagaDrop, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services." },
  { title: "2. Use of the Platform", body: "SagaDrop grants you a limited, non-exclusive, non-transferable licence to access and use our platform for personal, non-commercial purposes. You may not scrape, reproduce, or resell any part of our content or catalog without written permission." },
  { title: "3. Account Responsibility", body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorised use." },
  { title: "4. Pricing and Payment", body: "All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We reserve the right to change prices at any time. Payment is processed securely by Stripe and Razorpay." },
  { title: "5. Orders and Cancellations", body: "Once an order is placed and payment confirmed, cancellation is only possible within 1 hour. Collector and Limited Editions are final sale and cannot be cancelled." },
  { title: "6. Intellectual Property", body: "All content on SagaDrop — including text, images, logos, book descriptions, and AI-generated recommendations — is the property of SagaDrop Technologies Pvt. Ltd. and is protected by copyright." },
  { title: "7. Privacy", body: "Your use of SagaDrop is also governed by our Privacy Policy, which is incorporated into these Terms by reference." },
  { title: "8. Limitation of Liability", body: "SagaDrop shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the platform, even if we have been advised of the possibility of such damages." },
  { title: "9. Governing Law", body: "These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra." },
  { title: "10. Changes to Terms", body: "We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance. Last updated: 1 July 2026." },
];

export default function TermsPage() {
  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● SagaDrop / Legal</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Terms of<br />Service.
            </h1>
            <p className="mt-6 text-sm text-[#555]">Effective date: 1 July 2026</p>
          </motion.div>

          <div className="max-w-3xl space-y-10">
            {SECTIONS.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.5 }}>
                <h2 className="font-display text-xl font-bold tracking-tight mb-3">{s.title}</h2>
                <p className="text-sm text-[#555] leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
