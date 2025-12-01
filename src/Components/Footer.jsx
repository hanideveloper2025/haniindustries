import { Link } from "react-router-dom"
import "./Footer.css"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>SUNPURE, YOUR TRUSTED WELLNESS COMPANION</h3>
          <div className="footer-logo">
            <img src="/logo.png" alt="Sunpure" />
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">About Us</Link>
            </li>
            <li>
              <Link to="/">Contact</Link>
            </li>
            <li>
              <Link to="/">FAQ</Link>
            </li>
            <li>
              <Link to="/">Terms and Conditions</Link>
            </li>
            <li>
              <Link to="/">FACTORY LOCATION</Link>
            </li>
            <li>
              <Link to="/">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/">Blogs</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <p>Email: info@sunpure.com</p>
          <p>Phone: +91-1234-567-890</p>
          <p>Address: Factory Lane, Industrial Area, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Sunpure. All rights reserved. Powered by Shopify</p>
      </div>
    </footer>
  )
}

export default Footer
