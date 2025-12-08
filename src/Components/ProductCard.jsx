"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useCart } from "./Cart/CartContext"
import "./ProductCard.css"

function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const { addToCart, updateQuantity, cartItems } = useCart()

  useEffect(() => {
    // Get current quantity of product in cart
    const cartItem = cartItems.find(item => item.productId === product.id)
    setQuantity(cartItem ? cartItem.quantity : 0)
  }, [cartItems, product.id])

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const handleAddToCart = () => {
    if (quantity === 0) {
      addToCart(product, 1, null) // Add 1 quantity, no size selected
    }
  }

  const handleIncreaseQuantity = () => {
    const newQuantity = quantity + 1
    updateQuantity(`${product.id}-null`, newQuantity)
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1
      updateQuantity(`${product.id}-null`, newQuantity)
    } else {
      updateQuantity(`${product.id}-null`, 0) // This will remove the item
    }
  }

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

        {product.sizes || product.sizePrices ? (
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        ) : quantity === 0 ? (
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        ) : (
          <div className="quantity-controls">
            <button className="quantity-btn" onClick={handleDecreaseQuantity}>-</button>
            <span className="quantity-display">{quantity}</span>
            <button className="quantity-btn" onClick={handleIncreaseQuantity}>+</button>
          </div>
        )}

        <Link to={`/products/${product.id}`} className="buy-btn">
          Buy now
        </Link>
      </div>


    </div>
  )
}

export default ProductCard
