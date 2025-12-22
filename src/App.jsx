import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { CartProvider } from "./Components/Cart/CartContext"
import Header from "./Components/Header"
import Footer from "./Components/Footer"
import HomePage from "./Components/HomePage"
import CollectionsPage from "./Components/Collections/collection"
import ProductsPage from "./Components/products/products"
import CartPage from "./Components/Cart/cart"
import CheckoutPage from "./Components/Cart/checkout"
import AdminDashboard from "./Components/Admin/AdminDashboard"
import AdminLogin from "./Components/Admin/Admin_login/AdminLogin"
import PrivateRoute from "./Components/Admin/PrivateRoute"
import Contact from "./Components/Contact"
import ScrollToTop from "./Components/ScrollToTop"
import Terms from "./Components/Terms"
import RefundCancellation from "./Components/RefundCancellation"
import AboutUs from "./Components/AboutUs"
import PrivacyPolicy from "./Components/PrivacyPolicy"
import FAQ from "./Components/FAQ"
import DeliveryPolicy from "./Components/DeliveryPolicy"
import WhatsAppIcon from "./Components/WhatsAppIcon"
import "./App.css"

function App() {
  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminUser")
  }

  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <WhatsAppIcon />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />

          <Route path="/admin" element={
              <PrivateRoute>
                <AdminDashboard onLogout={handleLogout} />
              </PrivateRoute>
            }
          />

          {/* Public Routes with Header and Footer */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <main>
                  <HomePage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/collections"
            element={
              <>
                <Header />
                <main>
                  <CollectionsPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/products/:id"
            element={
              <>
                <Header />
                <main>
                  <ProductsPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/cart"
            element={
              <>
                <Header />
                <main>
                  <CartPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/checkout"
            element={
              <>
                <Header />
                <main>
                  <CheckoutPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Header />
                <main>
                  <Contact />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/terms"
            element={
              <>
                <Header />
                <main>
                  <Terms />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/refund-cancellation"
            element={
              <>
                <Header />
                <main>
                  <RefundCancellation />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/about-us"
            element={
              <>
                <Header />
                <main>
                  <AboutUs />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <>
                <Header />
                <main>
                  <PrivacyPolicy />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/faq"
            element={
              <>
                <Header />
                <main>
                  <FAQ />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/delivery-policy"
            element={
              <>
                <Header />
                <main>
                  <DeliveryPolicy />
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
