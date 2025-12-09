"use client";

import { useState, useRef, useEffect } from "react";
import "../styles/AddProduct.css";

const TEST = import.meta.env.VITE_TEST;

export default function AddProduct() {
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [totalSizes, setTotalSizes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    category: "",
    ratings: "",
    description: "",
    reviewNo: "",
    sizeType: "",
    sizes: [], // Array of size objects: {size: "", image: null, previewUrl: null, price: "", originalPrice: "", stock: "", discount: "", tax: ""}
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]); // Array of image previews for each size
  const [ratingError, setRatingError] = useState("");
  const [addedProducts, setAddedProducts] = useState([]);
  const [editingId, setEditingId] = useState(null); // Store database ID for editing
  const [searchTerm, setSearchTerm] = useState(""); // Search filter for products table
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products based on search

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${TEST}/api/admin/products`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        // Transform data to match UI format
        const transformedProducts = data.data.map((product) => ({
          id: product.id,
          productId: product.product_id,
          productName: product.name,
          category: product.category,
          ratings: product.rating?.toString() || "",
          description: product.description || "",
          reviewNo: product.review_count?.toString() || "",
          sizeType: product.size_type || "",
          sizes:
            product.product_variants?.map((v) => ({
              variantId: v.id, // Include variant ID for deletion
              size: v.size,
              price: v.price?.toString() || "",
              originalPrice: v.original_price?.toString() || "",
              stock: v.stock?.toString() || "",
              discount: v.discount_percent?.toString() || "",
              tax: v.tax_percent?.toString() || "",
              previewUrl: v.image_url,
              imageUrl: v.image_url,
            })) || [],
        }));
        setAddedProducts(transformedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Update filtered products whenever addedProducts or searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(addedProducts);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = addedProducts.filter(
        (product) =>
          product.productId.toLowerCase().includes(term) ||
          product.productName.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    }
  }, [addedProducts, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search button click
  const handleSearch = () => {
    // Search is already reactive via useEffect, but this can be used for explicit search
    const term = searchTerm.toLowerCase().trim();
    if (term === "") {
      setFilteredProducts(addedProducts);
    } else {
      const filtered = addedProducts.filter(
        (product) =>
          product.productId.toLowerCase().includes(term) ||
          product.productName.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    }
  };

  // Handle clear button click
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredProducts(addedProducts);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ratings") {
      const ratingValue = parseFloat(value);
      if (ratingValue > 5) {
        setRatingError("Rating cannot be more than 5");
      } else {
        setRatingError("");
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name === "totalSizes") {
      // Parse the value - allow empty string for clearing
      const num = value === "" ? 0 : parseInt(value, 10);
      if (isNaN(num) || num < 0) return;

      // IMPORTANT: Don't clear sizes when num is 0 (user is still typing)
      // Only update if num > 0 OR if user explicitly cleared the field
      if (num === 0) {
        // Just update the display value, don't clear sizes
        setTotalSizes(0);
        return;
      }

      // Update totalSizes state with the parsed number
      setTotalSizes(num);

      // Use functional update to get the LATEST formData.sizes
      setFormData((prev) => {
        const currentSizes = prev.sizes || [];
        const newSizes = [];

        for (let i = 0; i < num; i++) {
          if (i < currentSizes.length && currentSizes[i]) {
            // Preserve existing size with all its data
            newSizes.push({ ...currentSizes[i] });
          } else {
            // Create new empty size
            newSizes.push({
              size: "",
              image: null,
              imageUrl: null,
              previewUrl: null,
              price: "",
              originalPrice: "",
              stock: "",
              discount: "",
              tax: "",
            });
          }
        }

        return { ...prev, sizes: newSizes };
      });

      // Also update imagePreviews using functional update
      setImagePreviews((currentPreviews) => {
        const newPreviews = [];

        for (let i = 0; i < num; i++) {
          if (i < currentPreviews.length && currentPreviews[i]) {
            newPreviews.push(currentPreviews[i]);
          } else {
            newPreviews.push(null);
          }
        }

        return newPreviews;
      });
    } else if (name.startsWith("size-")) {
      const parts = name.split("-");
      let field, index;
      if (parts.length === 2) {
        field = "size";
        index = parts[1];
      } else {
        field = parts[1];
        index = parts[2];
      }
      const sizeIndex = parseInt(index);
      setFormData((prev) => {
        const newSizes = [...prev.sizes];
        newSizes[sizeIndex] = { ...newSizes[sizeIndex], [field]: value };
        return { ...prev, sizes: newSizes };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // State to track uploading status for each size
  const [uploadingImages, setUploadingImages] = useState({});

  const handleFileChange = async (e, sizeIndex = null) => {
    const file = e.target.files[0];
    if (sizeIndex !== null) {
      // Handle size-specific image
      if (file) {
        // Show preview immediately using FileReader
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreviews((prev) => {
            const newPreviews = [...prev];
            newPreviews[sizeIndex] = event.target.result;
            return newPreviews;
          });
        };
        reader.readAsDataURL(file);

        // Set uploading state for this size
        setUploadingImages((prev) => ({ ...prev, [sizeIndex]: true }));

        try {
          // Upload to Cloudinary immediately
          const formDataUpload = new FormData();
          formDataUpload.append("image", file);

          const response = await fetch(
            `${TEST}/api/admin/products/upload-image`,
            {
              method: "POST",
              credentials: "include",
              body: formDataUpload,
            }
          );

          const data = await response.json();

          if (data.success) {
            // Store the Cloudinary URL in sizes array
            setFormData((prev) => {
              const newSizes = [...prev.sizes];
              newSizes[sizeIndex] = {
                ...newSizes[sizeIndex],
                imageUrl: data.data.url,
                previewUrl: data.data.url,
              };
              return { ...prev, sizes: newSizes };
            });
          } else {
            setErrorMessage(`Failed to upload image: ${data.message}`);
            // Clear preview on error
            setImagePreviews((prev) => {
              const newPreviews = [...prev];
              newPreviews[sizeIndex] = null;
              return newPreviews;
            });
          }
        } catch (error) {
          console.error("Image upload error:", error);
          setErrorMessage("Failed to upload image. Please try again.");
          // Clear preview on error
          setImagePreviews((prev) => {
            const newPreviews = [...prev];
            newPreviews[sizeIndex] = null;
            return newPreviews;
          });
        } finally {
          setUploadingImages((prev) => ({ ...prev, [sizeIndex]: false }));
        }
      } else {
        // Clear image
        setFormData((prev) => {
          const newSizes = [...prev.sizes];
          newSizes[sizeIndex] = {
            ...newSizes[sizeIndex],
            imageUrl: null,
            previewUrl: null,
          };
          return { ...prev, sizes: newSizes };
        });
        setImagePreviews((prev) => {
          const newPreviews = [...prev];
          newPreviews[sizeIndex] = null;
          return newPreviews;
        });
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSizeSelection = (sizeType) => {
    setFormData((prev) => ({ ...prev, sizeType }));
  };

  const handleSubmit = async (e) => {
    // Prevent default form submission if called from form
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Check if any images are still uploading
      if (Object.values(uploadingImages).some((uploading) => uploading)) {
        setErrorMessage("Please wait for images to finish uploading");
        setLoading(false);
        return;
      }

      // Prepare sizes data with pre-uploaded image URLs
      const sizesData = formData.sizes.map((size) => ({
        size: size.size,
        price: size.price,
        originalPrice: size.originalPrice,
        stock: size.stock,
        discount: size.discount,
        tax: size.tax,
        imageUrl: size.imageUrl || null, // Pre-uploaded Cloudinary URL
      }));

      // Send JSON data (images already uploaded to Cloudinary)
      const submitData = {
        productId: formData.productId,
        productName: formData.productName,
        category: formData.category,
        ratings: formData.ratings,
        description: formData.description,
        reviewNo: formData.reviewNo,
        sizeType: formData.sizeType,
        sizes: sizesData,
      };

      const url = editingId
        ? `${TEST}/api/admin/products/${editingId}`
        : `${TEST}/api/admin/products`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(
          editingId
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        setEditingId(null);

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
        });
        setImagePreviews([]);
        setCurrentStep(1);
        setTotalSizes(0);

        // Refresh products list
        fetchProducts();
      } else {
        setErrorMessage(data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleEdit = (productIndex) => {
    const product = addedProducts[productIndex];
    setFormData({
      productId: product.productId,
      productName: product.productName,
      category: product.category,
      ratings: product.ratings,
      description: product.description,
      reviewNo: product.reviewNo,
      sizeType: product.sizeType,
      sizes: product.sizes.map((size) => ({
        ...size,
        image: null, // Clear file input, keep existing URL
      })),
    });
    setTotalSizes(product.sizes.length);
    setImagePreviews(
      product.sizes.map((size) => size.previewUrl || size.imageUrl || null)
    );
    setCurrentStep(1);
    setEditingId(product.id); // Store database ID
  };

  // Delete a single variant (or entire product if it's the last variant)
  const handleDeleteVariant = async (
    productId,
    variantId,
    productName,
    sizeName,
    isLastVariant
  ) => {
    const confirmMessage = isLastVariant
      ? `This is the last variant of "${productName}". Deleting it will remove the entire product. Are you sure?`
      : `Are you sure you want to delete the "${sizeName}" variant of "${productName}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${TEST}/api/admin/products/${productId}/variant/${variantId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.productDeleted) {
          setSuccessMessage("Last variant deleted. Product has been removed.");
        } else {
          setSuccessMessage(`Variant "${sizeName}" deleted successfully!`);
        }
        fetchProducts();
      } else {
        setErrorMessage(data.message || "Failed to delete variant");
      }
    } catch (error) {
      console.error("Delete variant error:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    }
  };

  // Delete entire product with all variants
  const handleDelete = async (productIndex) => {
    const product = addedProducts[productIndex];

    if (
      !window.confirm(
        `Are you sure you want to delete "${product.productName}" and ALL its variants?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${TEST}/api/admin/products/${product.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Product and all variants deleted successfully!");
        fetchProducts();
      } else {
        setErrorMessage(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    }
  };

  const generateProductId = async () => {
    try {
      const response = await fetch(
        `${TEST}/api/admin/products/generate-id`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, productId: data.productId }));
      }
    } catch (error) {
      console.error("Generate ID error:", error);
      // Fallback to local generation
      const timestamp = Date.now().toString().slice(-4);
      setFormData((prev) => ({ ...prev, productId: `PRD${timestamp}` }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h3 className="section-heading">
              Step 1: Basic Product Information
            </h3>
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
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
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
                {ratingError && (
                  <span className="error-message">{ratingError}</span>
                )}
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
        );

      case 2:
        return (
          <div className="form-section">
            <h3 className="section-heading">
              Step 2: Select Size Type and Total Sizes
            </h3>
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
              <label htmlFor="totalSizes">
                Total Number of Sizes in Product *
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="totalSizes"
                name="totalSizes"
                value={totalSizes === 0 ? "" : totalSizes}
                onChange={handleChange}
                placeholder="Enter total number of sizes"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-section">
            <h3 className="section-heading">Step 3: Configure Sizes</h3>
            {formData.sizeType === "pcs" && totalSizes === 0 && (
              <div className="form-group full-width">
                <label htmlFor="totalSizes">Total Number of Sizes *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="totalSizes"
                  name="totalSizes"
                  value={totalSizes === 0 ? "" : totalSizes}
                  onChange={handleChange}
                  placeholder="Enter total number of sizes"
                  required
                />
              </div>
            )}
            {formData.sizes.length > 0 &&
              formData.sizes.map((size, index) => (
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
                      <label htmlFor={`size-image-${index}`}>
                        Image {!size.imageUrl && "*"}
                      </label>
                      <input
                        type="file"
                        id={`size-image-${index}`}
                        name={`size-image-${index}`}
                        onChange={(e) => handleFileChange(e, index)}
                        accept="image/*"
                        required={!size.imageUrl && !imagePreviews[index]}
                        className="file-input"
                        disabled={uploadingImages[index]}
                      />
                      {uploadingImages[index] && (
                        <div className="uploading-indicator">
                          <span className="spinner"></span> Uploading...
                        </div>
                      )}
                      {(imagePreviews[index] || size.imageUrl) &&
                        !uploadingImages[index] && (
                          <div className="image-preview-container">
                            <img
                              src={imagePreviews[index] || size.imageUrl}
                              alt={`Preview ${index}`}
                              className="image-preview"
                            />
                            <button
                              type="button"
                              className="close-preview"
                              onClick={() => {
                                setImagePreviews((prev) => {
                                  const newPreviews = [...prev];
                                  newPreviews[index] = null;
                                  return newPreviews;
                                });
                                setFormData((prev) => {
                                  const newSizes = [...prev.sizes];
                                  newSizes[index] = {
                                    ...newSizes[index],
                                    imageUrl: null,
                                    previewUrl: null,
                                  };
                                  return { ...prev, sizes: newSizes };
                                });
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
                      <label htmlFor={`size-originalPrice-${index}`}>
                        MRP (₹)
                      </label>
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
                      <label htmlFor={`size-stock-${index}`}>
                        Stock Quantity *
                      </label>
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
                      <label htmlFor={`size-discount-${index}`}>
                        Discount (%)
                      </label>
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
                          className={`tax-btn ${
                            size.tax === "5" ? "active" : ""
                          }`}
                          onClick={() => {
                            setFormData((prev) => {
                              const newSizes = [...prev.sizes];
                              newSizes[index] = {
                                ...newSizes[index],
                                tax: "5",
                              };
                              return { ...prev, sizes: newSizes };
                            });
                          }}
                        >
                          5%
                        </button>
                        <button
                          type="button"
                          className={`tax-btn ${
                            size.tax === "12" ? "active" : ""
                          }`}
                          onClick={() => {
                            setFormData((prev) => {
                              const newSizes = [...prev.sizes];
                              newSizes[index] = {
                                ...newSizes[index],
                                tax: "12",
                              };
                              return { ...prev, sizes: newSizes };
                            });
                          }}
                        >
                          12%
                        </button>
                        <button
                          type="button"
                          className={`tax-btn ${
                            size.tax === "18" ? "active" : ""
                          }`}
                          onClick={() => {
                            setFormData((prev) => {
                              const newSizes = [...prev.sizes];
                              newSizes[index] = {
                                ...newSizes[index],
                                tax: "18",
                              };
                              return { ...prev, sizes: newSizes };
                            });
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
        );

      case 4:
        return (
          <div className="form-section">
            <h3 className="section-heading">Step 4: Review and Submit</h3>
            <div className="product-summary">
              <h4>Product Summary</h4>
              <p>
                <strong>Product ID:</strong> {formData.productId}
              </p>
              <p>
                <strong>Product Name:</strong> {formData.productName}
              </p>
              <p>
                <strong>Category:</strong> {formData.category}
              </p>
              <p>
                <strong>Ratings:</strong> {formData.ratings}
              </p>
              <p>
                <strong>Reviews:</strong> {formData.reviewNo || "0"}
              </p>
              <p>
                <strong>Description:</strong> {formData.description}
              </p>
              <p>
                <strong>Size Type:</strong> {formData.sizeType}
              </p>
              <p>
                <strong>Number of Sizes:</strong> {formData.sizes.length}
              </p>

              {/* Size Details */}
              <div className="sizes-summary">
                <h5>Size Details:</h5>
                {formData.sizes.map((size, index) => (
                  <div key={index} className="size-summary-item">
                    <div className="size-summary-header">
                      <strong>
                        Size {index + 1}: {size.size}
                      </strong>
                    </div>
                    <div className="size-summary-details">
                      {(imagePreviews[index] || size.imageUrl) && (
                        <img
                          src={imagePreviews[index] || size.imageUrl}
                          alt={`Size ${size.size}`}
                          className="summary-image"
                        />
                      )}
                      <div className="size-summary-info">
                        <span>Price: ₹{size.price}</span>
                        {size.originalPrice && (
                          <span>MRP: ₹{size.originalPrice}</span>
                        )}
                        <span>Stock: {size.stock}</span>
                        {size.discount && (
                          <span>Discount: {size.discount}%</span>
                        )}
                        <span>Tax: {size.tax || "18"}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="form-title">
        {editingId ? "Edit Product" : "Add New Product"}
      </h2>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${currentStep >= 1 ? "active" : ""}`}>1</div>
        <div className={`step ${currentStep >= 2 ? "active" : ""}`}>2</div>
        <div className={`step ${currentStep >= 3 ? "active" : ""}`}>3</div>
        <div className={`step ${currentStep >= 4 ? "active" : ""}`}>4</div>
      </div>

      {successMessage && <div className="success-alert">{successMessage}</div>}
      {errorMessage && <div className="error-alert">{errorMessage}</div>}

      <form className="product-form" onSubmit={(e) => e.preventDefault()}>
        {renderStepContent()}

        <div className="form-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={prevStep}
              disabled={loading}
            >
              Previous
            </button>
          )}
          {editingId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  productId: "",
                  productName: "",
                  category: "",
                  ratings: "",
                  description: "",
                  reviewNo: "",
                  sizeType: "",
                  sizes: [],
                });
                setImagePreviews([]);
                setCurrentStep(1);
                setTotalSizes(0);
              }}
              disabled={loading}
            >
              Cancel Edit
            </button>
          )}
          {currentStep < 4 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={nextStep}
              disabled={loading}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Submit Product"}
            </button>
          )}
        </div>
      </form>

      {addedProducts.length > 0 && (
        <div className="added-products-table">
          <h3 className="table-heading">Added Products</h3>

          {/* Search Filter */}
          <div className="search-filter">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search by Product ID or Name..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            {/* <button type="button" className="search-btn" onClick={handleSearch}>
              Search
            </button> */}
            <button
              type="button"
              className="clear-btn"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-results">
              No products found matching "{searchTerm}"
            </div>
          ) : (
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
                {filteredProducts.flatMap((product, productIndex) =>
                  product.sizes.map((size, sizeIndex) => (
                    <tr key={`${productIndex}-${sizeIndex}`}>
                      <td>
                        {(size.previewUrl || size.imageUrl) && (
                          <img
                            src={size.previewUrl || size.imageUrl}
                            alt={product.productName}
                            className="table-image"
                          />
                        )}
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
                          onClick={() => {
                            // Find the actual index in addedProducts (not filteredProducts)
                            const actualIndex = addedProducts.findIndex(
                              (p) => p.id === product.id
                            );
                            handleEdit(actualIndex);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => {
                            const isLastVariant = product.sizes.length === 1;
                            handleDeleteVariant(
                              product.id,
                              size.variantId,
                              product.productName,
                              size.size,
                              isLastVariant
                            );
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
