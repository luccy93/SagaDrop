import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const STEPS = [
  { icon: CheckCircle, label: "Order Placed",    done: true  },
  { icon: Package,     label: "Processing",      done: true  },
  { icon: Truck,       label: "Dispatched",      done: false },
  { icon: CheckCircle, label: "Out for Delivery", done: false },
  { icon: CheckCircle, label: "Delivered",        done: false },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [tracked, setTracked] = useState(false);

  return (
    <PageLayout>
      <section className="pt-36 pb-24 bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-16">
            <p className="eyebrow text-[#D90429] mb-4">● Support / Track Order</p>
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-[-0.02em] leading-[0.9]">
              Where's<br />My Book?
            </h1>
          </motion.div>

          <div className="max-w-xl">
            <div className="flex gap-3 mb-12">
              <input
                type="text" placeholder="Enter Order ID (e.g. ORD-2026-XXXX)"
                value={orderId} onChange={(e) => setOrderId(e.target.value)}
                className="flex-1 border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a]"
              />
              <button
                onClick={() => orderId && setTracked(true)}
                className="bg-[#D90429] hover:bg-[#B00320] text-white px-6 py-3 text-[11px] uppercase tracking-[0.18em] font-semibold flex items-center gap-2 transition-colors"
              >
                <Search className="w-3.5 h-3.5" /> Track
              </button>
            </div>

            {tracked && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="border border-black/10 p-8 mb-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="eyebrow mb-1">Order ID</p>
                      <p className="font-display text-xl font-bold">{orderId}</p>
                    </div>
                    <span className="bg-[#FFF3CD] text-[#856404] text-[10px] uppercase tracking-[0.15em] font-bold px-3 py-1.5">In Transit</span>
                  </div>
                  <div className="space-y-0">
                    {STEPS.map((step, i) => (
                      <div key={step.label} className="flex gap-4 items-start">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full grid place-items-center ${step.done ? "bg-[#D90429]" : "bg-[#f6f6f6] border border-black/10"}`}>
                            <step.icon className={`w-4 h-4 ${step.done ? "text-white" : "text-[#999]"}`} />
                          </div>
                          {i < STEPS.length - 1 && <div className={`w-0.5 h-8 mt-1 ${step.done ? "bg-[#D90429]" : "bg-[#e5e5e5]"}`} />}
                        </div>
                        <div className="pt-1.5 pb-8">
                          <p className={`text-sm font-semibold ${step.done ? "text-[#0a0a0a]" : "text-[#999]"}`}>{step.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#999] flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Estimated delivery: 2–3 business days</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
