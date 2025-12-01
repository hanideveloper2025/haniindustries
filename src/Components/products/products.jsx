"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import RelatedProducts from "../RelatedProducts"
import "./products.css"

function ProductsPage() {
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("1L")

  // Sample product data - replace with actual data fetching
  const product = {
    id: id,
    name: "SUNPURE SUNFLOWER OIL - 5 L JAR",
    price: 650,
    originalPrice: 750,
    rating: 4.5,
    reviews: 128,
    discount: 13,
    description:
      "Pure Spices With No Chemicals, No Preservatives. India's Only Physically Refined Chemical Free Sunflower Oil.",
    longDescription:
      "Experience the pure goodness of Sunpure Sunflower Oil - physically refined using traditional methods with zero chemicals or preservatives. Perfect for all your cooking needs, this premium quality oil is sourced from the finest sunflower seeds and processed with utmost care to maintain its nutritional value.",
    images: ["/sunflower-oil-jar.jpg", "/sunflower-oil-bottle.jpg", "/sunflower-oil-container.jpg"],
    sizes: ["500ML", "1L", "2L", "5L"],
    features: [
      "100% Pure and Natural",
      "No Chemicals or Additives",
      "Physically Refined",
      "Rich in Vitamin E",
      "Suitable for All Cooking Methods",
      "Long Shelf Life",
    ],
  }

  const handleAddToCart = () => {
    console.log(`Added ${quantity} of ${selectedSize} to cart`)
  }

  const relatedProducts = [
    {
      id: 2,
      name: "SUNPURE SUNFLOWER OIL - 2 L PET BOTTLE",
      price: 280,
      originalPrice: 320,
      image: "/sunflower-oil-bottle.jpg",
      rating: 4.3,
      reviews: 95,
      discount: 12,
      badge: "sale",
    },
    {
      id: 3,
      name: "SUNPURE RICE BRAN OIL - 1 L",
      price: 180,
      originalPrice: 200,
      image: "/rice-bran-oil.jpg",
      rating: 4.4,
      reviews: 78,
      discount: 10,
      badge: "",
    },
  ]

  return (
    <div className="products-page">
      <div className="breadcrumb">
        <span>Home</span>
        <span> / </span>
        <span>Products</span>
        <span> / </span>
        <span className="current">{product.name}</span>
      </div>

      <div className="product-detail-container">
        <div className="product-images">
          <div className="main-image">
            <img src={product.images[0] || "/placeholder.svg"} alt={product.name} />
            {product.discount > 0 && <span className="discount-badge">-{product.discount}%</span>}
          </div>
          <div className="thumbnail-gallery">
            {product.images.map((img, idx) => (
              <img key={idx} src={img || "/placeholder.svg"} alt={`${product.name} ${idx + 1}`} />
            ))}
          </div>
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>

          <div className="product-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-value">{product.rating}</span>
            <span className="reviews">({product.reviews} reviews)</span>
          </div>

          <div className="product-price-section">
            <div className="prices">
              <span className="current-price">Rs. {product.price}</span>
              <span className="original-price">Rs. {product.originalPrice}</span>
              <span className="discount-percent">Save {product.discount}%</span>
            </div>
          </div>

          <p className="description">{product.description}</p>
          <p className="long-description">{product.longDescription}</p>

          <div className="product-options">
            <div className="size-selector">
              <label>Select Size:</label>
              <div className="sizes">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? "active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          </div>

          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>

          <div className="product-features">
            <h3>Key Features:</h3>
            <ul>
              {product.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <RelatedProducts products={relatedProducts} />
    </div>
  )
}

export default ProductsPage
