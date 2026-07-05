import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";

export default function PageLayout({ children }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
