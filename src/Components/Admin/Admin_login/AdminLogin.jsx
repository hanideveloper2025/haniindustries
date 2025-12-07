"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./AdminLogin.css"

const AdminLogin = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      if (username === "Admin" && password === "Admin@123") {
        // Store authentication in localStorage
        localStorage.setItem("adminAuthenticated", "true")
        localStorage.setItem("adminUsername", username)
        // Navigate to admin dashboard
        navigate("/admin")
      } else {
        setError("Invalid username or password. Please try again.")
        setPassword("")
      }
      setLoading(false)
    }, 500)
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    setError("")
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setError("")
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">HANI INDUSTRIES</h1>
            <p className="login-subtitle">Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* <div className="login-footer">
            <p className="footer-text">
              Default Credentials: <br />
              Username: <strong>Admin</strong> <br />
              Password: <strong>Admin@123</strong>
            </p>
          </div> */}
        </div>

        <div className="login-background">
          <div className="bg-shape bg-shape-1"></div>
          <div className="bg-shape bg-shape-2"></div>
          <div className="bg-shape bg-shape-3"></div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
