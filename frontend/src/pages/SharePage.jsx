import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Copy, BookOpen, Loader2 } from "lucide-react";
import { fetchShare } from "@/lib/api";
import { toast } from "sonner";

export default function SharePage() {
  const { id } = useParams();
  const [share, setShare] = useState(null);
  const [error, setError] = useState(null); // "notfound" | "network"

  useEffect(() => {
    setError(null);
    fetchShare(id)
      .then((data) => {
        setShare(data);
        document.title = `${data.title} — SagaDrop Custom Edition`;
      })
      .catch((e) => setError(e?.response?.status === 404 ? "notfound" : "network"));
  }, [id]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-white grain" data-testid="share-page">
      {/* Minimal header */}
      <header className="border-b border-black/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline" data-testid="share-page-logo">
            <BookOpen className="w-6 h-6 text-[#D90429]" />
            <span className="font-display text-2xl font-black tracking-tight text-[#0a0a0a]">
              SAGA<span className="text-[#D90429]">DROP</span>
            </span>
          </Link>
          <Link
            to="/"
            className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#0a0a0a] no-underline hover:text-[#D90429]"
          >
            Visit Store
          </Link>
        </div>
      </header>

      {error === "notfound" ? (
        <div className="max-w-xl mx-auto px-6 py-40 text-center" data-testid="share-not-found">
          <p className="eyebrow text-[#D90429] mb-4">● 404</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">Edition Not Found.</h1>
          <p className="mt-4 text-[#555]">This shared edition may have been removed.</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 bg-[#D90429] text-white px-8 py-4 no-underline text-[12px] uppercase tracking-[0.15em] font-semibold"
          >
            Back to SagaDrop <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : error === "network" ? (
        <div className="max-w-xl mx-auto px-6 py-40 text-center" data-testid="share-error">
          <p className="eyebrow text-[#D90429] mb-4">● Connection Issue</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">Couldn't Load Edition.</h1>
          <p className="mt-4 text-[#555]">Check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            data-testid="share-retry-btn"
            className="mt-8 inline-flex items-center gap-2 bg-[#0a0a0a] hover:bg-[#333] text-white px-8 py-4 text-[12px] uppercase tracking-[0.15em] font-semibold"
          >
            Retry
          </button>
        </div>
      ) : !share ? (
        <div className="grid place-items-center py-52" data-testid="share-loading">
          <Loader2 className="w-8 h-8 animate-spin text-[#D90429]" />
        </div>
      ) : (
        <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center"
            >
              <img
                src={share.cover_url}
                alt={share.title}
                data-testid="share-page-cover"
                className="w-full max-w-[380px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow text-[#D90429] mb-4">● Custom AI Edition</p>
              <h1
                data-testid="share-page-title"
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.02em] leading-[0.92]"
              >
                {share.title}
              </h1>
              {share.author && (
                <p className="mt-4 text-lg text-[#555]" data-testid="share-page-author">
                  by {share.author}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="px-4 py-2 border border-black/15 text-[11px] uppercase tracking-[0.15em] font-semibold">
                  {share.material}
                </span>
                <span className="px-4 py-2 border border-black/15 text-[11px] uppercase tracking-[0.15em] font-semibold">
                  {share.foil} foil
                </span>
                <span className="px-4 py-2 bg-[#0a0a0a] text-white text-[11px] uppercase tracking-[0.15em] font-semibold inline-flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> {share.views.toLocaleString()} views
                </span>
              </div>

              <p className="mt-8 text-[#555] leading-relaxed max-w-md">
                This one-of-a-kind cover was designed with AI in the SagaDrop
                Book Customizer. Create your own bespoke edition — pick the
                material, foil, and typography, and let AI paint the rest.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/#customizer"
                  data-testid="design-your-own-btn"
                  className="group inline-flex items-center gap-3 bg-[#D90429] hover:bg-[#B00320] text-white px-8 py-4 no-underline transition-colors"
                >
                  <span className="text-[13px] font-semibold tracking-[0.15em] uppercase">Design Your Own</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={copyLink}
                  data-testid="share-page-copy-btn"
                  className="inline-flex items-center gap-2 border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white px-8 py-4 text-[13px] uppercase tracking-[0.15em] font-semibold transition-colors"
                >
                  <Copy className="w-4 h-4" /> Copy Link
                </button>
              </div>

              <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-[#999]">
                Published {new Date(share.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </motion.div>
          </div>
        </main>
      )}
    </div>
  );
}
