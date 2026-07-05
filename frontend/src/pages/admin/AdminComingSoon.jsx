import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import AdminLayout from "./AdminLayout";

export default function AdminComingSoon({ title = "Coming Soon" }) {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-black tracking-tight">{title}</h1>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="bg-white border border-black/10 flex flex-col items-center justify-center py-32 text-center"
      >
        <Construction className="w-10 h-10 text-[#D90429] mb-5" strokeWidth={1.5} />
        <h2 className="font-display text-2xl font-bold tracking-tight mb-3">{title}</h2>
        <p className="text-sm text-[#555] max-w-xs">
          This admin module is under construction. Connect MongoDB and expand the backend to enable this feature.
        </p>
      </motion.div>
    </AdminLayout>
  );
}
