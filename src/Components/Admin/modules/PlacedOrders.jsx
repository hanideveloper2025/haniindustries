"use client";

import { useState, useEffect, useRef } from "react";
import "../styles/PlacedOrders.css";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

export default function PlacedOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const refreshIntervalRef = useRef(null);

  // Fetch orders from API
  useEffect(() => {
  const startAutoRefresh = () => {
    if (!refreshIntervalRef.current) {
      refreshIntervalRef.current = setInterval(() => {
        fetchOrders();
      }, 30000);
    }
  };

  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      fetchOrders();    // Fetch immediately when user returns to page
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  };

  // On mount or when filterStatus changes
  fetchOrders();
  startAutoRefresh();

  // Listen for tab focus/blur
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleVisibilityChange);
  window.addEventListener("blur", stopAutoRefresh);

  return () => {
    stopAutoRefresh();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", handleVisibilityChange);
    window.removeEventListener("blur", stopAutoRefresh);
  };
}, [filterStatus]);


  const fetchOrders = async () => {
    // Don't show loading spinner on auto-refresh
    if (!refreshIntervalRef.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(
        `${MAIN}/api/admin/placed-orders?status=${filterStatus}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.message);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [`complete_${orderId}`]: true }));
    try {
      const response = await fetch(
        `${MAIN}/api/admin/placed-orders/${orderId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        // Refresh orders list
        await fetchOrders();
        alert("Order marked as completed successfully!");
      } else {
        alert(result.message || "Failed to mark order as completed");
      }
    } catch (err) {
      console.error("Error marking order as completed:", err);
      alert("Failed to mark order as completed. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`complete_${orderId}`]: false }));
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [`cancel_${orderId}`]: true }));
    try {
      const response = await fetch(
        `${MAIN}/api/admin/placed-orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        // Refresh orders list
        await fetchOrders();
        alert("Order cancelled successfully!");
      } else {
        alert(result.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`cancel_${orderId}`]: false }));
    }
  };

  const sendDispatchNotification = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [`dispatch_${orderId}`]: true }));
    try {
      const response = await fetch(
        `${MAIN}/api/admin/placed-orders/${orderId}/dispatch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        // Refresh orders list
        await fetchOrders();
        alert("Dispatch notification sent successfully!");
      } else {
        alert(result.message || "Failed to send dispatch notification");
      }
    } catch (err) {
      console.error("Error sending dispatch notification:", err);
      alert("Failed to send dispatch notification. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`dispatch_${orderId}`]: false }));
    }
  };

  const filteredOrders = orders;

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusCount = (status) => {
    if (status === "all") return orders.length;
    return orders.filter((o) => o.status.toLowerCase() === status.toLowerCase())
      .length;
  };

  return (
    <div className="placed-orders-container">
      <div className="orders-header">
        <h2 className="orders-title">Placed Orders</h2>
        <p className="orders-subtitle">Manage and track all customer orders</p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <button
          className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          All Orders ({getStatusCount("all")})
        </button>
        <button
          className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
          onClick={() => setFilterStatus("pending")}
        >
          Pending ({getStatusCount("pending")})
        </button>
        <button
          className={`filter-btn ${
            filterStatus === "completed" ? "active" : ""
          }`}
          onClick={() => setFilterStatus("completed")}
        >
          Completed ({getStatusCount("completed")})
        </button>
        <button
          className={`filter-btn ${
            filterStatus === "cancelled" ? "active" : ""
          }`}
          onClick={() => setFilterStatus("cancelled")}
        >
          Cancelled ({getStatusCount("cancelled")})
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading State */}
      {loading ? (
        <div className="loading-message">Loading orders...</div>
      ) : (
        /* Orders List */
        <div className="orders-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                {/* Order Summary */}
                <div
                  className="order-summary"
                  onClick={() => toggleExpandOrder(order.id)}
                >
                  <div className="summary-left">
                    <h3 className="order-id">{order.orderId}</h3>
                    <p className="customer-name">{order.customerName}</p>
                  </div>

                  <div className="summary-middle">
                    <span
                      className={`status-badge status-${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                    <p className="order-date">
                      {new Date(order.orderDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="summary-right">
                    <p className="order-amount">{order.totalAmount}</p>
                    <span className="expand-icon">
                      {expandedOrder === order.id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="order-details">
                    {/* Customer Information */}
                    <div className="detail-section">
                      <h4 className="section-title">Customer Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Name:</label>
                          <p>{order.customerName}</p>
                        </div>
                        <div className="detail-item">
                          <label>Email:</label>
                          <p>{order.email}</p>
                        </div>
                        <div className="detail-item">
                          <label>Phone:</label>
                          <p>{order.phone}</p>
                        </div>
                        <div className="detail-item">
                          <label>Payment Mode:</label>
                          <p>{order.paymentMode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="detail-section">
                      <h4 className="section-title">Shipping Address</h4>
                      <p className="address-text">{order.address}</p>
                    </div>

                    {/* Order Timeline */}
                    <div className="detail-section">
                      <h4 className="section-title">Order Timeline</h4>
                      <div className="timeline-grid">
                        <div className="timeline-item">
                          <label>Order Date:</label>
                          <p>
                            {new Date(order.orderDate).toLocaleDateString(
                              "en-IN",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Products Details */}
                    <div className="detail-section">
                      <h4 className="section-title">Products Details</h4>
                      <table className="products-table">
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.products.map((product, idx) => (
                            <tr key={idx}>
                              <td>
                                <div className="product-info">
                                  {product.image && (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="product-image"
                                    />
                                  )}
                                  <div>
                                    <div>{product.name}</div>
                                    {product.size && (
                                      <div className="product-size">
                                        Size: {product.size}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>{product.quantity}</td>
                              <td>{product.price}</td>
                              <td className="total-price">{product.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Price Breakdown */}
                      <div className="price-breakdown">
                        <div className="price-row">
                          <span>Subtotal:</span>
                          <span>{order.subtotal}</span>
                        </div>
                        <div className="price-row">
                          <span>Tax (18% GST):</span>
                          <span>{order.taxAmount}</span>
                        </div>
                        <div className="price-row">
                          <span>Shipping:</span>
                          <span
                            className={
                              order.shippingAmountRaw === 0
                                ? "free-shipping"
                                : ""
                            }
                          >
                            {order.shippingAmountRaw === 0
                              ? "FREE"
                              : order.shippingAmount}
                          </span>
                        </div>
                        <div className="price-row total-row">
                          <strong>Order Total:</strong>
                          <strong>{order.totalAmount}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      {order.status.toLowerCase() === "pending" && (
                        <>
                          <button
                            className="btn-primary"
                            onClick={() => markAsCompleted(order.orderId)}
                            disabled={
                              actionLoading[`complete_${order.orderId}`]
                            }
                          >
                            {actionLoading[`complete_${order.orderId}`]
                              ? "Processing..."
                              : "Mark as Completed"}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() =>
                              sendDispatchNotification(order.orderId)
                            }
                            disabled={
                              order.dispatchMsgSent ||
                              actionLoading[`dispatch_${order.orderId}`]
                            }
                          >
                            {actionLoading[`dispatch_${order.orderId}`]
                              ? "Sending..."
                              : order.dispatchMsgSent
                              ? "✓ Dispatch Sent"
                              : "Send Dispatch Notification"}
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => cancelOrder(order.orderId)}
                            disabled={actionLoading[`cancel_${order.orderId}`]}
                          >
                            {actionLoading[`cancel_${order.orderId}`]
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        </>
                      )}
                      {order.status.toLowerCase() === "completed" && (
                        <div className="completed-badge">✓ Order Completed</div>
                      )}
                      {order.status.toLowerCase() === "cancelled" && (
                        <div className="cancelled-badge">✗ Order Cancelled</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-orders">
              <p>No orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
