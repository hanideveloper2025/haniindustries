import { Link } from "react-router-dom"
import "./Footer.css"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          
          <div className="footer-logo">
            <img src="/logo_1.png" alt="Hani's Industries" />
          </div>
          {/* <h3>YOUR TRUSTED WELLNESS COMPANION</h3> */}
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
          <p>Email: haniidustries@gmail.com</p>
          <p>Phone: +91 93427 08080</p> 
          <p>Address: Plot No:44, 
                          Vaishnavi nagar
                          Thimmavaram
                          Chengalpattu
                         <br /> 
                          603101 </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Hani's Industries. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
