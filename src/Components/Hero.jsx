import "./Hero.css"

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-left">
          <img src="/spices-products.jpg" alt="Spices Collection" className="hero-image" />
        </div>
        <div className="hero-right">
          <h1>ELEVATE YOUR MEALS WITH</h1>
          <h2>AUTHENTIC SPICES!</h2>
          <p>Premium quality oils and spices for your kitchen. 100% pure, physically refined, chemical-free.</p>
          <button className="hero-btn">Shop Now</button>
        </div>
      </div>
      <div className="hero-dots">
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </section>
  )
}

export default Hero
