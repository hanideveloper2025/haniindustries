"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "./Header.css"

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-top-content">
          <p>India's Only Physically Refined Chemical Free Sunflower Oil</p>
        </div>
      </div>

      <div className="header-main">
        <div className="header-container">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="Sunpure Logo" className="logo-img" />
            <span>SUNPURE</span>
          </Link>

          <div className="search-bar">
            <input type="text" placeholder="Search for..." />
            <button className="search-btn">🔍</button>
          </div>

          <div className="header-actions">
            <button className="account-btn">👤 Account</button>
            <button className="cart-btn">🛒 Rs. 10,200</button>
          </div>

          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>
      </div>

      <nav className={`navbar ${isMenuOpen ? "active" : ""}`}>
        <Link to="/">HOME</Link>
        <Link to="/">BISO STORE</Link>
        <Link to="/collections">SHOP BY CATEGORY</Link>
        <Link to="/">OFFERS</Link>
        <Link to="/">CONTACT</Link>
      </nav>
    </header>
  )
}

export default Header
