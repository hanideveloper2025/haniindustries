"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./AdminDashboard.css"
import AddProduct from "./modules/AddProduct"
import AddFeaturedProduct from "./modules/AddFeaturedProduct"
import CartPayment from "./modules/CartPayment"
import Dashboard from "./modules/Dashboard"
import PlacedOrders from "./modules/PlacedOrders"

export default function AdminDashboard({ onLogout }) {
  const [activeModule, setActiveModule] = useState("dashboard")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />
      case "addProduct":
        return <AddProduct />
      case "addFeatured":
        return <AddFeaturedProduct />
      case "payment":
        return <CartPayment />
      case "placedOrders":
        return <PlacedOrders />
      default:
        return <Dashboard />
    }
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    if (onLogout) {
      onLogout()
      navigate("/")
    }
    setShowLogoutModal(false)
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <div className={`admin-container ${isMenuOpen ? 'menu-open' : ''}`}>
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <button
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <div className="title-section">
            <h1 className="admin-title">Hani Industries</h1>
            <p className="admin-subtitle">Admin Dashboard</p>
          </div>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-wrapper">
        {/* Left Side Menu */}
        <aside className={`admin-menu ${isMenuOpen ? 'open' : ''}`}>
          <nav className="menu-nav">
            <div className="menu-header">
              <h2 className="menu-title">Modules</h2>
              <button
                className="menu-close-btn"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <ul className="menu-list">
              <li>
                <button
                  className={`menu-item ${activeModule === "dashboard" ? "active" : ""}`}
                  onClick={() => {
                    setActiveModule("dashboard")
                    setIsMenuOpen(false)
                  }}
                >
                  <span className="menu-icon">📊</span>
                  <span className="menu-text">Dashboard</span>
                </button>
              </li>

              <li>
                <button
                  className={`menu-item ${activeModule === "addProduct" ? "active" : ""}`}
                  onClick={() => {
                    setActiveModule("addProduct")
                    setIsMenuOpen(false)
                  }}
                >
                  <span className="menu-icon">➕</span>
                  <span className="menu-text">Add Product</span>
                </button>
              </li>

              <li>
                <button
                  className={`menu-item ${activeModule === "addFeatured" ? "active" : ""}`}
                  onClick={() => {
                    setActiveModule("addFeatured")
                    setIsMenuOpen(false)
                  }}
                >
                  <span className="menu-icon">⭐</span>
                  <span className="menu-text">Featured Product</span>
                </button>
              </li>

              {/* <li>
                <button
                  className={`menu-item ${activeModule === "payment" ? "active" : ""}`}
                  onClick={() => {
                    setActiveModule("payment")
                    setIsMenuOpen(false)
                  }}
                >
                  <span className="menu-icon">💳</span>
                  <span className="menu-text">Cart & Payment</span>
                </button>
              </li> */}

              <li>
                <button
                  className={`menu-item ${activeModule === "placedOrders" ? "active" : ""}`}
                  onClick={() => {
                    setActiveModule("placedOrders")
                    setIsMenuOpen(false)
                  }}
                >
                  <span className="menu-icon">📦</span>
                  <span className="menu-text">Placed Orders</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="menu-footer">
            <p className="footer-text">© 2025 Hani Industries</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-content">{renderContent()}</main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3 className="modal-title">Confirm Logout</h3>
            <p className="modal-message">Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={cancelLogout}>
                No
              </button>
              <button className="modal-btn confirm-btn" onClick={confirmLogout}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
