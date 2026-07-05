import PageLayout from "@/components/PageLayout";
import BookCustomizer from "@/components/BookCustomizer";
import { motion } from "framer-motion";

export default function BookCustomizerPage() {
  return (
    <PageLayout>
      <section className="pt-36 pb-12 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12">
            <p className="eyebrow text-[#D90429] mb-4">● Discover / Book Customizer</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Design Your<br />Book.
            </h1>
            <p className="mt-6 text-sm text-[#555] max-w-lg leading-relaxed">
              Choose your cover, foil, material, and generate a custom AI cover — then add it to your cart.
            </p>
          </motion.div>
        </div>
      </section>
      <BookCustomizer />
    </PageLayout>
  );
}
