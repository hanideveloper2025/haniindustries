import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./Components/Header"
import Footer from "./Components/Footer"
import HomePage from "./Components/HomePage"
import CollectionsPage from "./Components/Collections/collection"
import ProductsPage from "./Components/products/products"
import CartPage from "./Components/Cart/cart"
import "./App.css"

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/products/:id" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

export default App
