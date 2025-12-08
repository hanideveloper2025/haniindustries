"use client"

import { useState, useRef } from "react"
import "../styles/AddProduct.css"

export default function AddProduct() {
  const fileInputRef = useRef(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [totalSizes, setTotalSizes] = useState(0)

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    category: "",
    ratings: "",
    description: "",
    reviewNo: "",
    sizeType: "",
    sizes: [], // Array of size objects: {size: "", image: null, previewUrl: null, price: "", originalPrice: "", stock: "", discount: "", tax: ""}
  })

  const [successMessage, setSuccessMessage] = useState("")
  const [imagePreviews, setImagePreviews] = useState([]) // Array of image previews for each size
  const [ratingError, setRatingError] = useState("")
  const [addedProducts, setAddedProducts] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  const [nextProductId, setNextProductId] = useState(1)

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
    } else if (name === "totalSizes") {
      const num = parseInt(value) || 0
      setTotalSizes(num)
      // Initialize sizes array with empty objects
      const sizes = Array(num).fill().map(() => ({
        size: "",
        image: null,
        price: "",
        originalPrice: "",
        stock: "",
        discount: "",
        tax: ""
      }))
      setFormData((prev) => ({ ...prev, sizes }))
      setImagePreviews(Array(num).fill(null))
    } else if (name.startsWith("size-")) {
      const parts = name.split("-")
      let field, index
      if (parts.length === 2) {
        field = "size"
        index = parts[1]
      } else {
        field = parts[1]
        index = parts[2]
      }
      const sizeIndex = parseInt(index)
      setFormData((prev) => {
        const newSizes = [...prev.sizes]
        newSizes[sizeIndex] = { ...newSizes[sizeIndex], [field]: value }
        return { ...prev, sizes: newSizes }
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e, sizeIndex = null) => {
    const file = e.target.files[0]
    if (sizeIndex !== null) {
      // Handle size-specific image
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData((prev) => {
            const newSizes = [...prev.sizes]
            newSizes[sizeIndex] = { ...newSizes[sizeIndex], image: file, previewUrl: e.target.result }
            return { ...prev, sizes: newSizes }
          })
          setImagePreviews((prev) => {
            const newPreviews = [...prev]
            newPreviews[sizeIndex] = e.target.result
            return newPreviews
          })
        }
        reader.readAsDataURL(file)
      } else {
        setFormData((prev) => {
          const newSizes = [...prev.sizes]
          newSizes[sizeIndex] = { ...newSizes[sizeIndex], image: null, previewUrl: null }
          return { ...prev, sizes: newSizes }
        })
        setImagePreviews((prev) => {
          const newPreviews = [...prev]
          newPreviews[sizeIndex] = null
          return newPreviews
        })
      }
    } else {
      // Handle single image (legacy)
      setFormData((prev) => ({ ...prev, image: file }))
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => setImagePreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        setImagePreview(null)
      }
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSizeSelection = (sizeType) => {
    setFormData((prev) => ({ ...prev, sizeType }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Create product object with sizes
    const product = {
      productId: formData.productId,
      productName: formData.productName,
      category: formData.category,
      ratings: formData.ratings,
      description: formData.description,
      reviewNo: formData.reviewNo,
      sizeType: formData.sizeType,
      sizes: formData.sizes,
    }

    if (editingIndex !== null) {
      // Update existing product
      setAddedProducts((prev) =>
        prev.map((p, index) =>
          index === editingIndex ? product : p
        )
      )
      setSuccessMessage("Product updated successfully!")
      setEditingIndex(null)
    } else {
      // Add new product
      setAddedProducts((prev) => [...prev, product])
      setSuccessMessage("Product added successfully!")
    }

    setTimeout(() => setSuccessMessage(""), 3000)

    // Reset form
    setFormData({
      productId: "",
      productName: "",
      category: "",
      ratings: "",
      description: "",
      reviewNo: "",
      sizeType: "",
      sizes: [],
    })
    setImagePreviews([])
    setCurrentStep(1)
    setTotalSizes(0)
  }

  const handleEdit = (index) => {
    const product = addedProducts[index]
    setFormData({
      productId: product.productId,
      productName: product.productName,
      category: product.category,
      ratings: product.ratings,
      description: product.description,
      reviewNo: product.reviewNo,
      sizeType: product.sizeType,
      sizes: product.sizes,
    })
    setTotalSizes(product.sizes.length)
    setImagePreviews(product.sizes.map(size => size.previewUrl || null))
    setCurrentStep(1)
    setEditingIndex(index)
  }

  const handleDelete = (index) => {
    setAddedProducts((prev) => prev.filter((_, i) => i !== index))
  }

  const generateProductId = () => {
    const id = `PRD${nextProductId.toString().padStart(4, '0')}`
    setFormData((prev) => ({ ...prev, productId: id }))
    setNextProductId((prev) => prev + 1)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h3 className="section-heading">Step 1: Basic Product Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productId">Product ID *</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    placeholder="Enter product ID"
                    required
                  />
                  <button
                    type="button"
                    className="generate-btn"
                    onClick={generateProductId}
                  >
                    Generate
                  </button>
                </div>
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
          </div>
        )

      case 2:
        return (
          <div className="form-section">
            <h3 className="section-heading">Step 2: Select Size Type and Total Sizes</h3>
            <div className="form-group full-width">
              <label htmlFor="sizeType">Size Type *</label>
              <select
                id="sizeType"
                name="sizeType"
                value={formData.sizeType}
                onChange={(e) => handleSizeSelection(e.target.value)}
                required
              >
                <option value="">Select Size Type</option>
                <option value="liters">Liters</option>
                <option value="grams">Grams</option>
                <option value="pcs">Pcs</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="totalSizes">Total Number of Sizes in Product *</label>
              <input
                type="number"
                id="totalSizes"
                name="totalSizes"
                value={totalSizes}
                onChange={handleChange}
                placeholder="Enter total number of sizes"
                min="1"
                required
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="form-section">
            <h3 className="section-heading">Step 3: Configure Sizes</h3>
            {formData.sizeType === "pcs" && totalSizes === 0 && (
              <div className="form-group full-width">
                <label htmlFor="totalSizes">Total Number of Sizes *</label>
                <input
                  type="number"
                  id="totalSizes"
                  name="totalSizes"
                  value={totalSizes}
                  onChange={handleChange}
                  placeholder="Enter total number of sizes"
                  min="1"
                  required
                />
              </div>
            )}
            {formData.sizes.length > 0 && formData.sizes.map((size, index) => (
              <div key={index} className="size-configuration">
                <h4>Size {index + 1}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`size-${index}`}>Size *</label>
                    <input
                      type="text"
                      id={`size-${index}`}
                      name={`size-${index}`}
                      value={size.size}
                      onChange={handleChange}
                      placeholder="Enter size (e.g., Small, Medium)"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`size-image-${index}`}>Image *</label>
                    <input
                      type="file"
                      id={`size-image-${index}`}
                      name={`size-image-${index}`}
                      onChange={(e) => handleFileChange(e, index)}
                      accept="image/*"
                      required
                      className="file-input"
                    />
                    {imagePreviews[index] && (
                      <div className="image-preview-container">
                        <img src={imagePreviews[index]} alt={`Preview ${index}`} className="image-preview" />
                        <button
                          type="button"
                          className="close-preview"
                          onClick={() => {
                            setImagePreviews((prev) => {
                              const newPreviews = [...prev]
                              newPreviews[index] = null
                              return newPreviews
                            })
                            setFormData((prev) => {
                              const newSizes = [...prev.sizes]
                              newSizes[index] = { ...newSizes[index], image: null }
                              return { ...prev, sizes: newSizes }
                            })
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`size-price-${index}`}>Price (₹) *</label>
                    <input
                      type="number"
                      id={`size-price-${index}`}
                      name={`size-price-${index}`}
                      value={size.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`size-originalPrice-${index}`}>MRP (₹)</label>
                    <input
                      type="number"
                      id={`size-originalPrice-${index}`}
                      name={`size-originalPrice-${index}`}
                      value={size.originalPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`size-stock-${index}`}>Stock Quantity *</label>
                    <input
                      type="number"
                      id={`size-stock-${index}`}
                      name={`size-stock-${index}`}
                      value={size.stock}
                      onChange={handleChange}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`size-discount-${index}`}>Discount (%)</label>
                    <input
                      type="number"
                      id={`size-discount-${index}`}
                      name={`size-discount-${index}`}
                      value={size.discount}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tax (%)</label>
                    <div className="tax-buttons">
                      <button
                        type="button"
                        className={`tax-btn ${size.tax === "5" ? "active" : ""}`}
                        onClick={() => {
                          setFormData((prev) => {
                            const newSizes = [...prev.sizes]
                            newSizes[index] = { ...newSizes[index], tax: "5" }
                            return { ...prev, sizes: newSizes }
                          })
                        }}
                      >
                        5%
                      </button>
                      <button
                        type="button"
                        className={`tax-btn ${size.tax === "12" ? "active" : ""}`}
                        onClick={() => {
                          setFormData((prev) => {
                            const newSizes = [...prev.sizes]
                            newSizes[index] = { ...newSizes[index], tax: "12" }
                            return { ...prev, sizes: newSizes }
                          })
                        }}
                      >
                        12%
                      </button>
                      <button
                        type="button"
                        className={`tax-btn ${size.tax === "18" ? "active" : ""}`}
                        onClick={() => {
                          setFormData((prev) => {
                            const newSizes = [...prev.sizes]
                            newSizes[index] = { ...newSizes[index], tax: "18" }
                            return { ...prev, sizes: newSizes }
                          })
                        }}
                      >
                        18%
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 4:
        return (
          <div className="form-section">
            <h3 className="section-heading">Step 4: Review and Submit</h3>
            <div className="product-summary">
              <h4>Product Summary</h4>
              <p><strong>Product ID:</strong> {formData.productId}</p>
              <p><strong>Product Name:</strong> {formData.productName}</p>
              <p><strong>Category:</strong> {formData.category}</p>
              <p><strong>Ratings:</strong> {formData.ratings}</p>
              <p><strong>Description:</strong> {formData.description}</p>
              <p><strong>Size Type:</strong> {formData.sizeType}</p>
              <p><strong>Number of Sizes:</strong> {formData.sizes.length}</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="add-product-container">
      <h2 className="form-title">Add New Product</h2>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4</div>
      </div>

      {successMessage && <div className="success-alert">{successMessage}</div>}

      <form className="product-form" onSubmit={handleSubmit}>
        {renderStepContent()}

        <div className="form-actions">
          {currentStep > 1 && (
            <button type="button" className="btn-secondary" onClick={prevStep}>
              Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button type="button" className="btn-primary" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="submit" className="btn-primary">
              Add Product
            </button>
          )}
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
              {addedProducts.flatMap((product, productIndex) =>
                product.sizes.map((size, sizeIndex) => (
                  <tr key={`${productIndex}-${sizeIndex}`}>
                    <td>
                      {size.previewUrl && <img src={size.previewUrl} alt={product.productName} className="table-image" />}
                    </td>
                    <td>{product.productId}</td>
                    <td>{product.productName}</td>
                    <td>₹{size.price}</td>
                    <td>{size.stock}</td>
                    <td>{size.size}</td>
                    <td>
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEdit(productIndex)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(productIndex)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
