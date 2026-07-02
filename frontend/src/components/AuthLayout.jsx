import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function AuthLayout({ tagline, headline, children }) {
  return (
    <div className="min-h-screen bg-white grid lg:grid-cols-2">
      {/* Left — editorial panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0a0a0a] text-white p-14 grain">
        <Link to="/" className="flex items-center gap-2 no-underline text-white" data-testid="auth-logo">
          <BookOpen className="w-6 h-6 text-[#D90429]" strokeWidth={2.2} />
          <span className="font-display text-[22px] font-black tracking-tight">
            SAGA<span className="text-[#D90429]">DROP</span>
          </span>
        </Link>
        <div>
          <p className="eyebrow text-[#D90429] mb-6">● {tagline}</p>
          <h1 className="font-display text-6xl xl:text-7xl font-black tracking-[-0.03em] leading-[0.9] whitespace-pre-line">
            {headline}
          </h1>
        </div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
          AI Powered Story Marketplace · Est. 2026
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-col p-6 md:p-14">
        <div className="lg:hidden mb-10">
          <Link to="/" className="flex items-center gap-2 no-underline text-black">
            <BookOpen className="w-6 h-6 text-[#D90429]" strokeWidth={2.2} />
            <span className="font-display text-[22px] font-black tracking-tight">
              SAGA<span className="text-[#D90429]">DROP</span>
            </span>
          </Link>
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
