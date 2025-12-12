"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 1,
      title: "Lamp oil",
      image: "/Products/oils/hero1.png",
      description:
        "Pure edible-grade lamp oil for a brighter, clean, and long-lasting flame.",
    },
    {
      id: 2,
      title: "Detergent",
      image: "/Products/others/hero4.png",
      description:
        "Powerful detergent that removes tough stains while protecting fabric.",
    },
    {
      id: 3,
      title: "Appalam",
      image: "/Products/others/hero3.png",
      description:
        "Crispy, fresh, handcrafted appalam made with traditional ingredients.",
    },
    {
      id: 4,
      title: "Bath Room Cleaner",
      image: "/Products/others/hero7.png",
      description:
        "Deep-action bathroom cleaner that removes stains, germs, and hard-water marks.",
    },
    {
      id: 5,
      title: "Floor Cleaner",
      image: "/Products/others/hero6.png",
      description:
        "Strong floor cleaner that kills germs and leaves a fresh, spotless surface.",
    },
    {
      id: 6,
      title: "ALA",
      image: "/Products/others/hero8.jpg",
      description:
        "High-foam dish wash that cuts through grease and gives a clean, safe shine.",
    },
  ];

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-slide every 10 seconds
  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      handleNextSlide();
    }, 10000); // 10 seconds

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [isPaused, handleNextSlide]);

  return (
    <section
      className="hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-content">
        <div className="hero-left">
          <img
            src={slides[currentSlide].image || "/placeholder.svg"}
            alt={slides[currentSlide].title}
            className="hero-image"
          />
        </div>

        <div className="hero-right">
          <div className="hero-text">
            <h1>ESSENTIAL PRODUCTS MADE WITH</h1>
            <h2> HONEST TRADITION</h2>
            <p>
              Hani Industries brings you pure lamp oils, authentic food
              products, and dependable household essentials created with care
              and integrity.
            </p>
            <Link to="/collections" className="hero-btn">
              Shop Now
            </Link>
          </div>

          <div className="hero-carousel-container">
            <div
              className="hero-carousel"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={slide.id} className="carousel-slide">
                  <img
                    src={slide.image || "/placeholder.svg"}
                    alt={slide.title}
                    className="slide-image"
                  />
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </div>
              ))}
            </div>

            <button
              className="carousel-nav prev"
              onClick={handlePrevSlide}
              aria-label="Previous slide"
            >
              ❮
            </button>
            <button
              className="carousel-nav next"
              onClick={handleNextSlide}
              aria-label="Next slide"
            >
              ❯
            </button>

            <div className="carousel-dots">
              {slides.map((_, index) => (
                <span
                  key={index}
                  className={`carousel-dot ${
                    index === currentSlide ? "active" : ""
                  }`}
                  onClick={() => goToSlide(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to slide ${index + 1}`}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            role="button"
            tabIndex={0}
            aria-label={`Go to slide ${index + 1}`}
          ></span>
        ))}
      </div>
    </section>
  );
}

export default Hero;
