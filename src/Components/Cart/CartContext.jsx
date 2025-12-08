import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems')
    return savedCart ? JSON.parse(savedCart) : []
  })

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, quantity, selectedSize) => {
    const selectedSizePrice = product?.sizePrices?.[selectedSize]
    const price = selectedSizePrice?.price || product.price
    const originalPrice = selectedSizePrice?.originalPrice || product.originalPrice

    const cartItem = {
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: price,
      originalPrice: originalPrice,
      quantity: quantity,
      image: product.images ? product.images[0] : product.image,
      size: selectedSize,
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === cartItem.id)
      if (existingItem) {
        return prevItems.map(item =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prevItems, cartItem]
      }
    })
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id)
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const removeItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeItem,
      getCartTotal,
      getCartCount,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}
