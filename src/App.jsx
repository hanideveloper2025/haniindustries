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
import "./App.css"

function App() {
  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminUser")
  }

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
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
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
