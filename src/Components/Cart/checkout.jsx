"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useCart } from "./CartContext"
import { QRCodeCanvas } from "qrcode.react"
import "./checkout.css"

function CheckoutPage() {
  const { cartItems } = useCart()
  const [selectedPayment, setSelectedPayment] = useState("cod")
  const [selectedOnlinePayment, setSelectedOnlinePayment] = useState("")
  const [lastSelectedOnlinePayment, setLastSelectedOnlinePayment] = useState("")
  const [showQRCode, setShowQRCode] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    state: "",
  })

  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  })

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleCardChange = (e) => {
    const { name, value } = e.target
    setCardData({ ...cardData, [name]: value })
  }

  // Generate order ID on component mount
  useEffect(() => {
    const lastOrderNumber = localStorage.getItem('lastOrderNumber') || 0
    const nextOrderNumber = parseInt(lastOrderNumber) + 1
    const newOrderId = `ORD${nextOrderNumber.toString().padStart(3, '0')}`
    setOrderId(newOrderId)
  }, [])

  // Reset online payment selection and QR code when payment method changes
  useEffect(() => {
    if (selectedPayment !== "online") {
      if (selectedOnlinePayment) {
        setLastSelectedOnlinePayment(selectedOnlinePayment)
      }
      setSelectedOnlinePayment("")
      setShowQRCode(false)
    } else if (selectedPayment === "online" && !selectedOnlinePayment && lastSelectedOnlinePayment) {
      // Restore the last selected online payment when switching back to online
      setSelectedOnlinePayment(lastSelectedOnlinePayment)
    }
  }, [selectedPayment])

  const handlePlaceOrder = () => {
    const isFormValid = Object.values(formData).every((field) => field.trim() !== "")
    if (!isFormValid) {
      alert("Please fill all shipping details")
      return
    }

    if (selectedPayment === "card") {
      const isCardValid =
        cardData.cardNumber.length === 16 && cardData.expiryDate && cardData.cvv.length === 3 && cardData.cardholderName
      if (!isCardValid) {
        alert("Please fill all card details correctly")
        return
      }
    }

    if (selectedPayment === "online" && !selectedOnlinePayment) {
      alert("Please select an online payment method")
      return
    }

    // Update localStorage with the current order number to ensure uniqueness
    const currentOrderNumber = parseInt(orderId.replace('ORD', ''))
    localStorage.setItem('lastOrderNumber', currentOrderNumber.toString())

    if (selectedPayment === "online") {
      setShowQRCode(true)
      alert(`Order placed successfully! Please scan the QR code to complete payment of Rs. ${total.toFixed(2)}`)
    } else {
      alert(`Order placed successfully with ${selectedPayment.toUpperCase()}`)
    }
  }



  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.18
  const shipping = subtotal > 500 ? 0 : 100
  const total = subtotal + tax + shipping

  return (
    <div className="checkout-page">
      <div className="breadcrumb">
        <span>Home</span>
        <span> / </span>
        <span>Cart</span>
        <span> / </span>
        <span className="current">Checkout</span>
      </div>

      <div className="checkout-container">
        <main className="checkout-form-section">
          <h1>Checkout</h1>

          {/* Shipping Information */}
          <div className="form-section">
            <h2>Shipping Information</h2>
            <div className="form-group">
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    placeholder="John"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    placeholder="New York"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    placeholder="NY"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleFormChange}
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="form-section">
            <h2>Payment Method</h2>

            {/* Cash on Delivery */}
            <div className="payment-option">
              <input
                type="radio"
                id="cod"
                name="payment"
                value="cod"
                checked={selectedPayment === "cod"}
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              <label htmlFor="cod" className="payment-label">
                <div className="payment-header">
                  <span className="payment-title">Cash on Delivery (COD)</span>
                </div>
                <p className="payment-desc">Pay when your order is delivered to your doorstep</p>
              </label>
            </div>

            {/* Online Payment */}
            <div className="payment-option">
              <input
                type="radio"
                id="online"
                name="payment"
                value="online"
                checked={selectedPayment === "online"}
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              <label htmlFor="online" className="payment-label">
                <div className="payment-header">
                  <span className="payment-title">Online Payment</span>
                </div>
                <div className="payment-methods-grid">
                  {/* Google Pay */}
                  <div
                    className={`payment-method-icon ${selectedOnlinePayment === "Google Pay" ? "selected" : ""}`}
                    onClick={() => setSelectedOnlinePayment("Google Pay")}
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#F3F3F3" />
                      <text x="20" y="26" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1F2937">
                        GPay
                      </text>
                    </svg>
                    <span>Google Pay</span>
                  </div>

                  {/* Paytm */}
                  <div
                    className={`payment-method-icon ${selectedOnlinePayment === "Paytm" ? "selected" : ""}`}
                    onClick={() => setSelectedOnlinePayment("Paytm")}
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#002970" />
                      <text x="20" y="26" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">
                        PAYTM
                      </text>
                    </svg>
                    <span>Paytm</span>
                  </div>

                  {/* PhonePe */}
                  <div
                    className={`payment-method-icon ${selectedOnlinePayment === "PhonePe" ? "selected" : ""}`}
                    onClick={() => setSelectedOnlinePayment("PhonePe")}
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#5F2D91" />
                      <text x="20" y="26" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">
                        PhonePe
                      </text>
                    </svg>
                    <span>PhonePe</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Card Payment */}
            <div className="payment-option">
              <input
                type="radio"
                id="card"
                name="payment"
                value="card"
                checked={selectedPayment === "card"}
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              <label htmlFor="card" className="payment-label">
                <div className="payment-header">
                  <span className="payment-title">Debit/Credit Card</span>
                </div>
                <p className="payment-desc">Visa, Mastercard, or any other card payment</p>
              </label>
            </div>

            {/* Card Details Form - Show only when card is selected */}
            {selectedPayment === "card" && (
              <div className="card-form">
                <div className="form-field">
                  <label htmlFor="cardholderName">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={cardData.cardholderName}
                    onChange={handleCardChange}
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="expiryDate">Expiry Date (MM/YY)</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={cardData.expiryDate}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      placeholder="123"
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Display - Show only when online payment is selected and Place Order is clicked */}
            {showQRCode && selectedPayment === "online" && selectedOnlinePayment && (
              <div className="qr-code-section">
                <h3>Scan QR Code to Pay</h3>
                <div className="qr-code-container">
                  <QRCodeCanvas
                    value={`upi://pay?pa=merchant@haniindustries&pn=HANI%20INDUSTRIES&am=${total.toFixed(2)}&cu=INR&tn=Payment%20for%20Order`}
                    size={200}
                    level="M"
                  />
                </div>
                <p className="qr-instructions">
                  Scan this QR code with your {selectedOnlinePayment} app to complete the payment of Rs. {total.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Order Summary Sidebar */}
        <aside className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="order-id-display">
            <span>Order ID: {orderId}</span>
          </div>

          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item-card">
                <div className="summary-item-image">
                  <img src={item.image || "/placeholder.svg?height=50&width=50"} alt={item.name} />
                </div>
                <div className="summary-item-info">
                  <h3>{item.name}</h3>
                  <span className="item-size">Size: {item.size}</span>
                  <span className="item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="summary-item-price">Rs. {item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-breakdown">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Tax (18%)</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `Rs. ${shipping}`}</span>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span>Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>

          <button className="place-order-btn" onClick={handlePlaceOrder}>
            Place Order
          </button>

          <Link to="/cart" className="back-to-cart">
            ← Back to Cart
          </Link>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
 