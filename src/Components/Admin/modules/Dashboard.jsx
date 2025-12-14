import { useState, useMemo } from "react"
import "../styles/Dashboard.css"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const [timeFromFilter, setTimeFromFilter] = useState("")
  const [timeToFilter, setTimeToFilter] = useState("")
  const itemsPerPage = 20

  // Helper function to convert 24-hour time to 12-hour AM/PM format
  const formatTimeToAMPM = (time24) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    let hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    hour = hour % 12 || 12
    return `${hour.toString().padStart(2, "0")}:${minutes} ${ampm}`
  }

  const stats = [
    { label: "Total Products", value: "156", icon: "📦", color: "#001f3f" },
    // { label: "Featured Products", value: "24", icon: "⭐", color: "#0074D9" },
    { label: "Total Orders", value: "2,847", icon: "🛒", color: "#FF4136" },
    // { label: "Revenue", value: "₹5.2L", icon: "💰", color: "#2ECC40" },
  ]

  const orders = [
    { id: "#ORD001", customer: "Rajesh Kumar", date: "2024-01-15", time: "14:30", items: "3 items", amount: "₹8,500", payment: "UPI", status: "Completed" },
    { id: "#ORD002", customer: "Priya Singh", date: "2024-01-14", time: "10:45", items: "5 items", amount: "₹12,000", payment: "Card", status: "Pending" },
    { id: "#ORD003", customer: "Amit Patel", date: "2024-01-14", time: "16:20", items: "2 items", amount: "₹6,250", payment: "COD", status: "Completed" },
    { id: "#ORD004", customer: "Sneha Gupta", date: "2024-01-13", time: "09:15", items: "4 items", amount: "₹9,800", payment: "UPI", status: "Processing" },
    { id: "#ORD005", customer: "Vikram Sharma", date: "2024-01-13", time: "15:00", items: "1 item", amount: "₹3,200", payment: "Card", status: "Completed" },
    { id: "#ORD006", customer: "Anjali Mehta", date: "2024-01-12", time: "11:30", items: "6 items", amount: "₹15,600", payment: "UPI", status: "Shipped" },
    { id: "#ORD007", customer: "Rohit Jain", date: "2024-01-12", time: "13:45", items: "3 items", amount: "₹7,450", payment: "COD", status: "Pending" },
    { id: "#ORD008", customer: "Kavita Rao", date: "2024-01-11", time: "08:20", items: "2 items", amount: "₹5,900", payment: "Card", status: "Completed" },
    { id: "#ORD009", customer: "Deepak Verma", date: "2024-01-11", time: "17:10", items: "7 items", amount: "₹18,200", payment: "UPI", status: "Processing" },
    { id: "#ORD010", customer: "Meera Iyer", date: "2024-01-10", time: "12:05", items: "4 items", amount: "₹11,300", payment: "UPI", status: "Shipped" },
    { id: "#ORD011", customer: "Suresh Reddy", date: "2024-01-10", time: "14:50", items: "3 items", amount: "₹8,750", payment: "Card", status: "Completed" },
    { id: "#ORD012", customer: "Poonam Singh", date: "2024-01-09", time: "10:30", items: "5 items", amount: "₹13,400", payment: "COD", status: "Pending" },
    { id: "#ORD013", customer: "Arun Kumar", date: "2024-01-09", time: "16:40", items: "2 items", amount: "₹6,800", payment: "UPI", status: "Processing" },
    { id: "#ORD014", customer: "Sunita Patel", date: "2024-01-08", time: "09:25", items: "6 items", amount: "₹16,900", payment: "Card", status: "Shipped" },
    { id: "#ORD015", customer: "Manoj Tiwari", date: "2024-01-08", time: "13:15", items: "1 item", amount: "₹4,200", payment: "UPI", status: "Completed" },
    { id: "#ORD016", customer: "Rekha Sharma", date: "2024-01-07", time: "11:00", items: "4 items", amount: "₹10,500", payment: "COD", status: "Pending" },
    { id: "#ORD017", customer: "Vivek Gupta", date: "2024-01-07", time: "15:35", items: "3 items", amount: "₹7,800", payment: "Card", status: "Processing" },
    { id: "#ORD018", customer: "Nisha Jain", date: "2024-01-06", time: "10:50", items: "5 items", amount: "₹14,200", payment: "UPI", status: "Shipped" },
    { id: "#ORD019", customer: "Rajendra Prasad", date: "2024-01-06", time: "14:20", items: "2 items", amount: "₹6,400", payment: "UPI", status: "Completed" },
    { id: "#ORD020", customer: "Kiran Desai", date: "2024-01-05", time: "12:45", items: "7 items", amount: "₹19,800", payment: "Card", status: "Pending" },
    { id: "#ORD021", customer: "Alok Mishra", date: "2024-01-05", time: "09:30", items: "3 items", amount: "₹8,900", payment: "COD", status: "Processing" },
    { id: "#ORD022", customer: "Shweta Agarwal", date: "2024-01-04", time: "16:15", items: "4 items", amount: "₹12,100", payment: "UPI", status: "Shipped" },
    { id: "#ORD023", customer: "Pradeep Singh", date: "2024-01-04", time: "10:40", items: "2 items", amount: "₹5,700", payment: "Card", status: "Completed" },
    { id: "#ORD024", customer: "Anita Choudhary", date: "2024-01-03", time: "13:50", items: "6 items", amount: "₹17,300", payment: "UPI", status: "Pending" },
    { id: "#ORD025", customer: "Sanjay Kumar", date: "2024-01-03", time: "11:20", items: "1 item", amount: "₹3,800", payment: "COD", status: "Processing" }
  ]

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === "" || order.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesPayment = paymentFilter === "" || order.payment.toLowerCase() === paymentFilter.toLowerCase()
      const matchesSearch = searchTerm === "" ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())

      // Date and Time filtering
      const matchesDateFrom = dateFromFilter === "" || order.date >= dateFromFilter
      const matchesDateTo = dateToFilter === "" || order.date <= dateToFilter
      
      const matchesTimeFrom = timeFromFilter === "" || order.time >= timeFromFilter
      const matchesTimeTo = timeToFilter === "" || order.time <= timeToFilter

      return matchesStatus && matchesPayment && matchesSearch && matchesDateFrom && matchesDateTo && matchesTimeFrom && matchesTimeTo
    })
  }, [orders, statusFilter, paymentFilter, searchTerm, dateFromFilter, dateToFilter, timeFromFilter, timeToFilter])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  const handleFilterChange = () => {
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setStatusFilter("")
    setPaymentFilter("")
    setSearchTerm("")
    setDateFromFilter("")
    setDateToFilter("")
    setTimeFromFilter("")
    setTimeToFilter("")
    setCurrentPage(1)
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard Overview</h2>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color + "15" }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
            <div className="stat-border" style={{ borderTopColor: stat.color }}></div>
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
                    setSearchTerm(e.target.value)
                    handleFilterChange()
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
                    setStatusFilter(e.target.value)
                    handleFilterChange()
                  }}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="payment">Payment:</label>
                <select
                  id="payment"
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value)
                    handleFilterChange()
                  }}
                  className="filter-select"
                >
                  <option value="">All Payments</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cod">COD</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="clear-filters-btn"
              >
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
                    setDateFromFilter(e.target.value)
                    handleFilterChange()
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
                    setDateToFilter(e.target.value)
                    handleFilterChange()
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
                    setTimeFromFilter(e.target.value)
                    handleFilterChange()
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
                    setTimeToFilter(e.target.value)
                    handleFilterChange()
                  }}
                  className="filter-input"
                />
              </div>
            </div>
          </div>

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
              {currentOrders.map((order, index) => {
                // Only display orders with Completed or Pending status
                if (order.status.toLowerCase() !== "completed" && order.status.toLowerCase() !== "pending") {
                  return null
                }
                return (
                  <tr key={index}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>{formatTimeToAMPM(order.time)}</td>
                    <td>{order.items}</td>
                    <td>{order.amount}</td>
                    <td>{order.payment}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
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
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

       
      </div>
    </div>
  )
}
