"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import "./cart.css";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeItem,
    stockValidationErrors,
    setStockValidationErrors,
  } = useCart();
  const navigate = useNavigate();

  // Stock validation state
  const [isValidating, setIsValidating] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);
  const [showStockAlert, setShowStockAlert] = useState(false);

  // Check if redirected from checkout with stock errors
  React.useEffect(() => {
    if (stockValidationErrors && stockValidationErrors.length > 0) {
      setStockErrors(stockValidationErrors);
      setShowStockAlert(true);
      // Clear the context errors after displaying
      setStockValidationErrors([]);
    }
  }, [stockValidationErrors, setStockValidationErrors]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18;
  const shipping = subtotal > 500 ? 0 : 100;
  const total = subtotal + tax + shipping;

  // Validate stock before checkout
  const validateStockAndCheckout = async () => {
    setIsValidating(true);
    setStockErrors([]);
    setShowStockAlert(false);

    try {
      const errors = [];

      // Check each cart item against database stock
      for (const item of cartItems) {
        try {
          const response = await fetch(
            `${MAIN}/api/home/product/${item.productId}`
          );
          if (!response.ok) continue;

          const data = await response.json();
          if (!data.success) continue;

          const product = data.data;

          // Find the matching variant
          let availableStock = 0;
          if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find((v) => v.size === item.size);
            if (variant) {
              availableStock = variant.stock || 0;
            } else {
              // If no size match, use first variant
              availableStock = product.variants[0].stock || 0;
            }
          } else {
            availableStock = product.stock || 0;
          }

          // Check if requested quantity exceeds available stock
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

      if (errors.length > 0) {
        setStockErrors(errors);
        setShowStockAlert(true);
        // Scroll to top to show the alert
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // All items have sufficient stock, proceed to checkout
        navigate("/checkout");
      }
    } catch (error) {
      console.error("Stock validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  // Close stock alert
  const closeStockAlert = () => {
    setShowStockAlert(false);
  };

  // Update quantity from error alert
  const handleUpdateFromError = (itemId, newQty) => {
    if (newQty > 0) {
      updateQuantity(itemId, newQty);
    } else {
      removeItem(itemId);
    }
    // Remove this error from the list
    setStockErrors((prev) => prev.filter((err) => err.itemId !== itemId));
    if (stockErrors.length <= 1) {
      setShowStockAlert(false);
    }
  };

  return (
    <div className="cart-page">
      {/* Stock Validation Alert */}
      {showStockAlert && stockErrors.length > 0 && (
        <div className="stock-alert-overlay">
          <div className="stock-alert-modal">
            <div className="stock-alert-header">
              <div className="stock-alert-icon">⚠️</div>
              <h2>Stock Availability Issue</h2>
              <button className="stock-alert-close" onClick={closeStockAlert}>
                ×
              </button>
            </div>

            <div className="stock-alert-body">
              <p className="stock-alert-message">
                Some items in your cart have limited or no stock available.
                Please update the quantities below to proceed with checkout.
              </p>

              <div className="stock-error-list">
                {stockErrors.map((error) => (
                  <div key={error.itemId} className="stock-error-item">
                    <div className="stock-error-info">
                      <h4>{error.itemName}</h4>
                      {error.itemSize && (
                        <span className="stock-error-size">
                          Size: {error.itemSize}
                        </span>
                      )}
                    </div>

                    <div className="stock-error-details">
                      {error.isOutOfStock ? (
                        <div className="stock-error-badge out-of-stock">
                          <span>Out of Stock</span>
                        </div>
                      ) : (
                        <>
                          <div className="stock-error-qty">
                            <span className="qty-label">Your quantity:</span>
                            <span className="qty-value requested">
                              {error.requestedQty}
                            </span>
                          </div>
                          <div className="stock-error-qty">
                            <span className="qty-label">Available:</span>
                            <span className="qty-value available">
                              {error.availableStock}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="stock-error-actions">
                      {error.isOutOfStock ? (
                        <button
                          className="stock-action-btn remove"
                          onClick={() => handleUpdateFromError(error.itemId, 0)}
                        >
                          Remove Item
                        </button>
                      ) : (
                        <>
                          <button
                            className="stock-action-btn update"
                            onClick={() =>
                              handleUpdateFromError(
                                error.itemId,
                                error.availableStock
                              )
                            }
                          >
                            Update to {error.availableStock}
                          </button>
                          <button
                            className="stock-action-btn remove"
                            onClick={() =>
                              handleUpdateFromError(error.itemId, 0)
                            }
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="stock-alert-footer">
              <button
                className="stock-alert-btn secondary"
                onClick={closeStockAlert}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

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
                {cartItems.map((item) => {
                  // Check if this item has a stock error
                  const hasError = stockErrors.find(
                    (err) => err.itemId === item.id
                  );

                  return (
                    <div
                      key={item.id}
                      className={`cart-item ${
                        item.stock <= 0 ? "out-of-stock-item" : ""
                      } ${hasError ? "stock-error-highlight" : ""}`}
                    >
                      <div className="item-image">
                        <img
                          src={
                            item.image ||
                            "/placeholder.svg?height=100&width=100"
                          }
                          alt={item.name}
                        />
                        {item.stock <= 0 && (
                          <span className="item-out-of-stock-badge">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <div className="item-details">
                        <h3>{item.name}</h3>
                        <p className="item-size">
                          Size: {item.size || "Standard"}
                        </p>
                        {hasError && !hasError.isOutOfStock && (
                          <p className="item-stock-error">
                            Only {hasError.availableStock} available
                          </p>
                        )}
                      </div>
                      <div className="item-price">Rs. {item.price}</div>
                      <div className="item-quantity">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.stock <= 0}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = Number.parseInt(e.target.value) || 1;
                            if (newQty <= item.stock) {
                              updateQuantity(item.id, newQty);
                            }
                          }}
                          min="1"
                          max={item.stock}
                          disabled={item.stock <= 0}
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.stock <= 0 || item.quantity >= item.stock
                          }
                        >
                          +
                        </button>
                      </div>
                      <div className="item-total">
                        Rs. {item.price * item.quantity}
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* <div className="continue-shopping">
                <Link to="/collections">← Continue Shopping</Link>
              </div> */}
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

              {shipping > 0 && (
                <p className="free-shipping-hint">
                  Add Rs. {500 - subtotal} more for FREE shipping
                </p>
              )}

              <button
                className={`checkout-btn ${isValidating ? "validating" : ""}`}
                onClick={validateStockAndCheckout}
                disabled={isValidating || stockErrors.length > 0}
              >
                {isValidating ? (
                  <>
                    <span className="spinner"></span>
                    Checking Stock...
                  </>
                ) : stockErrors.length > 0 ? (
                  "Please Fix Stock Issues"
                ) : (
                  "Proceed to Checkout"
                )}
              </button>

              {stockErrors.length > 0 && (
                <p className="checkout-blocked-hint">
                  ⚠️ Please update quantities for items with stock issues
                </p>
              )}
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
  );
}

export default CartPage;
