import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import SharePage from "@/pages/SharePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import SmoothScroll from "@/components/SmoothScroll";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/context/AuthContext";

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <SmoothScroll />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/share/:id" element={<SharePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
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
