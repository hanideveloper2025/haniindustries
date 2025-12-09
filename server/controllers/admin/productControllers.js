const { supabase } = require("../../config/supabaseClient");
const { cloudinary } = require("../../config/cloudinaryConfig");

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "Hani-Industries/products",
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

// UPLOAD - Upload single image to Cloudinary (immediate upload on file select)
exports.uploadSingleImage = async (req, res) => {
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

// CREATE - Add new product with variants (accepts pre-uploaded image URLs)
exports.createProduct = async (req, res) => {
  try {
    const {
      productId,
      productName,
      category,
      ratings,
      description,
      reviewNo,
      sizeType,
      sizes,
    } = req.body;

    // Validate required fields
    if (!productId || !productName || !category || !sizeType) {
      return res.status(400).json({
        success: false,
        message: "Product ID, name, category, and size type are required",
      });
    }

    // Parse sizes if it's a string
    let parsedSizes = sizes;
    if (typeof sizes === "string") {
      parsedSizes = JSON.parse(sizes);
    }

    // 1. Insert product into products table
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        product_id: productId,
        name: productName,
        category: category,
        rating: parseFloat(ratings) || 0,
        description: description || "",
        review_count: parseInt(reviewNo) || 0,
        size_type: sizeType,
        is_active: true,
      })
      .select()
      .single();

    if (productError) {
      console.error("Product insert error:", productError);
      return res.status(400).json({
        success: false,
        message: productError.message,
      });
    }

    // 2. Create variants with pre-uploaded image URLs
    const variants = [];
    for (let i = 0; i < parsedSizes.length; i++) {
      const sizeData = parsedSizes[i];
      // Image URL is now sent directly from frontend (pre-uploaded to Cloudinary)
      const imageUrl = sizeData.imageUrl || null;

      variants.push({
        product_id: product.product_id, // Use product_id (varchar like "PRD001") - links to products.product_id
        size: sizeData.size,
        image_url: imageUrl,
        price: parseFloat(sizeData.price) || 0,
        original_price: parseFloat(sizeData.originalPrice) || null,
        stock: parseInt(sizeData.stock) || 0,
        discount_percent: parseFloat(sizeData.discount) || 0,
        tax_percent: parseFloat(sizeData.tax) || 18,
        is_active: true,
      });
    }

    // 3. Insert variants
    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .insert(variants)
      .select();

    if (variantsError) {
      // Rollback: delete the product if variants fail
      await supabase.from("products").delete().eq("id", product.id);
      console.error("Variants insert error:", variantsError);
      return res.status(400).json({
        success: false,
        message: variantsError.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        product,
        variants: variantsData,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// READ - Get all products with variants
exports.getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// READ - Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE - Update product with variants (accepts pre-uploaded image URLs)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // <-- THIS IS products.id (UUID)
    const {
      productName,
      category,
      ratings,
      description,
      reviewNo,
      sizeType,
      sizes,
    } = req.body;

    // Parse sizes if string
    let parsedSizes = sizes;
    if (typeof sizes === "string") {
      parsedSizes = JSON.parse(sizes);
    }

    // -----------------------------------------------------------
    // 1. FETCH EXISTING PRODUCT (IMPORTANT)
    // -----------------------------------------------------------
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -----------------------------------------------------------
    // 2. UPDATE PRODUCT DATA
    // -----------------------------------------------------------
    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: productName,
        category: category,
        rating: parseFloat(ratings) || 0,
        description: description || "",
        review_count: parseInt(reviewNo) || 0,
        size_type: sizeType,
      })
      .eq("id", id);

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message,
      });
    }

    // -----------------------------------------------------------
    // 3. DELETE OLD VARIANTS
    // Use existingProduct.product_id (varchar like "PRD001") since product_variants.product_id links to products.product_id
    // -----------------------------------------------------------
    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", existingProduct.product_id);

    // -----------------------------------------------------------
    // 4. CREATE NEW VARIANTS USING product_id (varchar like "PRD001")
    // -----------------------------------------------------------
    const variants = [];

    for (let i = 0; i < parsedSizes.length; i++) {
      const sizeData = parsedSizes[i];
      const imageUrl = sizeData.imageUrl || null;

      variants.push({
        product_id: existingProduct.product_id, // Use product_id (varchar like "PRD001") - links to products.product_id
        size: sizeData.size,
        image_url: imageUrl,
        price: parseFloat(sizeData.price) || 0,
        original_price: parseFloat(sizeData.originalPrice) || null,
        stock: parseInt(sizeData.stock) || 0,
        discount_percent: parseFloat(sizeData.discount) || 0,
        tax_percent: parseFloat(sizeData.tax) || 18,
        is_active: true,
      });
    }

    // -----------------------------------------------------------
    // 5. INSERT NEW VARIANTS
    // -----------------------------------------------------------
    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .insert(variants)
      .select();

    if (variantsError) {
      return res.status(400).json({
        success: false,
        message: variantsError.message,
      });
    }

    // -----------------------------------------------------------
    // 6. RETURN UPDATED PRODUCT + VARIANTS
    // -----------------------------------------------------------
    const { data: updatedProduct } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (*)
      `
      )
      .eq("id", id)
      .single();

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// DELETE - Delete product (variants auto-delete via CASCADE)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Get product with variants first to delete images from Cloudinary
    const { data: product } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (image_url)
      `
      )
      .eq("id", id)
      .single();

    if (product && product.product_variants) {
      // Delete images from Cloudinary
      for (const variant of product.product_variants) {
        if (variant.image_url) {
          try {
            // Extract public_id from URL
            const urlParts = variant.image_url.split("/");
            const publicIdWithExt = urlParts.slice(-2).join("/");
            const publicId = publicIdWithExt.split(".")[0];
            await cloudinary.uploader.destroy(
              `Hani-Industries/products/${publicId.split("/").pop()}`
            );
          } catch (deleteError) {
            console.error("Cloudinary delete error:", deleteError);
          }
        }
      }
    }

    // Delete product (variants auto-delete due to CASCADE)
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Generate unique product ID
exports.generateProductId = async (req, res) => {
  try {
    // Get the latest product to determine next ID
    const { data, error } = await supabase
      .from("products")
      .select("product_id")
      .order("created_at", { ascending: false })
      .limit(1);

    let nextId = 1;
    if (data && data.length > 0) {
      const lastId = data[0].product_id;
      const numPart = parseInt(lastId.replace("PRD", ""));
      if (!isNaN(numPart)) {
        nextId = numPart + 1;
      }
    }

    const productId = `PRD${nextId.toString().padStart(4, "0")}`;

    res.json({
      success: true,
      productId,
    });
  } catch (error) {
    console.error("Generate ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE VARIANT - Delete a single variant from a product
// If it's the last variant, delete the entire product
exports.deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    // 1. Get the product with all its variants
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (*)
      `
      )
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Find the variant to delete
    const variantToDelete = product.product_variants.find(
      (v) => v.id === variantId
    );

    if (!variantToDelete) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // 3. Check if this is the last variant
    const isLastVariant = product.product_variants.length === 1;

    // 4. Delete image from Cloudinary if exists
    if (variantToDelete.image_url) {
      try {
        const urlParts = variantToDelete.image_url.split("/");
        const publicIdWithExt = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExt.split(".")[0];
        await cloudinary.uploader.destroy(
          `Hani-Industries/products/${publicId.split("/").pop()}`
        );
      } catch (deleteError) {
        console.error("Cloudinary delete error:", deleteError);
      }
    }

    if (isLastVariant) {
      // 5a. If last variant, delete the entire product (CASCADE will delete variant)
      const { error: deleteProductError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (deleteProductError) {
        return res.status(400).json({
          success: false,
          message: deleteProductError.message,
        });
      }

      res.json({
        success: true,
        message: "Last variant deleted. Product has been removed.",
        productDeleted: true,
      });
    } else {
      // 5b. Delete only the variant
      const { error: deleteVariantError } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", variantId);

      if (deleteVariantError) {
        return res.status(400).json({
          success: false,
          message: deleteVariantError.message,
        });
      }

      res.json({
        success: true,
        message: "Variant deleted successfully",
        productDeleted: false,
        remainingVariants: product.product_variants.length - 1,
      });
    }
  } catch (error) {
    console.error("Delete variant error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
