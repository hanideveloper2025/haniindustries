"use client"

import { useState } from "react"
import "../styles/PlacedOrders.css"

export default function PlacedOrders() {
  // Sample data - Replace with API call to fetch real orders
  const [orders] = useState([
    {
      id: "ORD-001",
      customerName: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91-9876543210",
      paymentMode: "Credit Card",
      status: "Completed",
      totalAmount: "₹5,499",
      address: "123 Industrial Road, Mumbai, Maharashtra 400001",
      orderDate: "2025-12-01",
      expectedDelivery: "2025-12-08",
      products: [
        { name: "Industrial Cleaning Solution", quantity: 2, price: "₹1,499", total: "₹2,998" },
        { name: "Heavy Duty Brush Set", quantity: 1, price: "₹1,501", total: "₹1,501" },
      ],
    },
    {
      id: "ORD-002",
      customerName: "Priya Singh",
      email: "priya@example.com",
      phone: "+91-9876543211",
      paymentMode: "UPI",
      status: "Pending",
      totalAmount: "₹3,299",
      address: "456 Business Plaza, Delhi 110001",
      orderDate: "2025-12-02",
      expectedDelivery: "2025-12-09",
      products: [
        { name: "Safety Gloves (Pack of 10)", quantity: 3, price: "₹799", total: "₹2,397" },
        { name: "Protective Mask", quantity: 2, price: "₹451", total: "₹902" },
      ],
    },
    {
      id: "ORD-003",
      customerName: "Arjun Patel",
      email: "arjun@example.com",
      phone: "+91-9876543212",
      paymentMode: "Bank Transfer",
      status: "Completed",
      totalAmount: "₹8,999",
      address: "789 Corporate Tower, Bangalore 560001",
      orderDate: "2025-11-28",
      expectedDelivery: "2025-12-05",
      products: [
        { name: "Industrial Grade Lubricant", quantity: 5, price: "₹1,299", total: "₹6,495" },
        { name: "Mechanical Tool Kit", quantity: 1, price: "₹2,504", total: "₹2,504" },
      ],
    },
  ])

  const [expandedOrder, setExpandedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status.toLowerCase() === filterStatus.toLowerCase())

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

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
          All Orders ({orders.length})
        </button>
        <button
          className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
          onClick={() => setFilterStatus("pending")}
        >
          Pending ({orders.filter((o) => o.status === "Pending").length})
        </button>
        <button
          className={`filter-btn ${filterStatus === "completed" ? "active" : ""}`}
          onClick={() => setFilterStatus("completed")}
        >
          Completed ({orders.filter((o) => o.status === "Completed").length})
        </button>
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              {/* Order Summary */}
              <div className="order-summary" onClick={() => toggleExpandOrder(order.id)}>
                <div className="summary-left">
                  <h3 className="order-id">{order.id}</h3>
                  <p className="customer-name">{order.customerName}</p>
                </div>

                <div className="summary-middle">
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
                  <p className="order-date">{order.orderDate}</p>
                </div>

                <div className="summary-right">
                  <p className="order-amount">{order.totalAmount}</p>
                  <span className="expand-icon">{expandedOrder === order.id ? "▲" : "▼"}</span>
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
                        <p>{order.orderDate}</p>
                      </div>
                      {/* <div className="timeline-item">
                        <label>Expected Delivery:</label>
                        <p>{order.expectedDelivery}</p>
                      </div> */}
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
                            <td>{product.name}</td>
                            <td>{product.quantity}</td>
                            <td>{product.price}</td>
                            <td className="total-price">{product.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="order-total">
                      <strong>Order Total: {order.totalAmount}</strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    {order.status !== "Completed" && (
                      <>
                        <button className="btn-primary">Mark as completed</button>
                        {/* <button className="btn-secondary">Print Invoice</button> */}
                        <button className="btn-secondary">Send dispatch Notification</button>
                      </>
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
    </div>
  )
}
