"use client"

import { useState } from "react"
import ProductCard from "./ProductCard"
import "./FeatureProducts.css"

function FeaturedProducts() {
  const [activeFilter, setActiveFilter] = useState("all")

  const featuredProducts = [
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
    },
  ]

  return (
    <section className="featured-products">
      <div className="featured-container">
        <h2 className="featured-title">Featured collection</h2>

        <div className="featured-filters">
          <button
            className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            View All
          </button>
          <button
            className={`filter-btn ${activeFilter === "oil" ? "active" : ""}`}
            onClick={() => setActiveFilter("oil")}
          >
            OIL
          </button>
          <button
            className={`filter-btn ${activeFilter === "spices" ? "active" : ""}`}
            onClick={() => setActiveFilter("spices")}
          >
            Wheat Flour
          </button>
          <button
            className={`filter-btn ${activeFilter === "other" ? "active" : ""}`}
            onClick={() => setActiveFilter("other")}
          >
            SPICES
          </button>
        </div>

        <div className="products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
