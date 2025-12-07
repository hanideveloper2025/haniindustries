import "./WhyChooseUs.css"

function WhyChooseUs() {
  return (
    <section className="why-choose-section">
      <div className="why-choose-container">
        <h2>Trusted Household & Food Products for Every Home</h2>
        <p>Pure, safe, and reliable essentials — lamp oil, cleaners, detergents, and traditional foods.</p>

        <div className="why-choose-grid">
          <div className="why-item">
            <div className="why-icon">
              <img src="/organic-leaf.jpg" alt="Organic" />
            </div>
            <h3>Pure & Safe Ingredients</h3>
            <p>Every product is made with clean, safe, and trustworthy formulations you can rely on daily.</p>
          </div>

          <div className="why-item">
            <div className="why-icon">
              <img src="/quality-guarantee.jpg" alt="Quality" />
            </div>
            <h3>Quality Every Time</h3>
            <p>From lamp oil to cleaners, we maintain strict quality standards for every batch produced.</p>
          </div>

          <div className="why-item">
            <div className="why-icon">
              <img src="/fast-delivery-truck.png" alt="Delivery" />
            </div>
            <h3>Quick & Secure Delivery</h3>
            <p>Your essential products delivered safely and on time, right to your doorstep.</p>
          </div>

          <div className="why-item">
            <div className="why-icon">
              <img src="/customer-support-team.png" alt="Support" />
            </div>
            <h3>Dedicated Support</h3>
            <p>We’re here to help with product guidance, orders, and any questions you may have.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
