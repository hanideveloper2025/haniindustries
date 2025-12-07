"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "./Cart/CartContext"
import "./Header.css"

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { getCartCount } = useCart()

  return (
    <header className="header">

      <div className="header-main">
        <div className="header-container">
          <Link to="/" className="logo">
            <img src="/logo_1.png" alt="Hani Industries Logo" className="logo-img" />
          </Link>

          <div className="search-bar">
            <input type="text" placeholder="Search for..." />
            <button className="search-btn"><img src="/search.svg" alt="Cart" style={{ width: '1.5em', height: '1.5em' }} /></button>
          </div>

          <div className="header-actions">
            <Link to="/cart" className="cart-btn"><img src="/cart.svg" alt="Cart" style={{ width: '1.5em', height: '1.5em' }} /> <span style={{ backgroundColor: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.8em' , margin: '5px' }}>{getCartCount()}</span></Link>
          </div>

          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      <nav className={`navbar ${isMenuOpen ? "active" : ""}`}>
        <Link to="/">HOME</Link>

        <div className="dropdown">
          <button
            className="dropdown-toggle"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            SHOP BY CATEGORY ▼
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link
                to="/collections?category=oil"
                onClick={() => setIsDropdownOpen(false)}
              >
                Oils
              </Link>

              <Link
                to="/collections?category=cleaners"
                onClick={() => setIsDropdownOpen(false)}
              >
                Cleaners
              </Link>

              <Link
                to="/collections?category=appalam"
                onClick={() => setIsDropdownOpen(false)}
              >
                Appalam
              </Link>

              <Link
                to="/collections?category=others"
                onClick={() => setIsDropdownOpen(false)}
              >
                Others
              </Link>
            </div>
          )}
        </div>

        <Link to="/collections">OFFERS</Link>
        <Link to="/Contact">CONTACT</Link>
      </nav>
    </header>
  )
}

export default Header
