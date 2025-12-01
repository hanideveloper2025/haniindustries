"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "./ProductCard.css"

function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <div className="product-card" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="product-image-container">
        <Link to={`/products/${product.id}`}>
          <img src={product.image || "/placeholder.svg"} alt={product.name} className="product-image" />
        </Link>
        {product.badge && <span className="product-badge">{product.badge.toUpperCase()}</span>}
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          <span className="stars">★★★★★</span>
          <span className="rating-value">{product.rating}</span>
          <span className="reviews">({product.reviews})</span>
        </div>

        <div className="product-price">
          <span className="current-price">Rs. {product.price}</span>
          {product.originalPrice && <span className="original-price">Rs. {product.originalPrice}</span>}
        </div>

        <Link to={`/products/${product.id}`} className="buy-btn">
          Buy now
        </Link>
      </div>

      {isHovered && <button className="quick-view-btn">Quick View</button>}
    </div>
  )
}

export default ProductCard
