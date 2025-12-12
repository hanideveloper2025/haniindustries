"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../ProductCard";
import "../ProductGrid.css";
import "./collection.css";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

function CollectionsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const offersParam = searchParams.get("offers");
  const searchQuery = searchParams.get("search");
  const selectedProductId = searchParams.get("productId");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // Set default offer filter based on URL param (when coming from OFFERS link)
  const [filters, setFilters] = useState({
    availability: "all",
    priceRange: "all",
    offerRange: offersParam === "true" ? "20-100" : "all", // Default to 20%+ offers when coming from OFFERS link
  });
  const [sortBy, setSortBy] = useState("featured");

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build URL with query parameters
        const params = new URLSearchParams();

        // Add category filter (only if no search query)
        if (category && category !== "others" && !searchQuery) {
          params.append("category", category);
        }

        // Add sorting based on sortBy selection
        switch (sortBy) {
          case "price-low":
            params.append("sortBy", "price");
            params.append("sortOrder", "asc");
            break;
          case "price-high":
            params.append("sortBy", "price");
            params.append("sortOrder", "desc");
            break;
          case "rating":
            params.append("sortBy", "rating");
            params.append("sortOrder", "desc");
            break;
          case "featured":
          default:
            params.append("sortBy", "created_at");
            params.append("sortOrder", "desc");
            break;
        }

        // Add price range filter
        if (filters.priceRange !== "all") {
          const [min, max] = filters.priceRange.split("-");
          if (min) params.append("minPrice", min);
          if (max) params.append("maxPrice", max);
        }

        const url = `${MAIN}/api/home/products?${params.toString()}`;
        console.log("Fetching products from:", url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        if (data.success) {
          let filteredProducts = data.data;

          // If there's a search query, filter products by name match
          if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            filteredProducts = filteredProducts.filter(
              (p) =>
                p.name.toLowerCase().includes(searchLower) ||
                p.category.toLowerCase().includes(searchLower) ||
                (p.description &&
                  p.description.toLowerCase().includes(searchLower))
            );
          }

          // Filter by availability (client-side since stock is per variant)
          if (filters.availability === "in-stock") {
            filteredProducts = filteredProducts.filter((p) => p.stock > 0);
          } else if (filters.availability === "low-stock") {
            filteredProducts = filteredProducts.filter(
              (p) => p.stock > 0 && p.stock <= 10
            );
          } else if (filters.availability === "out-of-stock") {
            filteredProducts = filteredProducts.filter((p) => p.stock <= 0);
          }

          // Filter by offer/discount percentage
          // Calculate discount the same way as ProductCard: Math.round(((originalPrice - price) / originalPrice) * 100)
          if (filters.offerRange !== "all") {
            const [minOffer, maxOffer] = filters.offerRange
              .split("-")
              .map(Number);
            filteredProducts = filteredProducts.filter((p) => {
              // Calculate discount percentage from price and originalPrice (same as ProductCard)
              let calculatedDiscount = 0;
              if (
                p.originalPrice &&
                p.originalPrice > 0 &&
                p.price < p.originalPrice
              ) {
                calculatedDiscount = Math.round(
                  ((p.originalPrice - p.price) / p.originalPrice) * 100
                );
              }

              if (maxOffer) {
                return (
                  calculatedDiscount >= minOffer &&
                  calculatedDiscount <= maxOffer
                );
              }
              return calculatedDiscount >= minOffer;
            });
          }

          // If a specific product is selected from search, put it first
          // and then show related products from same category
          if (selectedProductId) {
            const selectedProduct = filteredProducts.find(
              (p) => p.id === selectedProductId
            );
            if (selectedProduct) {
              // Get products from same category, excluding the selected one
              const sameCategory = filteredProducts.filter(
                (p) =>
                  p.category === selectedProduct.category &&
                  p.id !== selectedProductId
              );
              // Get products from other categories
              const otherProducts = filteredProducts.filter(
                (p) => p.category !== selectedProduct.category
              );
              // Reorder: selected product first, then same category, then others
              filteredProducts = [
                selectedProduct,
                ...sameCategory,
                ...otherProducts,
              ];
            }
          }

          setProducts(filteredProducts);
          setTotalProducts(data.total || filteredProducts.length);
        } else {
          throw new Error(data.message || "Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sortBy, filters, searchQuery, selectedProductId]);

  const getPageTitle = () => {
    // If there's a search query, show search results title
    if (searchQuery) {
      return `Search: "${searchQuery}"`;
    }
    // If coming from offers link, show OFFERS title
    if (offersParam === "true" || filters.offerRange !== "all") {
      if (!category) return "OFFERS & DEALS";
    }
    switch (category) {
      case "oils":
        return "EDIBLE OIL";
      case "cleaners":
        return "CLEANERS";
      case "appalam":
        return "APPALAM";
      default:
        return "ALL PRODUCTS";
    }
  };

  return (
    <div className="collections-page">
      <div className="breadcrumb">
        <span>Home</span>
        <span> / </span>
        <span>{searchQuery ? "Search Results" : "Collections"}</span>
        <span> / </span>
        <span className="current">{getPageTitle()}</span>
      </div>

      <div className="collections-container">
        <h1 className="page-title">{getPageTitle()}</h1>

        {/* Show search info banner */}
        {searchQuery && (
          <div className="search-info-banner">
            <p>
              Showing {products.length} result{products.length !== 1 ? "s" : ""}{" "}
              for "{searchQuery}"
              {/* {selectedProductId && " - Selected product shown first"} */}
            </p>
          </div>
        )}

        <div className="collections-content">
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3>Filter:</h3>
            </div>

            {/*    <div className="filter-group">
              <label className="filter-label">
                <span>Availability</span>
                <select
                  value={filters.availability}
                  onChange={(e) =>
                    setFilters({ ...filters, availability: e.target.value })
                  }
                  className="filter-select"
                >
                  <option value="all">All</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                </select>
              </label>
            </div> */}

            <div className="filter-group">
              <label className="filter-label">
                <span>Price</span>
                <select
                  value={filters.priceRange}
                  onChange={(e) =>
                    setFilters({ ...filters, priceRange: e.target.value })
                  }
                  className="filter-select"
                >
                  <option value="all">All Prices</option>
                  <option value="0-200">Rs. 0 - Rs. 200</option>
                  <option value="200-500">Rs. 200 - Rs. 500</option>
                  <option value="500-1000">Rs. 500 - Rs. 1000</option>
                  <option value="1000-">Rs. 1000+</option>
                </select>
              </label>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <span>Offers</span>
                <select
                  value={filters.offerRange}
                  onChange={(e) =>
                    setFilters({ ...filters, offerRange: e.target.value })
                  }
                  className="filter-select"
                >
                  <option value="all">All Offers</option>
                  <option value="5-10">5% - 10% Off</option>
                  <option value="10-20">10% - 20% Off</option>
                  <option value="20-30">20% - 30% Off</option>
                  <option value="30-50">30% - 50% Off</option>
                  <option value="50-100">50%+ Off</option>
                  <option value="20-100">20%+ Off (Best Deals)</option>
                </select>
              </label>
            </div>
          </aside>

          <main className="products-section">
            <div className="products-header">
              <p className="product-count">{products.length} products</p>
              <div className="sort-container">
                <label htmlFor="sort">Sort by:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            <div className="product-grid">
              {loading ? (
                <div className="loading-state">
                  <p>Loading products...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>Error: {error}</p>
                  <button onClick={() => window.location.reload()}>
                    Retry
                  </button>
                </div>
              ) : (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>

            {!loading && !error && products.length === 0 && (
              <div className="no-products">
                <p>No products found matching your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CollectionsPage;
