"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RelatedProducts from "../RelatedProducts";
import { useCart } from "../Cart/CartContext";
import "./products.css";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

// Stock polling interval in milliseconds (15 seconds)
const STOCK_POLL_INTERVAL = 15000;

function ProductsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity, removeItem } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [stockUpdated, setStockUpdated] = useState(false);

  // Check if this product+size combination is already in cart
  // The cart item ID format is: `${productId}-${size}` where size can be null or actual size
  const existingCartItem = cartItems.find((item) => {
    if (!product) return false;
    // Check for exact match with selected size
    const exactId = `${product.id}-${selectedSize}`;
    if (item.id === exactId) return true;
    // Also check for null size (added from homepage without size selection)
    const nullId = `${product.id}-null`;
    if (item.id === nullId && !selectedSize) return true;
    return false;
  });

  const isInCart = !!existingCartItem;

  // Sync quantity with cart when product/size changes
  useEffect(() => {
    if (existingCartItem) {
      setQuantity(existingCartItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [existingCartItem]);

  // Function to fetch stock updates only
  const fetchStockUpdate = useCallback(async () => {
    if (!id || !product) return;

    try {
      const response = await fetch(`${MAIN}/api/home/product/${id}`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.success) return;

      const updatedProduct = data.data;

      // Check if stock has changed for any variant
      let hasStockChanged = false;
      if (updatedProduct.variants && product.variants) {
        updatedProduct.variants.forEach((newVariant) => {
          const oldVariant = product.variants.find(
            (v) => v.id === newVariant.id
          );
          if (oldVariant && oldVariant.stock !== newVariant.stock) {
            hasStockChanged = true;
          }
        });
      }

      if (hasStockChanged) {
        // Update product with new stock data
        setProduct(updatedProduct);

        // Update selected variant if it exists
        if (selectedSize) {
          const updatedVariant = updatedProduct.variants.find(
            (v) => v.size === selectedSize
          );
          if (updatedVariant) {
            setSelectedVariant(updatedVariant);

            // If current quantity exceeds new stock, adjust it
            if (quantity > updatedVariant.stock && updatedVariant.stock > 0) {
              setQuantity(updatedVariant.stock);
            }
          }
        }

        // Show stock updated notification briefly
        setStockUpdated(true);
        setTimeout(() => setStockUpdated(false), 3000);
      }
    } catch (err) {
      // Silently fail for stock updates - don't disrupt user experience
      console.error("Stock update check failed:", err);
    }
  }, [id, product, selectedSize, quantity]);

  // Poll for stock updates every STOCK_POLL_INTERVAL
  useEffect(() => {
    if (!product) return;

    const intervalId = setInterval(fetchStockUpdate, STOCK_POLL_INTERVAL);

    // Also check on window focus (user returns to tab)
    const handleFocus = () => {
      fetchStockUpdate();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchStockUpdate, product]);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product details
        const productResponse = await fetch(`${MAIN}/api/home/product/${id}`);
        if (!productResponse.ok) {
          throw new Error("Product not found");
        }
        const productData = await productResponse.json();

        if (!productData.success) {
          throw new Error(productData.message || "Failed to load product");
        }

        const fetchedProduct = productData.data;
        setProduct(fetchedProduct);

        // Set default selected variant (first one or smallest price)
        if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
          const defaultVariant = fetchedProduct.variants[0];
          setSelectedSize(defaultVariant.size);
          setSelectedVariant(defaultVariant);
        }

        // Fetch related products
        const relatedResponse = await fetch(
          `${MAIN}/api/home/related-products/${id}?limit=3`
        );
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          if (relatedData.success) {
            setRelatedProducts(relatedData.data);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const variant = product.variants.find((v) => v.size === size);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  // Get current prices based on selected variant
  const currentPrice = selectedVariant?.price || product?.price || 0;
  const originalPrice =
    selectedVariant?.originalPrice || product?.originalPrice || 0;
  const discount =
    originalPrice > 0
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (product) {
      // Block if out of stock
      if (selectedVariant && selectedVariant.stock <= 0) {
        return;
      }

      // If already in cart, just navigate to cart
      if (isInCart) {
        navigate("/cart");
        return;
      }

      // Ensure quantity doesn't exceed stock
      const maxStock = selectedVariant?.stock || 99;
      const safeQuantity = Math.min(quantity, maxStock);

      const cartProduct = {
        id: product.id,
        name: product.name,
        price: currentPrice,
        originalPrice: originalPrice,
        image: selectedVariant?.imageUrl || product.image,
        rating: product.rating,
        reviews: product.reviews,
        category: product.category,
        variants: product.variants,
        stock: maxStock,
      };
      addToCart(cartProduct, safeQuantity, selectedSize);
      navigate("/cart");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="products-page">
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <button onClick={() => navigate("/")}>Go Back Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Stock Update Notification */}
      {stockUpdated && (
        <div className="stock-update-notification">
          <span>⟳</span> Stock has been updated
        </div>
      )}

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
            <img
              src={
                selectedVariant?.imageUrl || product.image || "/placeholder.svg"
              }
              alt={product.name}
            />
            {discount > 0 && (
              <span className="discount-badge">-{discount}%</span>
            )}
          </div>
          {product.variants && product.variants.length > 1 && (
            <div className="thumbnail-gallery">
              {product.variants.map((variant, idx) => (
                <img
                  key={idx}
                  src={variant.imageUrl || "/placeholder.svg"}
                  alt={`${product.name} - ${variant.size}`}
                  className={selectedSize === variant.size ? "active" : ""}
                  onClick={() => handleSizeSelect(variant.size)}
                />
              ))}
            </div>
          )}
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
              <span className="current-price">Rs. {currentPrice}</span>
              {originalPrice > currentPrice && (
                <>
                  <span className="original-price">Rs. {originalPrice}</span>
                  <span className="discount-percent">Save {discount}%</span>
                </>
              )}
            </div>
          </div>

          {product.description && (
            <p className="description">{product.description}</p>
          )}

          <div className="product-options">
            {product.variants && product.variants.length > 0 && (
              <div className="size-selector">
                <label>Select Size:</label>
                <div className="sizes">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`size-btn ${
                        selectedSize === variant.size ? "active" : ""
                      } ${variant.stock <= 0 ? "out-of-stock" : ""}`}
                      onClick={() => handleSizeSelect(variant.size)}
                      disabled={variant.stock <= 0}
                    >
                      {variant.size}
                      {variant.stock <= 0 && " (Out of Stock)"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Warning - Display above quantity */}
            {selectedVariant && selectedVariant.stock <= 0 && (
              <p className="stock-warning out-of-stock-warning">
                This item is currently out of stock
              </p>
            )}
            {selectedVariant &&
              selectedVariant.stock > 0 &&
              selectedVariant.stock <= 10 && (
                <p className="stock-warning">
                  Only {selectedVariant.stock} left in stock!
                </p>
              )}

            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  disabled={selectedVariant && selectedVariant.stock <= 0}
                  onClick={() => {
                    if (isInCart && existingCartItem) {
                      if (existingCartItem.quantity > 1) {
                        updateQuantity(
                          existingCartItem.id,
                          existingCartItem.quantity - 1
                        );
                      } else {
                        removeItem(existingCartItem.id);
                      }
                    } else {
                      setQuantity((prev) => Math.max(1, prev - 1));
                    }
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  disabled={selectedVariant && selectedVariant.stock <= 0}
                  onChange={(e) => {
                    const newQty = Math.max(
                      1,
                      Number.parseInt(e.target.value) || 1
                    );
                    const maxStock = selectedVariant?.stock || 99;
                    const limitedQty = Math.min(newQty, maxStock);
                    if (isInCart && existingCartItem) {
                      updateQuantity(existingCartItem.id, limitedQty);
                    } else {
                      setQuantity(limitedQty);
                    }
                  }}
                  min="1"
                  max={selectedVariant?.stock || 99}
                />
                <button
                  disabled={
                    (selectedVariant && selectedVariant.stock <= 0) ||
                    quantity >= (selectedVariant?.stock || 99)
                  }
                  onClick={() => {
                    const maxStock = selectedVariant?.stock || 99;
                    if (quantity >= maxStock) return;

                    if (isInCart && existingCartItem) {
                      updateQuantity(
                        existingCartItem.id,
                        existingCartItem.quantity + 1
                      );
                    } else {
                      setQuantity((prev) => prev + 1);
                    }
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={selectedVariant && selectedVariant.stock <= 0}
          >
            {selectedVariant && selectedVariant.stock <= 0
              ? "Out of Stock"
              : isInCart
              ? "Go to Cart"
              : "Add to Cart"}
          </button>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
}

export default ProductsPage;
