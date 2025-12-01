"use client"

import { useState } from "react"
import ProductCard from "../ProductCard"
import "../ProductGrid.css"
import "./collection.css"

function CollectionsPage() {
  const [filters, setFilters] = useState({
    availability: "all",
    priceRange: "all",
  })
  const [sortBy, setSortBy] = useState("featured")

  const allProducts = [
    {
      id: 1,
      name: "SUNPURE SUNFLOWER OIL - 5 L JAR",
      price: 650,
      originalPrice: 750,
      image: "/sunflower-oil-jar.jpg",
      rating: 4.5,
      reviews: 128,
      discount: 13,
      badge: "sale",
      availability: "in-stock",
      category: "oil",
    },
    {
      id: 2,
      name: "SUNPURE SUNFLOWER OIL - 2 L PET BOTTLE",
      price: 280,
      originalPrice: 320,
      image: "/sunflower-oil-bottle.jpg",
      rating: 4.3,
      reviews: 95,
      discount: 12,
      badge: "sale",
      availability: "in-stock",
      category: "oil",
    },
    {
      id: 3,
      name: "SUNPURE SUNFLOWER OIL - 1L PET BOTTLE",
      price: 165,
      originalPrice: 180,
      image: "/sunflower-oil-bottle-small.jpg",
      rating: 4.6,
      reviews: 156,
      discount: 8,
      badge: "sale",
      availability: "in-stock",
      category: "oil",
    },
    {
      id: 4,
      name: "SUNPURE SUNFLOWER OIL - 2L PET",
      price: 295,
      originalPrice: 350,
      image: "/sunflower-oil-container.jpg",
      rating: 4.4,
      reviews: 112,
      discount: 15,
      badge: "sale",
      availability: "in-stock",
      category: "oil",
    },
    {
      id: 5,
      name: "SUNPURE SUNFLOWER OIL - 5 L CAN",
      price: 580,
      originalPrice: 700,
      image: "/sunflower-oil-can.jpg",
      rating: 4.4,
      reviews: 89,
      discount: 17,
      badge: "sale",
      availability: "low-stock",
      category: "oil",
    },
    {
      id: 6,
      name: "SUNPURE SUNFLOWER OIL - 5 L JAR (PACK OF 2)",
      price: 1200,
      originalPrice: 1500,
      image: "/sunflower-oil-pack.jpg",
      rating: 4.3,
      reviews: 67,
      discount: 20,
      badge: "sale",
      availability: "in-stock",
      category: "oil",
    },
    {
      id: 7,
      name: "SUNPURE SUNFLOWER OIL - 10 L JAR",
      price: 1200,
      originalPrice: 1400,
      image: "/sunflower-oil-large-jar.jpg",
      rating: 4.5,
      reviews: 112,
      discount: 14,
      badge: "sale",
      availability: "low-stock",
      category: "oil",
    },
    {
      id: 8,
      name: "SUNPURE RICE BRAN OIL - 1 L",
      price: 280,
      originalPrice: 320,
      image: "/rice-bran-oil.jpg",
      rating: 4.2,
      reviews: 45,
      discount: 12,
      badge: "",
      availability: "in-stock",
      category: "oil",
    },
  ]

  const getFilteredProducts = () => {
    let filtered = [...allProducts]

    // Apply availability filter
    if (filters.availability !== "all") {
      filtered = filtered.filter((p) => p.availability === filters.availability)
    }

    // Apply price filter
    if (filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(Number)
      filtered = filtered.filter((p) => p.price >= min && (max ? p.price <= max : true))
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    return filtered
  }

  const filteredProducts = getFilteredProducts()

  return (
    <div className="collections-page">
      <div className="breadcrumb">
        <span>Home</span>
        <span> / </span>
        <span>Collections</span>
        <span> / </span>
        <span className="current">EDIBLE OIL</span>
      </div>

      <div className="collections-container">
        <h1 className="page-title">EDIBLE OIL</h1>

        <div className="collections-content">
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3>Filter:</h3>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <span>Availability</span>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                  className="filter-select"
                >
                  <option value="all">All</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                </select>
              </label>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <span>Price</span>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
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
          </aside>

          <main className="products-section">
            <div className="products-header">
              <p className="product-count">{filteredProducts.length} products</p>
              <div className="sort-container">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="no-products">
                <p>No products found matching your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default CollectionsPage
