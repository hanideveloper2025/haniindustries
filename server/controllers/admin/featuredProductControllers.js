const { supabase } = require("../../config/supabaseClient");
const { cloudinary } = require("../../config/cloudinaryConfig");

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "Hani-Industries/featured-products",
        resource_type: "image",
        transformation: [{ width: 800, crop: "limit" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    // Extract public_id from URL
    const urlParts = imageUrl.split("/");
    const folderIndex = urlParts.findIndex(
      (part) => part === "Hani-Industries"
    );
    if (folderIndex !== -1) {
      const publicIdWithExtension = urlParts.slice(folderIndex).join("/");
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};

// UPLOAD - Upload single image to Cloudinary (immediate upload on file select)
exports.uploadFeaturedImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file);

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};

// CREATE - Add new featured product
exports.createFeaturedProduct = async (req, res) => {
  try {
    const {
      productName,
      imageUrl,
      price,
      originalPrice,
      rating,
      reviewCount,
      discountPercent,
    } = req.body;

    // Validation
    if (!productName || !imageUrl || !price || !originalPrice) {
      return res.status(400).json({
        success: false,
        message: "Product name, image, price, and original price are required",
      });
    }

    // Get max display_order for new product
    const { data: maxOrderData } = await supabase
      .from("featured_products")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const newDisplayOrder = (maxOrderData?.display_order || 0) + 1;

    // Insert featured product
    const { data: featuredProduct, error } = await supabase
      .from("featured_products")
      .insert({
        product_name: productName,
        image_url: imageUrl,
        price: parseFloat(price),
        original_price: parseFloat(originalPrice),
        rating: rating ? parseFloat(rating) : 0,
        review_count: reviewCount ? parseInt(reviewCount) : 0,
        discount_percent: discountPercent ? parseInt(discountPercent) : 0,
        display_order: newDisplayOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create featured product",
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Featured product created successfully",
      data: featuredProduct,
    });
  } catch (error) {
    console.error("Create featured product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// READ - Get all featured products
exports.getAllFeaturedProducts = async (req, res) => {
  try {
    const { data: featuredProducts, error } = await supabase
      .from("featured_products")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch featured products",
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: featuredProducts,
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// READ - Get active featured products (for public/homepage)
exports.getActiveFeaturedProducts = async (req, res) => {
  try {
    const { data: featuredProducts, error } = await supabase
      .from("featured_products")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch featured products",
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: featuredProducts,
    });
  } catch (error) {
    console.error("Get active featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// READ - Get single featured product by ID
exports.getFeaturedProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: featuredProduct, error } = await supabase
      .from("featured_products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(404).json({
        success: false,
        message: "Featured product not found",
      });
    }

    res.json({
      success: true,
      data: featuredProduct,
    });
  } catch (error) {
    console.error("Get featured product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE - Update featured product
exports.updateFeaturedProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productName,
      imageUrl,
      price,
      originalPrice,
      rating,
      reviewCount,
      discountPercent,
      isActive,
      displayOrder,
    } = req.body;

    // Get existing product to check for image change
    const { data: existingProduct, error: fetchError } = await supabase
      .from("featured_products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Featured product not found",
      });
    }

    // If image URL changed, delete old image from Cloudinary
    if (imageUrl && imageUrl !== existingProduct.image_url) {
      await deleteFromCloudinary(existingProduct.image_url);
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (productName !== undefined) updateData.product_name = productName;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (originalPrice !== undefined)
      updateData.original_price = parseFloat(originalPrice);
    if (rating !== undefined) updateData.rating = parseFloat(rating);
    if (reviewCount !== undefined)
      updateData.review_count = parseInt(reviewCount);
    if (discountPercent !== undefined)
      updateData.discount_percent = parseInt(discountPercent);
    if (isActive !== undefined) updateData.is_active = isActive;
    if (displayOrder !== undefined)
      updateData.display_order = parseInt(displayOrder);

    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from("featured_products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to update featured product",
        error: updateError.message,
      });
    }

    res.json({
      success: true,
      message: "Featured product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update featured product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE - Delete featured product
exports.deleteFeaturedProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the product to delete its image
    const { data: existingProduct, error: fetchError } = await supabase
      .from("featured_products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Featured product not found",
      });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("featured_products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: "Failed to delete featured product",
        error: deleteError.message,
      });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(existingProduct.image_url);

    res.json({
      success: true,
      message: "Featured product deleted successfully",
    });
  } catch (error) {
    console.error("Delete featured product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// TOGGLE - Toggle featured product active status
exports.toggleFeaturedProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const { data: existingProduct, error: fetchError } = await supabase
      .from("featured_products")
      .select("is_active")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Featured product not found",
      });
    }

    // Toggle status
    const { data: updatedProduct, error: updateError } = await supabase
      .from("featured_products")
      .update({
        is_active: !existingProduct.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to toggle status",
        error: updateError.message,
      });
    }

    res.json({
      success: true,
      message: `Featured product ${
        updatedProduct.is_active ? "activated" : "deactivated"
      } successfully`,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
