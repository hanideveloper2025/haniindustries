import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

// Cart expiry time in milliseconds (20 minutes)
const CART_EXPIRY_TIME = 20 * 60 * 1000;

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Helper function to check if cart has expired
const isCartExpired = () => {
  const cartTimestamp = sessionStorage.getItem("cartTimestamp");
  if (!cartTimestamp) return true;

  const now = Date.now();
  const savedTime = parseInt(cartTimestamp, 10);
  return now - savedTime > CART_EXPIRY_TIME;
};

// Helper function to get cart from sessionStorage with expiry check
const getStoredCart = () => {
  if (isCartExpired()) {
    sessionStorage.removeItem("cartItems");
    sessionStorage.removeItem("cartTimestamp");
    return [];
  }

  const savedCart = sessionStorage.getItem("cartItems");
  return savedCart ? JSON.parse(savedCart) : [];
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => getStoredCart());

  // Stock validation errors state (shared between cart and checkout pages)
  const [stockValidationErrors, setStockValidationErrors] = useState([]);

  // Save cart to sessionStorage with timestamp whenever it changes
  useEffect(() => {
    sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
    if (cartItems.length > 0) {
      sessionStorage.setItem("cartTimestamp", Date.now().toString());
    }
  }, [cartItems]);

  // Check for cart expiry periodically (every minute)
  useEffect(() => {
    const checkExpiry = () => {
      if (isCartExpired() && cartItems.length > 0) {
        setCartItems([]);
        sessionStorage.removeItem("cartItems");
        sessionStorage.removeItem("cartTimestamp");
      }
    };

    // Check every minute
    const intervalId = setInterval(checkExpiry, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [cartItems.length]);

  const addToCart = (product, quantity, selectedSize) => {
    const selectedSizePrice = product?.sizePrices?.[selectedSize];
    const price = selectedSizePrice?.price || product.price;
    const originalPrice =
      selectedSizePrice?.originalPrice || product.originalPrice;

    // Get stock for the selected variant or default stock
    let stock = product.stock || 0;
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v) => v.size === selectedSize);
      if (variant) {
        stock = variant.stock || 0;
      } else if (product.variants.length === 1) {
        stock = product.variants[0].stock || 0;
      }
    }

    const cartItem = {
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: price,
      originalPrice: originalPrice,
      quantity: quantity,
      image: product.images ? product.images[0] : product.image,
      size: selectedSize,
      stock: stock,
    };

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === cartItem.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, cartItem];
      }
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        getCartTotal,
        getCartCount,
        clearCart,
        stockValidationErrors,
        setStockValidationErrors,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
