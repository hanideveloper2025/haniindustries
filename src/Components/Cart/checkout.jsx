"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import "./checkout.css";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

// Load Cashfree SDK
const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    if (window.Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CheckoutPage() {
  const { cartItems, setStockValidationErrors, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    state: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Calculate amounts
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18;
  const shipping = subtotal > 500 ? 0 : 100;
  const total = subtotal + tax + shipping;

  // Convert to paise for payment gateway
  const amountsInPaise = {
    subtotal: Math.round(subtotal * 100),
    tax: Math.round(tax * 100),
    shipping: Math.round(shipping * 100),
    total: Math.round(total * 100),
  };

  // Validate stock before order
  const validateStock = async () => {
    const errors = [];

    for (const item of cartItems) {
      try {
        const response = await fetch(
          `${MAIN}/api/home/product/${item.productId}`
        );
        if (!response.ok) continue;

        const data = await response.json();
        if (!data.success) continue;

        const product = data.data;

        let availableStock = 0;
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants.find((v) => v.size === item.size);
          if (variant) {
            availableStock = variant.stock || 0;
          } else {
            availableStock = product.variants[0].stock || 0;
          }
        } else {
          availableStock = product.stock || 0;
        }

        if (item.quantity > availableStock) {
          errors.push({
            itemId: item.id,
            itemName: item.name,
            itemSize: item.size,
            requestedQty: item.quantity,
            availableStock: availableStock,
            isOutOfStock: availableStock === 0,
          });
        }
      } catch (err) {
        console.error(`Error checking stock for ${item.name}:`, err);
      }
    }

    return errors;
  };

  // Handle order completion
  const handleOrderSuccess = (orderData) => {
    setOrderDetails({
      orderId: orderData.orderId,
      paymentMethod:
        selectedPayment === "cod" ? "Cash on Delivery" : "Online Payment",
      total: total.toFixed(2),
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.postalCode}`,
      customerName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      deliveryDate: orderData.estimatedDelivery,
    });

    // Show success modal
    setShowOrderSuccess(true);

    // Clear cart and session data
    clearCart();
    sessionStorage.removeItem("cartItems");
    sessionStorage.removeItem("cartTimestamp");
  };

  // Open Cashfree checkout
  const openCashfreeCheckout = async (orderData) => {
    const loaded = await loadCashfreeScript();
    if (!loaded) {
      alert("Failed to load payment gateway. Please try again.");
      setIsProcessing(false);
      return;
    }

    try {
      // Step 1: Create Cashfree order on backend
      const cashfreeResponse = await fetch(
        `${MAIN}/api/payments/cashfree/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderDbId: orderData.orderDbId,
            amount: orderData.amount,
            currency: orderData.currency,
            customerDetails: {
              name: orderData.customerName,
              email: orderData.customerEmail,
              phone: orderData.customerPhone,
            },
          }),
        }
      );

      const cashfreeData = await cashfreeResponse.json();

      if (!cashfreeData.success) {
        alert(cashfreeData.message || "Failed to initiate payment");
        setIsProcessing(false);
        return;
      }

      const { payment_session_id, cashfree_order_id } = cashfreeData.data;

      // Step 2: Initialize Cashfree SDK
      const cashfree = await window.Cashfree({
        mode: "sandbox", // Change to "production" for live
      });

      // Step 3: Open Cashfree payment modal
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal", // Opens in modal
      };

      cashfree.checkout(checkoutOptions).then(async (result) => {
        if (result.error) {
          // Payment failed
          console.error("Payment failed:", result.error);
          alert(`Payment failed: ${result.error.message || "Unknown error"}`);
          setIsProcessing(false);
        } else if (result.paymentDetails) {
          // Payment completed, verify on backend
          console.log("Payment completed:", result.paymentDetails);

          try {
            // Verify payment with backend
            const verifyResponse = await fetch(`${MAIN}/api/orders/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cashfree_order_id: cashfree_order_id,
                orderDbId: orderData.orderDbId,
                cartItems: cartItems.map((item) => ({
                  productId: item.productId,
                  name: item.name,
                  size: item.size,
                  quantity: item.quantity,
                })),
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Payment verified successfully
              handleOrderSuccess({
                orderId: verifyData.data.orderId,
                estimatedDelivery:
                  verifyData.data.estimatedDelivery ||
                  orderData.estimatedDelivery,
              });
            } else {
              alert(verifyData.message || "Payment verification failed");
              setIsProcessing(false);
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Failed to verify payment. Please contact support.");
            setIsProcessing(false);
          }
        }
      });
    } catch (error) {
      console.error("Cashfree checkout error:", error);
      alert("Failed to process payment. Please try again.");
      setIsProcessing(false);
    }
  };

  // Poll payment status
  const pollPaymentStatus = async (cashfreeOrderId, orderData) => {
    let attempts = 0;
    const maxAttempts = 20; // Poll for 1 minute (20 * 3 seconds)

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `${MAIN}/api/payments/cashfree/status/${cashfreeOrderId}`
        );
        const data = await response.json();

        if (data.success) {
          const { payment_status, order_status } = data.data;

          if (payment_status === "captured" && order_status === "confirmed") {
            // Payment successful
            handleOrderSuccess({
              orderId: data.data.order_id,
              estimatedDelivery: orderData.estimatedDelivery,
            });
            return;
          } else if (payment_status === "failed") {
            // Payment failed
            alert("Payment failed. Please try again.");
            setIsProcessing(false);
            return;
          }
        }

        // Continue polling if payment is pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000); // Check every 3 seconds
        } else {
          // Timeout - ask user to check order status
          alert(
            "Payment status is pending. Please check your order status in a few minutes."
          );
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Status check error:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000);
        } else {
          setIsProcessing(false);
        }
      }
    };

    checkStatus();
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    // Validate form
    const isFormValid = Object.values(formData).every(
      (field) => field.trim() !== ""
    );
    if (!isFormValid) {
      alert("Please fill all shipping details");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Validate stock
      const stockErrors = await validateStock();
      if (stockErrors.length > 0) {
        setStockValidationErrors(stockErrors);
        navigate("/cart");
        setIsProcessing(false);
        return;
      }

      // Step 2: Create order on backend
      const orderPayload = {
        customerDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingDetails: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
        },
        cartItems: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: selectedPayment,
        amounts: amountsInPaise,
      };

      const response = await fetch(`${MAIN}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!data.success) {
        // Check if it's a stock validation error from backend
        if (data.stockErrors && data.stockErrors.length > 0) {
          setStockValidationErrors(data.stockErrors);
          navigate("/cart");
          setIsProcessing(false);
          return;
        }
        alert(data.message || "Failed to create order");
        setIsProcessing(false);
        return;
      }

      // Step 3: Handle based on payment method
      if (selectedPayment === "cod") {
        // COD - Order is complete
        handleOrderSuccess(data.data);
        setIsProcessing(false);
      } else {
        // Online payment - Open Cashfree
        openCashfreeCheckout(data.data);
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Failed to process order. Please try again.");
      setIsProcessing(false);
    }
  };

  // Handle continue shopping - redirect to home
  const handleContinueShopping = () => {
    document.body.style.overflow = "";
    setShowOrderSuccess(false);
    navigate("/");
  };

  // Lock body scroll when modal is open and auto-scroll modal
  useEffect(() => {
    if (showOrderSuccess) {
      document.body.style.overflow = "hidden";

      const scrollTimer = setTimeout(() => {
        if (modalRef.current) {
          const scrollHeight = modalRef.current.scrollHeight;
          const clientHeight = modalRef.current.clientHeight;
          const scrollDistance = scrollHeight - clientHeight;

          if (scrollDistance > 0) {
            const startTime = Date.now();
            const duration = 3000;

            const animateScroll = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeInOutQuad =
                progress < 0.5
                  ? 2 * progress * progress
                  : 1 - Math.pow(-2 * progress + 2, 2) / 2;

              if (modalRef.current) {
                modalRef.current.scrollTop = scrollDistance * easeInOutQuad;
              }

              if (progress < 1) {
                requestAnimationFrame(animateScroll);
              }
            };

            requestAnimationFrame(animateScroll);
          }
        }
      }, 1000);

      return () => {
        clearTimeout(scrollTimer);
        document.body.style.overflow = "";
      };
    }
  }, [showOrderSuccess]);

  return (
    <div className="checkout-page">
      {/* Order Success Modal */}
      {showOrderSuccess && orderDetails && (
        <div className="order-success-overlay">
          <div className="order-success-modal" ref={modalRef}>
            {/* Success Animation */}
            <div className="success-animation">
              <div className="success-checkmark">
                <div className="check-icon">
                  <span className="icon-line line-tip"></span>
                  <span className="icon-line line-long"></span>
                  <div className="icon-circle"></div>
                  <div className="icon-fix"></div>
                </div>
              </div>
            </div>

            {/* Success Header */}
            <div className="success-header">
              <h1>Order Placed Successfully!</h1>
              <p className="success-subtitle">
                Thank you for shopping with Hani Industries
              </p>
            </div>

            {/* Order ID Badge */}
            <div className="order-id-badge">
              <span className="order-label">Order ID</span>
              <span className="order-number">{orderDetails.orderId}</span>
            </div>

            {/* Order Summary */}
            <div className="order-success-details">
              <div className="detail-section">
                <div className="detail-icon">📦</div>
                <div className="detail-content">
                  <span className="detail-label">Delivery Expected By</span>
                  <span className="detail-value">
                    {orderDetails.deliveryDate}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-icon">📍</div>
                <div className="detail-content">
                  <span className="detail-label">Shipping To</span>
                  <span className="detail-value">
                    {orderDetails.customerName}
                  </span>
                  <span className="detail-subvalue">
                    {orderDetails.shippingAddress}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-icon">💳</div>
                <div className="detail-content">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value payment-badge">
                    {orderDetails.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="detail-section total-section">
                <div className="detail-icon">🛒</div>
                <div className="detail-content">
                  <span className="detail-label">
                    {orderDetails.itemCount} Item(s)
                  </span>
                  <span className="detail-value total-amount">
                    Rs. {orderDetails.total}
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="confirmation-message">
              <p>
                📧 A confirmation email has been sent to{" "}
                <strong>{orderDetails.email}</strong>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="success-actions">
              <button
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                <span>🏠</span> Continue Shopping
              </button>
            </div>

            {/* Footer Note */}
            <div className="success-footer">
              <p>
                Need help? <a href="/contact">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      )}

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
                    placeholder="Mumbai"
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
                    placeholder="Maharashtra"
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
                    placeholder="400001"
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
                  <span className="payment-title">
                    💵 Cash on Delivery (COD)
                  </span>
                </div>
                <p className="payment-desc">
                  Pay when your order is delivered to your doorstep
                </p>
              </label>
            </div>

            {/* Online Payment (UPI & Cards Only) */}
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
                  <span className="payment-title">💳 Pay Online</span>
                  <span className="payment-badge-secure">🔒 Secure</span>
                </div>
                <p className="payment-desc">UPI & Credit/Debit Card payments</p>
                <div className="payment-logos">
                  <span className="payment-logo">GPay</span>
                  <span className="payment-logo">PhonePe</span>
                  <span className="payment-logo">Paytm UPI</span>
                  <span className="payment-logo">VISA</span>
                  <span className="payment-logo">Mastercard</span>
                  <span className="payment-logo">RuPay</span>
                </div>
              </label>
            </div>
          </div>
        </main>

        {/* Order Summary Sidebar */}
        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item-card">
                <div className="summary-item-image">
                  <img
                    src={item.image || "/placeholder.svg?height=50&width=50"}
                    alt={item.name}
                  />
                </div>
                <div className="summary-item-info">
                  <h3>{item.name}</h3>
                  <span className="item-size">Size: {item.size}</span>
                  <span className="item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="summary-item-price">
                  Rs. {item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-breakdown">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
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

          <button
            className={`place-order-btn ${isProcessing ? "validating" : ""}`}
            onClick={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : selectedPayment === "cod" ? (
              "Place Order (COD)"
            ) : (
              "Pay Now"
            )}
          </button>

          <Link to="/cart" className="back-to-cart">
            ← Back to Cart
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
