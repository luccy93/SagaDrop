import { Link } from "react-router-dom";
import { XCircle, ShoppingBag } from "lucide-react";

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-24">
      <XCircle className="w-16 h-16 text-[#D90429] mb-8" strokeWidth={1.5} />
      <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
        Payment Cancelled
      </h1>
      <p className="text-[#555] text-center max-w-md mb-10 leading-relaxed">
        No worries — your cart is still waiting for you. Come back whenever you're ready.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#D90429] hover:bg-[#B00320] text-white px-8 py-4 text-[12px] tracking-[0.18em] uppercase font-semibold transition-colors"
      >
        <ShoppingBag className="w-4 h-4" />
        Back to Store
      </Link>
    </div>
  );
}
