"use client"

import { useState } from "react"
import ProductCard from "./ProductCard"
import "./FeatureProducts.css"

function FeaturedProducts() {
  const [activeFilter, setActiveFilter] = useState("all")

  const featuredProducts = [
    {
      id: "HANI0001",
      name: "IDHAYA OIL - 500ML BOTTLE",
      price: 130,
      originalPrice: 220,
      image: "/Products/oils/idhayam_oil_500_ml_-removebg-preview.png",
      rating: 4.5,
      reviews: 128,
      discount: 13,
      badge: "sale",
      category: "oil",
    },
    {
      id: "HANI0002",
      name: "IDHAYA OIL - 1L BOTTLE",
      price: 260,
      originalPrice: 430,
      image: "/Products/oils/idhayam_oil_1000ml_-removebg-preview.png",
      rating: 4.3,
      reviews: 95,
      discount: 12,
      badge: "sale",
      category: "oil",
    },
    {
      id: "HANI0003",
      name: "DEVI OIL - 1L BOTTLE",
      price: 150,
      originalPrice: 300,
      image: "/Products/oils/devi_olii-removebg-preview.png",
      rating: 4.6,
      reviews: 156,
      discount: 8,
      badge: "sale",
      category: "oil",
    },
    {
      id: "HANI0004",
      name: "DEVI OIL - 500ML",
      price: 76,
      originalPrice: 152,
      image: "/Products/oils/devi_olii-removebg-preview.png",
      rating: 4.4,
      reviews: 112,
      discount: 15,
      badge: "sale",
      category: "oil",
    },
    {
      id: "HANI0005",
      name: "LUCKY-ALL FLOOR CLEANER - LEMON 500ML",
      price: 80,
      originalPrice: 110,
      image: "/Products/others/Lucky_All-removebg-preview.png",
      rating: 4.4,
      reviews: 89,
      discount: 20,
      badge: "sale",
      category: "cleaners",
    },
    {
      id: "HANI0006",
      name: "HAPPY HOMES BATHROOM CLEANER 500ML",
      price: 70,
      originalPrice: 90,
      image: "/Products/others/happyhome-removebg-preview.png",
      rating: 4.2,
      reviews: 64,
      discount: 22,
      badge: "sale",
      category: "cleaners",
    },
    {
      id: "HANI0007",
      name: "RICH ALA 500ML ",
      price: 45,
      originalPrice: 90,
      image: "/Products/others/hero8.jpg",
      rating: 4.3,
      reviews: 47,
      discount: 18,
      badge: "sale",
      category: "cleaners",
    },
    {
      id: "HANI0008",
      name: "APPALAM 10 PCS",
      price: 25,
      originalPrice: 40,
      image: "/Products/others/hero3.png",
      rating: 4.1,
      reviews: 33,
      discount: 10,
      badge: "sale",
      category: "other",
    },
  ]

  const filteredProducts =
    activeFilter === "all"
      ? featuredProducts
      : featuredProducts.filter((p) => p.category === activeFilter)

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
            className={`filter-btn ${activeFilter === "oil" ? "active" : ""}`}
            onClick={() => setActiveFilter("oil")}
          >
            Oils
          </button>

          <button
            className={`filter-btn ${activeFilter === "cleaners" ? "active" : ""}`}
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
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
