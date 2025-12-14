import { useState, useEffect, useRef } from "react";
import "../styles/Dashboard.css";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [timeFromFilter, setTimeFromFilter] = useState("");
  const [timeToFilter, setTimeToFilter] = useState("");
  const itemsPerPage = 20;
  const refreshIntervalRef = useRef(null);

  // State for API data
  const [stats, setStats] = useState([
    { label: "Total Products", value: "0", icon: "�", color: "#001f3f" },
    { label: "Total Orders", value: "0", icon: "🛍️", color: "#FF4136" },
    { label: "Sold Amount", value: "₹0", icon: "💳", color: "#2ECC40" },
  ]);
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Dashboard Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${MAIN}/api/admin/dashboard/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for cookies
        });

        const result = await response.json();
        /* console.log("Stats API Response:", result); */

        if (result.success) {
          setStats([
            {
              label: "Total Products",
              value: result.data.totalProducts.toString(),
              icon: "�",
              color: "#001f3f",
            },
            {
              label: "Total Orders",
              value: result.data.totalOrders.toLocaleString("en-IN"),
              icon: "🛍️",
              color: "#FF4136",
            },
            {
              label: "Sold Amount",
              value: `₹${(result.data.totalSoldAmount / 100).toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}`,
              icon: "💳",
              color: "#2ECC40",
            },
          ]);
        } else {
          console.error("Failed to fetch stats:", result.message);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchStats();

    // Set up auto-refresh every 30 seconds
    const statsInterval = setInterval(fetchStats, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(statsInterval);
  }, []);

  // Fetch Orders with Filters
useEffect(() => {
  const fetchOrders = async () => {
    // Don't show loading spinner on auto-refresh
    if (!refreshIntervalRef.current) {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter) params.append("status", statusFilter);
      if (paymentFilter) params.append("payment", paymentFilter);
      if (searchTerm) params.append("search", searchTerm);
      if (dateFromFilter) params.append("dateFrom", dateFromFilter);
      if (dateToFilter) params.append("dateTo", dateToFilter);
      if (timeFromFilter) params.append("timeFrom", timeFromFilter);
      if (timeToFilter) params.append("timeTo", timeToFilter);

      const response = await fetch(
        `${MAIN}/api/admin/dashboard/orders?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        setOrders(result.data.orders);
        setTotalPages(result.data.pagination.totalPages);
        setTotalOrders(result.data.pagination.totalOrders);
        setError(null);
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

  // Auto-refresh controls
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
      fetchOrders(); // Fetch instantly when user returns
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  };

  // On mount or when any filter changes
  fetchOrders();
  startAutoRefresh();

  // Detect tab active / inactive
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleVisibilityChange);
  window.addEventListener("blur", stopAutoRefresh);

  return () => {
    stopAutoRefresh();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", handleVisibilityChange);
    window.removeEventListener("blur", stopAutoRefresh);
  };

}, [
  currentPage,
  statusFilter,
  paymentFilter,
  searchTerm,
  dateFromFilter,
  dateToFilter,
  timeFromFilter,
  timeToFilter,
]);


  // Helper function to convert 24-hour time to 12-hour AM/PM format
  const formatTimeToAMPM = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setStatusFilter("");
    setPaymentFilter("");
    setSearchTerm("");
    setDateFromFilter("");
    setDateToFilter("");
    setTimeFromFilter("");
    setTimeToFilter("");
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard Overview</h2>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div
              className="stat-icon"
              style={{ backgroundColor: stat.color + "15" }}
            >
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
            <div
              className="stat-border"
              style={{ borderTopColor: stat.color }}
            ></div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="recent-orders">
          <h3 className="section-title">Recent Orders</h3>

          {/* Filter Section */}
          <div className="filters-section">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="search">Search:</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by Order ID or Customer..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilterChange();
                  }}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="payment">Payment:</label>
                <select
                  id="payment"
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="filter-select"
                >
                  <option value="">All Payments</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cod">COD</option>
                </select>
              </div>

              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>

            {/* Date and Time Filter Row */}
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="dateFrom">From Date:</label>
                <input
                  type="date"
                  id="dateFrom"
                  value={dateFromFilter}
                  onChange={(e) => {
                    setDateFromFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="dateTo">To Date:</label>
                <input
                  type="date"
                  id="dateTo"
                  value={dateToFilter}
                  onChange={(e) => {
                    setDateToFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="timeFrom">From Time:</label>
                <input
                  type="time"
                  id="timeFrom"
                  value={timeFromFilter}
                  onChange={(e) => {
                    setTimeFromFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="timeTo">To Time:</label>
                <input
                  type="time"
                  id="timeTo"
                  value={timeToFilter}
                  onChange={(e) => {
                    setTimeToFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="filter-input"
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              className="error-message"
              style={{ color: "red", padding: "10px", textAlign: "center" }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              className="loading-message"
              style={{ textAlign: "center", padding: "20px" }}
            >
              Loading orders...
            </div>
          ) : (
            <>
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      orders.map((order, index) => (
                        <tr key={index}>
                          <td>{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.date}</td>
                          <td>{formatTimeToAMPM(order.time)}</td>
                          <td>{order.items}</td>
                          <td>{order.amount}</td>
                          <td>{order.payment}</td>
                          <td>
                            <span
                              className={`status-badge ${order.status.toLowerCase()}`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages || 1} ({totalOrders} total
                  orders)
                </span>
                <button
                  className="pagination-btn"
                  onClick={handleNext}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
