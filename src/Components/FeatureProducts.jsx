"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import "./FeatureProducts.css";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

function FeaturedProducts() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${MAIN}/api/home/featured-products?limit=8`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        if (data.success) {
          setProducts(data.data);
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
  }, []);

  // Filter products based on active filter
  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category === activeFilter);

  return (
    <section className="featured-products">
      <div className="featured-container">
        <h2 className="featured-title">OUR COLLECTIONS</h2>

        <div className="featured-filters">
          <button
            className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            View All
          </button>

          <button
            className={`filter-btn ${activeFilter === "oils" ? "active" : ""}`}
            onClick={() => setActiveFilter("oils")}
          >
            Oils
          </button>

          <button
            className={`filter-btn ${
              activeFilter === "cleaners" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("cleaners")}
          >
            Cleaners
          </button>

          {/* <button
            className={`filter-btn ${activeFilter === "other" ? "active" : ""}`}
            onClick={() => setActiveFilter("other")}
          >
            Others
          </button> */}
        </div>

        <div className="products-grid">
          {loading ? (
            <div className="loading-state">
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>No products found</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
