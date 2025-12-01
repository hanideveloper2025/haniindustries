"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "./cart.css"

function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "SUNPURE SUNFLOWER OIL - 5 L JAR",
      price: 650,
      quantity: 1,
      image: "/sunflower-oil-jar.jpg",
      size: "5L",
    },
    {
      id: 2,
      name: "SUNPURE SUNFLOWER OIL - 2 L PET BOTTLE",
      price: 280,
      quantity: 2,
      image: "/sunflower-oil-bottle.jpg",
      size: "2L",
    },
  ])

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id)
    } else {
      setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.18
  const shipping = subtotal > 500 ? 0 : 100
  const total = subtotal + tax + shipping

  return (
    <div className="cart-page">
      <div className="breadcrumb">
        <span>Home</span>
        <span> / </span>
        <span className="current">Cart</span>
      </div>

      <div className="cart-container">
        {cartItems.length > 0 ? (
          <>
            <main className="cart-items-section">
              <h1>Shopping Cart</h1>
              <div className="cart-table-header">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span>Action</span>
              </div>

              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-size">Size: {item.size}</p>
                    </div>
                    <div className="item-price">Rs. {item.price}</div>
                    <div className="item-quantity">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        min="1"
                      />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="item-total">Rs. {item.price * item.quantity}</div>
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="continue-shopping">
                <Link to="/collections">← Continue Shopping</Link>
              </div>
            </main>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-item">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="summary-item">
                <span>Tax (18%)</span>
                <span>Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `Rs. ${shipping}`}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>

              {shipping > 0 && <p className="free-shipping-hint">Add Rs. {500 - subtotal} more for FREE shipping</p>}

              <button className="checkout-btn">Proceed to Checkout</button>
            </aside>
          </>
        ) : (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart and come back!</p>
            <Link to="/collections" className="continue-btn">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
