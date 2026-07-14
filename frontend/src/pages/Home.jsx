import Navbar from "@/components/Navbar";
import Hero3D from "@/components/Hero3D";
import Marquee from "@/components/Marquee";
import TrendingBooks from "@/components/TrendingBooks";
import Categories from "@/components/Categories";
import RecommendationStudio from "@/components/RecommendationStudio";
import BookCustomizer from "@/components/BookCustomizer";
import Collections from "@/components/Collections";
import Authors from "@/components/Authors";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";

export default function Home() {
  return (
    <main data-testid="home-page" className="bg-white text-[#0a0a0a]">
      <Navbar />
      <Hero3D />
      <Marquee />
      <TrendingBooks />
      <Categories />
      <RecommendationStudio />
      <BookCustomizer />
      <Collections />
      <Authors />
      <Newsletter />
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </main>
  );
}
