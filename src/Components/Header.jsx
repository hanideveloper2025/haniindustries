"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./Cart/CartContext";
import "./Header.css";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    products: [],
    categories: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchSearchResults(searchQuery);
      } else {
        setSearchResults({ products: [], categories: [] });
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSearchResults = async (query) => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `${MAIN}/api/home/search?q=${encodeURIComponent(query)}&limit=6`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults({
          products: data.products || [],
          categories: data.categories || [],
        });
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleProductClick = (product) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(
      `/collections?search=${encodeURIComponent(product.name)}&productId=${
        product.id
      }`
    );
  };

  const handleCategoryClick = (category) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`/collections?category=${category.value}`);
  };

  const handleInputFocus = () => {
    if (
      searchQuery.trim().length >= 2 &&
      (searchResults.products.length > 0 || searchResults.categories.length > 0)
    ) {
      setShowSuggestions(true);
    }
  };

  return (
    <header className="header">
      <div className="header-main">
        <div className="header-container">
          <Link to="/" className="logo">
            <img
              src="/logo_1.png"
              alt="Hani Industries Logo"
              className="logo-img"
            />
          </Link>

          <div className="search-bar" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleInputFocus}
              />
              <button type="submit" className="search-btn">
                <img
                  src="/search.svg"
                  alt="Search"
                  style={{width: "1em", height: "1em" }}
                />
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div className="search-suggestions">
                {isSearching ? (
                  <div className="search-loading">
                    <span>Searching...</span>
                  </div>
                ) : (
                  <>
                    {/* Category Suggestions */}
                    {searchResults.categories.length > 0 && (
                      <div className="suggestion-section">
                        <h4 className="suggestion-title">Categories</h4>
                        {searchResults.categories.map((category) => (
                          <div
                            key={category.value}
                            className="suggestion-item category-item"
                            onClick={() => handleCategoryClick(category)}
                          >
                            <span className="category-icon">📁</span>
                            <span>{category.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Product Suggestions */}
                    {searchResults.products.length > 0 && (
                      <div className="suggestion-section">
                        <h4 className="suggestion-title">Products</h4>
                        {searchResults.products.map((product) => (
                          <div
                            key={product.id}
                            className="suggestion-item product-item"
                            onClick={() => handleProductClick(product)}
                          >
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="suggestion-image"
                            />
                            <div className="suggestion-details">
                              <span className="suggestion-name">
                                {product.name}
                              </span>
                              <span className="suggestion-price">
                                Rs. {product.price}
                              </span>
                            </div>
                            {product.discount > 0 && (
                              <span className="suggestion-discount">
                                -{product.discount}%
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {searchResults.products.length === 0 &&
                      searchResults.categories.length === 0 && (
                        <div className="no-results">
                          <span>No products found for "{searchQuery}"</span>
                        </div>
                      )}

                    {/* View All Results */}
                    {(searchResults.products.length > 0 ||
                      searchResults.categories.length > 0) && (
                      <div
                        className="view-all-results"
                        onClick={handleSearchSubmit}
                      >
                        <span>View all results for "{searchQuery}"</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="header-actions">
            <Link to="/cart" className="cart-btn">
              <div className="cart-icon-wrapper">
                <img src="/cart.svg" alt="Cart" className="cart-icon" />
                {getCartCount() > 0 && (
                  <span className="cart-badge" key={getCartCount()}>
                    {getCartCount() > 99 ? "99+" : getCartCount()}
                  </span>
                )}
              </div>
            </Link>
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
                to="/collections?category=oils"
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

              {/* <Link
                to="/collections?category=others"
                onClick={() => setIsDropdownOpen(false)}
              >
                Others
              </Link> */}
            </div>
          )}
        </div>

        <Link to="/collections?offers=true">OFFERS</Link>
        <Link to="/Contact">CONTACT</Link>
      </nav>
    </header>
  );
}

export default Header;
