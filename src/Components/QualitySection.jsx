import { useNavigate } from 'react-router-dom';
import "./QualitySection.css"

function QualitySection() {
  const navigate = useNavigate();
  return (
    <section className="quality-section">
      <div className="quality-container">
        <div className="quality-image">
          <img src="/Quality_img.png" alt="Quality Products" className="quality-img" />
        </div>
        <div className="quality-content">
          <h2>Made for Every Home</h2>
          <h3>Pure. Safe. Reliable. Essential household and food products for daily use.</h3>
          <p>
            We manufacture lamp oils, cleaners, detergents, and traditional 
            food items with strict quality control and clean ingredients. 
            Perfectly designed to serve the needs of every Indian household.
          </p>
          <button className="quality-btn" onClick={() => navigate('/collections')}>Explore More</button>
        </div>
      </div>
    </section>
  )
}

export default QualitySection
