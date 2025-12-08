"use client"

import { useState, useRef } from "react"
import "../styles/AddProduct.css"

export default function AddProduct() {
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    category: "",
    ratings: "",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "",
    description: "",
    image: null,
    reviewNo: "",
    tax: "",
    sizeType: "",
    size: "",
  })

  const [successMessage, setSuccessMessage] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [ratingError, setRatingError] = useState("")
  const [addedProducts, setAddedProducts] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "ratings") {
      const ratingValue = parseFloat(value)
      if (ratingValue > 5) {
        setRatingError("Rating cannot be more than 5")
      } else {
        setRatingError("")
      }
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData((prev) => ({ ...prev, image: file }))
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingIndex !== null) {
      // Update existing product
      setAddedProducts((prev) =>
        prev.map((product, index) =>
          index === editingIndex
            ? {
                productId: formData.productId,
                productName: formData.productName,
                image: imagePreview,
                price: formData.price,
                stock: formData.stock,
                size: formData.size,
              }
            : product
        )
      )
      setSuccessMessage("Product updated successfully!")
      setEditingIndex(null)
    } else {
      // Add new product
      setAddedProducts((prev) => [...prev, {
        productId: formData.productId,
        productName: formData.productName,
        image: imagePreview,
        price: formData.price,
        stock: formData.stock,
        size: formData.size,
      }])
      setSuccessMessage("Product added successfully!")
    }
    setTimeout(() => setSuccessMessage(""), 3000)
    setFormData({
      productId: "",
      productName: "",
      category: "",
      ratings: "",
      price: "",
      originalPrice: "",
      discount: "",
      stock: "",
      description: "",
      image: null,
      reviewNo: "",
      tax: "",
      sizeType: "",
      size: "",
    })
    setImagePreview(null)
  }

  const handleEdit = (index) => {
    const product = addedProducts[index]
    setFormData({
      productId: product.productId,
      productName: product.productName,
      category: "",
      ratings: "",
      price: product.price,
      originalPrice: "",
      discount: "",
      stock: product.stock,
      description: "",
      image: null,
      reviewNo: "",
      tax: "",
      sizeType: "",
      size: product.size,
    })
    setImagePreview(product.image)
    setEditingIndex(index)
  }

  const handleDelete = (index) => {
    setAddedProducts((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="add-product-container">
      <h2 className="form-title">Add New Product</h2>

      {successMessage && <div className="success-alert">{successMessage}</div>}

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-heading">Product Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="productId">Product ID *</label>
              <input
                type="text"
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                placeholder="Enter product ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="productName">Product Name *</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                <option value="oils">oils</option>
                <option value="cleaners">cleaners</option>
                <option value="others">others</option>
                {/* <option value="packaging">Packaging</option> */}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ratings">Ratings *</label>
              <input
                type="number"
                id="ratings"
                name="ratings"
                value={formData.ratings}
                onChange={handleChange}
                placeholder="0.0"
                min="0"
                max="5"
                step="0.1"
                required
              />
              {ratingError && <span className="error-message">{ratingError}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="originalPrice">Original Price (₹)</label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="discount">Discount (%)</label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock Quantity *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-heading">Product Details</h3>

          <div className="form-group full-width">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed product description..."
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group full-width">
            <label htmlFor="image">Product Image *</label>
            <div className="file-input-wrapper">
              <input type="file" id="image" name="image" onChange={handleFileChange} accept="image/*" required ref={fileInputRef} />
              <span className="file-label" onClick={() => fileInputRef.current.click()}>{formData.image ? formData.image.name : "Choose image file..."}</span>
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button type="button" className="close-preview" style={{ fontSize: '24px', fontWeight: 'bold' }} onClick={() => { setImagePreview(null); setFormData((prev) => ({ ...prev, image: null })); fileInputRef.current.value = ''; }}>×</button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="reviewNo">Number of Reviews</label>
            <input
              type="number"
              id="reviewNo"
              name="reviewNo"
              value={formData.reviewNo}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group full-width">
            <label>Tax (%)</label>
            <div className="tax-buttons">
              <button type="button" className={`tax-btn ${formData.tax === "5" ? "active" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, tax: "5" }))}>5%</button>
              <button type="button" className={`tax-btn ${formData.tax === "12" ? "active" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, tax: "12" }))}>12%</button>
              <button type="button" className={`tax-btn ${formData.tax === "18" ? "active" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, tax: "18" }))}>18%</button>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="sizeType">Size Type</label>
            <select id="sizeType" name="sizeType" value={formData.sizeType} onChange={handleChange}>
              <option value="">Select Size Type</option>
              <option value="liters">Liters</option>
              <option value="grams">Grams</option>
              <option value="pcs">Pcs</option>
            </select>
          </div>

          {formData.sizeType && (
            <div className="form-group full-width">
              <label>Choose Size</label>
              {formData.sizeType === "pcs" ? (
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="Enter number of pcs"
                  min="1"
                />
              ) : (
                <div className="size-buttons">
                  {formData.sizeType === "liters" && (
                    <>
                      <button type="button" className={`size-btn ${formData.size === "200 ml" ? "active" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, size: "200 ml" }))}>200 ml</button>
                      <button type="button" className={`size-btn ${formData.size === "500 ml" ? "active" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, size: "500 ml" }))}>500 ml</button>
                      <button type="button" className={`size-btn ${formData.size === "1000 ml" ? "active" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, size: "1000 ml" }))}>1000 ml</button>
                    </>
                  )}
                  {formData.sizeType === "grams" && (
                    <>
                      <button type="button" className={`size-btn ${formData.size === "250 mg" ? "active" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, size: "250 mg" }))}>250 mg</button>
                      <button type="button" className={`size-btn ${formData.size === "500 mg" ? "active" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, size: "500 mg" }))}>500 mg</button>
                      <button type="button" className={`size-btn ${formData.size === "1000 mg" ? "active" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, size: "1000 mg" }))}>1000 mg</button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingIndex !== null ? "Update Product" : "Add Product"}
          </button>
          <button type="reset" className="btn-secondary">
            Clear Form
          </button>
        </div>
      </form>

      {addedProducts.length > 0 && (
        <div className="added-products-table">
          <h3 className="table-heading">Added Products</h3>
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {addedProducts.map((product, index) => (
                <tr key={index}>
                  <td>
                    {product.image && <img src={product.image} alt={product.productName} className="table-image" />}
                  </td>
                  <td>{product.productId}</td>
                  <td>{product.productName}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock}</td>
                  <td>{product.size}</td>
                  <td>
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
