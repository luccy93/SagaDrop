import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, BookOpen } from "lucide-react";
import { http } from "@/lib/api";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    http.get(`/checkout/stripe/session/${sessionId}`)
      .then(r => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-24">
      <CheckCircle className="w-16 h-16 text-[#D90429] mb-8" strokeWidth={1.5} />
      <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
        Order Confirmed
      </h1>
      <p className="text-[#555] text-center max-w-md mb-8 leading-relaxed">
        {order?.customer_email
          ? `A confirmation has been sent to ${order.customer_email}.`
          : "Thank you for your purchase. Your books are on their way."}
      </p>

      {!loading && order?.items?.length > 0 && (
        <div className="w-full max-w-md border border-black/5 divide-y divide-black/5 mb-10">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-baseline justify-between px-6 py-4">
              <span className="font-display font-semibold text-sm">
                {item.title}
                {item.qty > 1 && <span className="text-[#999] font-normal ml-2">×{item.qty}</span>}
              </span>
              <span className="text-sm ml-4 shrink-0">₹{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          {order.total > 0 && (
            <div className="flex items-baseline justify-between px-6 py-4 bg-[#fafafa]">
              <span className="eyebrow">Total</span>
              <span className="font-display font-black text-2xl">₹{order.total.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#D90429] hover:bg-[#B00320] text-white px-8 py-4 text-[12px] tracking-[0.18em] uppercase font-semibold transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        Continue Shopping
      </Link>
    </div>
  );
}
