"use client";

import { useState, useEffect } from "react";
import "../styles/AddFeaturedProduct.css";

const TEST = import.meta.env.VITE_TEST;

export default function AddFeaturedProduct() {
  const [formData, setFormData] = useState({
    productName: "",
    ratings: "",
    price: "",
    reviewNo: "",
    originalPrice: "",
    productImage: "",
    discount: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Cloudinary URL
  const [uploadingImage, setUploadingImage] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch featured products on component mount
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(
        `${TEST}/api/admin/featured-products`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        // Transform data to match UI format
        const transformedProducts = data.data.map((product) => ({
          id: product.id,
          productName: product.product_name,
          ratings: product.rating?.toString() || "",
          price: product.price?.toString() || "",
          originalPrice: product.original_price?.toString() || "",
          reviewNo: product.review_count?.toString() || "",
          discount: product.discount_percent?.toString() || "",
          image: product.image_url,
          isActive: product.is_active,
          displayOrder: product.display_order,
        }));
        setFeaturedProducts(transformedProducts);
      }
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
  };

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "productImage" && files && files[0]) {
      const file = files[0];

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload to Cloudinary immediately
      setUploadingImage(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        const response = await fetch(
          `${TEST}/api/admin/featured-products/upload-image`,
          {
            method: "POST",
            credentials: "include",
            body: formDataUpload,
          }
        );

        const data = await response.json();

        if (data.success) {
          setImageUrl(data.data.url);
        } else {
          setErrorMessage(`Failed to upload image: ${data.message}`);
          setImagePreview("");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        setErrorMessage("Failed to upload image. Please try again.");
        setImagePreview("");
      } finally {
        setUploadingImage(false);
      }
    } else if (name === "ratings") {
      const ratingValue = parseFloat(value);
      if (ratingValue > 5) {
        setRatingError("Rating cannot be more than 5");
      } else {
        setRatingError("");
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this featured product?")
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${TEST}/api/admin/featured-products/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Featured product deleted successfully!");
        fetchFeaturedProducts();
      } else {
        setErrorMessage(data.message || "Failed to delete featured product");
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

  const handleEdit = (product) => {
    setFormData({
      productName: product.productName,
      ratings: product.ratings || "",
      price: product.price,
      reviewNo: product.reviewNo,
      originalPrice: product.originalPrice,
      productImage: "",
      discount: product.discount || "",
    });
    setImagePreview(product.image);
    setImageUrl(product.image); // Set existing image URL
    setEditingId(product.id);
  };

  const handleReset = () => {
    setFormData({
      productName: "",
      ratings: "",
      price: "",
      reviewNo: "",
      originalPrice: "",
      productImage: "",
      discount: "",
    });
    setImagePreview("");
    setImageUrl("");
    setRatingError("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate image
    if (!imageUrl && !editingId) {
      setErrorMessage("Please upload a product image");
      return;
    }

    // Check if image is still uploading
    if (uploadingImage) {
      setErrorMessage("Please wait for image to finish uploading");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const submitData = {
        productName: formData.productName,
        imageUrl: imageUrl,
        price: formData.price,
        originalPrice: formData.originalPrice,
        rating: formData.ratings,
        reviewCount: formData.reviewNo,
        discountPercent: formData.discount || 0,
      };

      const url = editingId
        ? `${TEST}/api/admin/featured-products/${editingId}`
        : `${TEST}/api/admin/featured-products`;

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
            ? "Featured product updated successfully!"
            : "Featured product added successfully!"
        );
        handleReset();
        fetchFeaturedProducts();
      } else {
        setErrorMessage(data.message || "Failed to save featured product");
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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(
        `${TEST}/api/admin/featured-products/${id}/toggle-status`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(
          `Featured product ${
            !currentStatus ? "activated" : "deactivated"
          } successfully!`
        );
        fetchFeaturedProducts();
      } else {
        setErrorMessage(data.message || "Failed to toggle status");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    }
  };

  return (
    <div className="featured-container">
      <h2 className="featured-title">
        {editingId ? "Edit Featured Product" : "Add Featured Product"}
      </h2>

      {successMessage && <div className="success-alert">{successMessage}</div>}
      {errorMessage && <div className="error-alert">{errorMessage}</div>}

      <form className="featured-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-heading">Featured Product Information</h3>

          <div className="form-row">
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
              <label htmlFor="ratings">Ratings  *</label>
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

            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reviewNo">Review No. *</label>
              <input
                type="number"
                id="reviewNo"
                name="reviewNo"
                value={formData.reviewNo}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="originalPrice">MRP (₹) *</label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="productImage">
                Product Image {!editingId && "*"}
              </label>
              <div className="input-preview-container">
                <input
                  type="file"
                  id="productImage"
                  name="productImage"
                  onChange={handleChange}
                  accept="image/*"
                  required={!editingId && !imageUrl}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <div className="uploading-indicator">
                    <span className="spinner"></span> Uploading...
                  </div>
                )}
                {imagePreview && !uploadingImage && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Product Preview" />
                    <button
                      type="button"
                      className="close-preview"
                      onClick={() => {
                        setImagePreview("");
                        setImageUrl("");
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

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
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || uploadingImage}
          >
            {loading
              ? "Saving..."
              : editingId
              ? "Update Featured Product"
              : "Add Featured Product"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
            disabled={loading}
          >
            {editingId ? "Cancel Edit" : "Clear Form"}
          </button>
        </div>
      </form>

      {featuredProducts.length > 0 && (
        <div className="featured-products-table">
          <h3 className="table-title">Featured Products</h3>
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>MRP</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {featuredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="table-image"
                    />
                  </td>
                  <td>{product.productName}</td>
                  <td>₹{product.price}</td>
                  <td>₹{product.originalPrice}</td>
                  <td>{product.ratings}</td>
                  <td>{product.reviewNo}</td>
                  <td>
                    <button
                      className={`status-btn ${
                        product.isActive ? "active" : "inactive"
                      }`}
                      onClick={() =>
                        handleToggleStatus(product.id, product.isActive)
                      }
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
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
  );
}
