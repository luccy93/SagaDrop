import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/context/AuthContext";
import SmoothScroll from "@/components/SmoothScroll";

// Core pages
import Home            from "@/pages/Home";
import SharePage       from "@/pages/SharePage";
import LoginPage       from "@/pages/LoginPage";
import SignupPage      from "@/pages/SignupPage";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel  from "@/pages/CheckoutCancel";

// Shop
import TrendingPage          from "@/pages/shop/TrendingPage";
import NewReleasesPage       from "@/pages/shop/NewReleasesPage";
import BestsellersPage       from "@/pages/shop/BestsellersPage";
import CollectorEditionsPage from "@/pages/shop/CollectorEditionsPage";
import GiftCardsPage         from "@/pages/shop/GiftCardsPage";

// Discover
import CategoriesPage      from "@/pages/discover/CategoriesPage";
import AILibrarianPage     from "@/pages/discover/AILibrarianPage";
import BookCustomizerPage  from "@/pages/discover/BookCustomizerPage";
import AuthorsPage         from "@/pages/discover/AuthorsPage";
import ReviewsPage         from "@/pages/discover/ReviewsPage";

// Support
import TrackOrderPage from "@/pages/support/TrackOrderPage";
import ShippingPage   from "@/pages/support/ShippingPage";
import ReturnsPage    from "@/pages/support/ReturnsPage";
import FAQPage        from "@/pages/support/FAQPage";
import ContactPage    from "@/pages/support/ContactPage";

// Company
import AboutPage          from "@/pages/company/AboutPage";
import CareersPage        from "@/pages/company/CareersPage";
import PressPage          from "@/pages/company/PressPage";
import SustainabilityPage from "@/pages/company/SustainabilityPage";
import TermsPage          from "@/pages/company/TermsPage";

// Admin
import AdminDashboard  from "@/pages/admin/AdminDashboard";
import AdminBooks      from "@/pages/admin/AdminBooks";
import AdminOrders     from "@/pages/admin/AdminOrders";
import AdminAnalytics  from "@/pages/admin/AdminAnalytics";
import AdminComingSoon from "@/pages/admin/AdminComingSoon";

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        <StoreProvider>
          <BrowserRouter>
            <SmoothScroll />
            <Routes>
              {/* Core */}
              <Route path="/"                 element={<Home />} />
              <Route path="/share/:id"        element={<SharePage />} />
              <Route path="/login"            element={<LoginPage />} />
              <Route path="/signup"           element={<SignupPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel"  element={<CheckoutCancel />} />

              {/* Shop */}
              <Route path="/trending"           element={<TrendingPage />} />
              <Route path="/new-releases"       element={<NewReleasesPage />} />
              <Route path="/bestsellers"        element={<BestsellersPage />} />
              <Route path="/collector-editions" element={<CollectorEditionsPage />} />
              <Route path="/gift-cards"         element={<GiftCardsPage />} />

              {/* Discover */}
              <Route path="/categories"    element={<CategoriesPage />} />
              <Route path="/ai-librarian"  element={<AILibrarianPage />} />
              <Route path="/book-customizer" element={<BookCustomizerPage />} />
              <Route path="/authors"       element={<AuthorsPage />} />
              <Route path="/reviews"       element={<ReviewsPage />} />

              {/* Support */}
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/shipping"    element={<ShippingPage />} />
              <Route path="/returns"     element={<ReturnsPage />} />
              <Route path="/faq"         element={<FAQPage />} />
              <Route path="/contact"     element={<ContactPage />} />

              {/* Company */}
              <Route path="/about"          element={<AboutPage />} />
              <Route path="/careers"        element={<CareersPage />} />
              <Route path="/press"          element={<PressPage />} />
              <Route path="/sustainability" element={<SustainabilityPage />} />
              <Route path="/terms"          element={<TermsPage />} />

              {/* Admin */}
              <Route path="/admin"             element={<AdminDashboard />} />
              <Route path="/admin/books"       element={<AdminBooks />} />
              <Route path="/admin/orders"      element={<AdminOrders />} />
              <Route path="/admin/analytics"   element={<AdminAnalytics />} />
              <Route path="/admin/customers"   element={<AdminComingSoon title="Customers" />} />
              <Route path="/admin/coupons"     element={<AdminComingSoon title="Coupons" />} />
              <Route path="/admin/settings"    element={<AdminComingSoon title="Settings" />} />

              {/* Fallback */}
              <Route path="*" element={<Home />} />
            </Routes>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#0a0a0a",
                  color: "#fff",
                  border: "1px solid #0a0a0a",
                  borderRadius: 0,
                },
              }}
            />
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </div>
  );
}
