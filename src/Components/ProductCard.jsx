"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./Cart/CartContext";
import "./ProductCard.css";

function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const { addToCart, updateQuantity, cartItems, removeItem } = useCart();

  // Check if product has multiple sizes/variants
  const hasMultipleSizes =
    (product.sizes && product.sizes.length > 1) ||
    (product.sizePrices && Object.keys(product.sizePrices).length > 1) ||
    (product.variants && product.variants.length > 1);

  // Determine the size to use - if single variant, use its size, otherwise null
  const sizeToUse =
    product.variants && product.variants.length === 1
      ? product.variants[0].size
      : null;

  // Get stock for single variant product
  const productStock =
    product.variants && product.variants.length === 1
      ? product.variants[0].stock
      : product.stock || 0;

  const isOutOfStock = productStock <= 0;

  // Generate the cart item ID that matches CartContext format
  const cartItemId = `${product.id}-${sizeToUse}`;

  useEffect(() => {
    // Get current quantity of product in cart by exact cart item ID
    const cartItem = cartItems.find((item) => item.id === cartItemId);
    setQuantity(cartItem ? cartItem.quantity : 0);
  }, [cartItems, cartItemId]);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity === 0 && !isOutOfStock) {
      addToCart(product, 1, sizeToUse);
    }
  };

  const handleIncreaseQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Don't allow increasing beyond available stock
    if (quantity >= productStock) return;

    const cartItem = cartItems.find((item) => item.id === cartItemId);
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    } else {
      addToCart(product, 1, sizeToUse);
    }
  };

  const handleDecreaseQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cartItem = cartItems.find((item) => item.id === cartItemId);
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(cartItem.id, cartItem.quantity - 1);
      } else {
        removeItem(cartItem.id);
      }
    }
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image-container">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className={`product-image ${
              isOutOfStock ? "out-of-stock-image" : ""
            }`}
          />
        </Link>
        {product.badge && !isOutOfStock && (
          <span className="product-badge">{product.badge.toUpperCase()}</span>
        )}
        {isOutOfStock ? (
          <span className="out-of-stock-badge">OUT OF STOCK</span>
        ) : (
          discount > 0 && <span className="discount-badge">-{discount}%</span>
        )}
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
          {product.originalPrice && (
            <span className="original-price">Rs. {product.originalPrice}</span>
          )}
        </div>

        {/* If product has multiple sizes, always show Select Options to redirect to product page */}
        {hasMultipleSizes ? (
          <Link to={`/products/${product.id}`} className="add-to-cart-btn">
            Select Options
          </Link>
        ) : isOutOfStock ? (
          <button className="add-to-cart-btn out-of-stock-btn" disabled>
            Out of Stock
          </button>
        ) : quantity === 0 ? (
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        ) : (
          <div className="quantity-controls">
            <button
              className="quantity-btn minus"
              onClick={handleDecreaseQuantity}
            >
              −
            </button>
            <span className="quantity-display">{quantity}</span>
            <button
              className="quantity-btn plus"
              onClick={handleIncreaseQuantity}
              disabled={quantity >= productStock}
            >
              +
            </button>
          </div>
        )}

        <Link to={`/products/${product.id}`} className="buy-btn">
          Buy now
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
