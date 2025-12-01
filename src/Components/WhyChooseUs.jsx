import "./WhyChooseUs.css"

function WhyChooseUs() {
  return (
    <section className="why-choose-section">
      <div className="why-choose-container">
        <h2>India's Only Physically Refined Chemical Free Sunflower Oil</h2>
        <p>Pure Spices With No Chemicals, No Preservatives</p>

        <div className="why-choose-grid">
          <div className="why-item">
            <div className="why-icon">
              <img src="/organic-leaf.jpg" alt="Organic" />
            </div>
            <h3>100% Organic</h3>
            <p>No chemicals or additives, just pure natural goodness</p>
          </div>

          <div className="why-item">
            <div className="why-icon">
              <img src="/quality-guarantee.jpg" alt="Quality" />
            </div>
            <h3>Premium Quality</h3>
            <p>Physically refined using traditional methods</p>
          </div>

          <div className="why-item">
            <div className="why-icon">
              <img src="/fast-delivery-truck.png" alt="Delivery" />
            </div>
            <h3>Fast Shipping</h3>
            <p>Quick and safe delivery to your doorstep</p>
          </div>

          <div className="why-item">
            <div className="why-icon">
              <img src="/customer-support-team.png" alt="Support" />
            </div>
            <h3>24/7 Support</h3>
            <p>Always here to help you with any questions</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
