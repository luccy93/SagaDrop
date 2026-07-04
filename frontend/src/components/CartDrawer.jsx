import { useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, CreditCard, Smartphone } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { http } from "@/lib/api";

// Dynamically load Razorpay checkout script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CartDrawer() {
  const { cart, totals, removeFromCart, updateQty, clearCart, cartOpen, setCartOpen } = useStore();
  const { user } = useAuth() || {};
  const [stripeLoading, setStripeLoading] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  const origin = window.location.origin;

  // Strip to {id, qty} — prices are resolved server-side from the catalog
  const cartPayload = useMemo(() => cart.map(({ id, qty }) => ({ id, qty })), [cart]);

  const handleStripeCheckout = useCallback(async () => {
    if (!cart.length) return;
    setStripeLoading(true);
    try {
      const { data } = await http.post("/checkout/stripe/session", {
        items: cartPayload,
        customer_email: user?.email || null,
        success_url: `${origin}/checkout/success`,
        cancel_url: `${origin}/checkout/cancel`,
      });
      window.location.href = data.url;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Stripe checkout unavailable. Check that STRIPE_SECRET_KEY is set.";
      toast.error(msg);
      setStripeLoading(false);
    }
  }, [cart, cartPayload, user, origin]);

  const handleRazorpayCheckout = useCallback(async () => {
    if (!cart.length) return;
    setRazorpayLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay SDK");

      const { data: order } = await http.post("/checkout/razorpay/order", {
        items: cartPayload,
        customer_email: user?.email || null,
      });

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "SagaDrop",
        description: `${totals.items} book${totals.items !== 1 ? "s" : ""}`,
        prefill: user?.email ? { email: user.email } : {},
        theme: { color: "#D90429" },
        handler: async (response) => {
          try {
            await http.post("/checkout/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customer_email: user?.email || null,
              items: cartPayload,
            });
            clearCart();
            setCartOpen(false);
            window.location.href = `${origin}/checkout/success`;
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => setRazorpayLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Razorpay checkout unavailable. Check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set.";
      toast.error(msg);
      setRazorpayLoading(false);
    }
  }, [cart, cartPayload, user, totals, clearCart, setCartOpen, origin]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        >
          <motion.aside
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="cart-drawer"
            className="absolute top-0 right-0 h-full w-full sm:w-[460px] bg-white flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 h-[72px] border-b border-black/5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#D90429]" />
                <span className="eyebrow">Your Cart</span>
                <span className="eyebrow text-[#D90429]">· {totals.items}</span>
              </div>
              <button onClick={() => setCartOpen(false)} data-testid="close-cart-btn">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {cart.length === 0 ? (
                <div className="text-center py-24 text-sm text-[#555]">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-4 text-[#D90429]" />
                  Your cart is quiet. Add a story.
                </div>
              ) : (
                <ul className="space-y-6">
                  {cart.map((item) => (
                    <li key={item.id} className="flex gap-4 border-b border-black/5 pb-6"
                      data-testid={`cart-item-${item.id}`}>
                      <div className="w-20 h-28 bg-[#f6f6f6] flex-shrink-0 overflow-hidden">
                        <img src={item.cover} alt={item.title}
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200"; }}
                          className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-base leading-tight truncate">{item.title}</h3>
                        <p className="text-xs text-[#555] mt-1">{item.author}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center border border-black/10">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 grid place-items-center"><Minus className="w-3 h-3" /></button>
                            <span className="w-8 text-center text-sm">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 grid place-items-center"><Plus className="w-3 h-3" /></button>
                          </div>
                          <span className="font-display font-bold text-sm">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                        <button onClick={() => removeFromCart(item.id)}
                          className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#999] hover:text-[#D90429]">
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-black/5 px-8 py-6 space-y-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="eyebrow">Subtotal</span>
                  <span className="font-display text-3xl font-black">₹{totals.subtotal.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-[#555]">Shipping and taxes calculated at checkout.</p>

                {/* Stripe — card payments */}
                <button
                  data-testid="checkout-btn"
                  onClick={handleStripeCheckout}
                  disabled={stripeLoading || razorpayLoading}
                  className="w-full bg-[#D90429] hover:bg-[#B00320] disabled:opacity-60 text-white py-4 text-[12px] tracking-[0.18em] uppercase font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  {stripeLoading ? "Redirecting…" : "Pay with Card · Stripe"}
                </button>

                {/* Razorpay — UPI / Indian cards */}
                <button
                  data-testid="checkout-razorpay-btn"
                  onClick={handleRazorpayCheckout}
                  disabled={stripeLoading || razorpayLoading}
                  className="w-full border border-black hover:bg-black hover:text-white disabled:opacity-60 text-black py-4 text-[12px] tracking-[0.18em] uppercase font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  {razorpayLoading ? "Opening…" : "Pay with UPI / Cards · Razorpay"}
                </button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
