import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const SOCIALS = [
  {
    key: "x",
    label: "X / Twitter",
    url: (link, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    url: (link, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    url: (link) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
  },
];

export default function ShareModal({ open, onClose, share, cover, title, author }) {
  const [copied, setCopied] = useState(false);
  if (!share) return null;

  const shareText = `"${title}" — my custom AI-designed edition on SagaDrop`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(share.share_url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center p-4"
          onClick={onClose}
          data-testid="share-modal-overlay"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white w-full max-w-lg p-8 md:p-10 relative"
            onClick={(e) => e.stopPropagation()}
            data-testid="share-modal"
          >
            <button
              onClick={onClose}
              data-testid="share-modal-close"
              className="absolute top-5 right-5 w-9 h-9 grid place-items-center hover:bg-black/5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="eyebrow text-[#D90429] mb-3">● Edition Published</p>
            <h3 className="font-display text-3xl md:text-4xl font-black tracking-[-0.02em] leading-[0.95]">
              Share Your<br />Custom Book.
            </h3>

            <div className="mt-6 flex gap-5 items-center">
              {cover && (
                <img
                  src={cover} alt={title}
                  className="w-20 h-28 object-cover shadow-lg shrink-0"
                  data-testid="share-modal-cover"
                />
              )}
              <div>
                <div className="font-display text-lg font-bold leading-tight">{title}</div>
                {author && <div className="text-sm text-[#555] mt-1">by {author}</div>}
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#999] mt-2">
                  Public link · anyone can view
                </div>
              </div>
            </div>

            <div className="mt-7">
              <p className="eyebrow mb-2">Public Link</p>
              <div className="flex border border-black/15">
                <input
                  readOnly value={share.share_url}
                  data-testid="share-link-input"
                  className="flex-1 px-4 py-3 text-[13px] text-[#333] bg-[#fafafa] outline-none truncate"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  onClick={copyLink}
                  data-testid="copy-share-link-btn"
                  className="px-5 bg-[#0a0a0a] hover:bg-[#333] text-white inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-semibold"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="eyebrow mb-3">Share To</p>
              <div className="grid grid-cols-3 gap-[1px] bg-black/10">
                {SOCIALS.map((s) => (
                  <a
                    key={s.key}
                    href={s.url(share.share_url, shareText)}
                    target="_blank" rel="noreferrer"
                    data-testid={`share-${s.key}-btn`}
                    className="bg-white hover:bg-[#0a0a0a] hover:text-white p-4 text-center text-[11px] uppercase tracking-[0.12em] font-semibold no-underline text-[#0a0a0a] transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            <a
              href={share.app_url}
              target="_blank" rel="noreferrer"
              data-testid="view-share-page-btn"
              className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] font-semibold text-[#D90429] no-underline hover:underline"
            >
              View public page <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
