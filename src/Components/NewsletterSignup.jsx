"use client"

import { useState } from "react"
import "./NewsletterSignup.css"

function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setEmail("")
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-icon">✈️</div>
        <h2>Sign up for our newsletter</h2>
        <p>Be the first to hear about amazing recipes, great deals and much more</p>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="newsletter-input"
          />
          <button type="submit" className="newsletter-btn">
            Subscribe
          </button>
        </form>

        {submitted && <p className="success-message">Thank you for subscribing!</p>}
      </div>
    </section>
  )
}

export default NewsletterSignup
