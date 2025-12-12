const { supabase } = require("../../config/supabaseClient");

/**
 * GET /api/home/featured-products
 * Fetch featured products for the homepage with their variants
 * Returns products in the format expected by the FeaturedProducts component
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { category, limit } = req.query;

    // Build query - get active products with their active variants
    let query = supabase
      .from("products")
      .select(
        `
        id,
        product_id,
        name,
        category,
        description,
        rating,
        review_count,
        size_type,
        is_active,
        created_at,
        product_variants!inner (
          id,
          size,
          image_url,
          price,
          original_price,
          stock,
          discount_percent,
          is_active
        )
      `
      )
      .eq("is_active", true)
      .eq("product_variants.is_active", true)
      .order("created_at", { ascending: false });

    // Filter by category if provided
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Limit results if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch featured products error:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Transform data to match the UI format expected by ProductCard component
    const transformedProducts = data.map((product) => {
      // Get the first variant for default display (or lowest price variant)
      const variants = product.product_variants || [];
      const defaultVariant =
        variants.length > 0
          ? variants.reduce(
              (min, v) => (v.price < min.price ? v : min),
              variants[0]
            )
          : null;

      // Calculate discount percentage
      let discount = 0;
      if (
        defaultVariant &&
        defaultVariant.original_price &&
        defaultVariant.price
      ) {
        discount = Math.round(
          ((defaultVariant.original_price - defaultVariant.price) /
            defaultVariant.original_price) *
            100
        );
      }

      return {
        id: product.product_id,
        name: product.name,
        category: product.category,
        description: product.description,
        price: defaultVariant ? defaultVariant.price : 0,
        originalPrice: defaultVariant ? defaultVariant.original_price : 0,
        image: defaultVariant ? defaultVariant.image_url : null,
        rating: product.rating || 0,
        reviews: product.review_count || 0,
        discount: defaultVariant ? defaultVariant.discount_percent : discount,
        badge: discount > 0 ? "sale" : null,
        sizeType: product.size_type,
        stock: defaultVariant ? defaultVariant.stock : 0,
        variants: variants.map((v) => ({
          id: v.id,
          size: v.size,
          price: v.price,
          originalPrice: v.original_price,
          imageUrl: v.image_url,
          stock: v.stock,
          discount: v.discount_percent,
        })),
      };
    });

    res.json({
      success: true,
      count: transformedProducts.length,
      data: transformedProducts,
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/home/categories
 * Fetch all unique active categories
 */
exports.getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .eq("is_active", true);

    if (error) {
      console.error("Fetch categories error:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Get unique categories
    const categories = [...new Set(data.map((item) => item.category))].filter(
      Boolean
    );

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/home/product/:id
 * Fetch single product details for product detail page
 */
exports.getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Query by product_id (the custom ID like "HANI0001")
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        product_id,
        name,
        category,
        description,
        rating,
        review_count,
        size_type,
        is_active,
        created_at,
        product_variants (
          id,
          size,
          image_url,
          price,
          original_price,
          stock,
          discount_percent,
          tax_percent,
          is_active
        )
      `
      )
      .eq("product_id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Fetch product details error:", error);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get only active variants
    const activeVariants = (data.product_variants || []).filter(
      (v) => v.is_active
    );

    // Get the first variant for default display
    const defaultVariant =
      activeVariants.length > 0
        ? activeVariants.reduce(
            (min, v) => (v.price < min.price ? v : min),
            activeVariants[0]
          )
        : null;

    // Calculate discount percentage
    let discount = 0;
    if (
      defaultVariant &&
      defaultVariant.original_price &&
      defaultVariant.price
    ) {
      discount = Math.round(
        ((defaultVariant.original_price - defaultVariant.price) /
          defaultVariant.original_price) *
          100
      );
    }

    // Transform to UI format
    const productData = {
      id: data.product_id,
      name: data.name,
      category: data.category,
      description: data.description,
      price: defaultVariant ? defaultVariant.price : 0,
      originalPrice: defaultVariant ? defaultVariant.original_price : 0,
      image: defaultVariant ? defaultVariant.image_url : null,
      rating: data.rating || 0,
      reviews: data.review_count || 0,
      discount: defaultVariant ? defaultVariant.discount_percent : discount,
      badge: discount > 0 ? "sale" : null,
      sizeType: data.size_type,
      stock: defaultVariant ? defaultVariant.stock : 0,
      taxPercent: defaultVariant ? defaultVariant.tax_percent : 18,
      variants: activeVariants.map((v) => ({
        id: v.id,
        size: v.size,
        price: v.price,
        originalPrice: v.original_price,
        imageUrl: v.image_url,
        stock: v.stock,
        discount: v.discount_percent,
        taxPercent: v.tax_percent,
      })),
    };

    res.json({
      success: true,
      data: productData,
    });
  } catch (error) {
    console.error("Get product details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/home/products
 * Fetch all active products (for collection page)
 * Supports pagination and filtering
 */
exports.getAllActiveProducts = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 100,
      sortBy = "created_at",
      sortOrder = "desc",
      minPrice,
      maxPrice,
    } = req.query;

    // Build base query - fetch all products first, then sort/filter/paginate
    let query = supabase
      .from("products")
      .select(
        `
        id,
        product_id,
        name,
        category,
        description,
        rating,
        review_count,
        size_type,
        is_active,
        created_at,
        product_variants!inner (
          id,
          size,
          image_url,
          price,
          original_price,
          stock,
          discount_percent,
          is_active
        )
      `
      )
      .eq("is_active", true)
      .eq("product_variants.is_active", true);

    // Filter by category if provided
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Only apply DB sorting for created_at (other sorting done after transformation)
    if (sortBy === "created_at") {
      const ascending = sortOrder === "asc";
      query = query.order("created_at", { ascending });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch all products error:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Transform data to match the UI format
    let transformedProducts = data.map((product) => {
      const variants = product.product_variants || [];
      const defaultVariant =
        variants.length > 0
          ? variants.reduce(
              (min, v) => (v.price < min.price ? v : min),
              variants[0]
            )
          : null;

      let discount = 0;
      if (
        defaultVariant &&
        defaultVariant.original_price &&
        defaultVariant.price
      ) {
        discount = Math.round(
          ((defaultVariant.original_price - defaultVariant.price) /
            defaultVariant.original_price) *
            100
        );
      }

      return {
        id: product.product_id,
        name: product.name,
        category: product.category,
        description: product.description,
        price: defaultVariant ? parseFloat(defaultVariant.price) : 0,
        originalPrice: defaultVariant
          ? parseFloat(defaultVariant.original_price)
          : 0,
        image: defaultVariant ? defaultVariant.image_url : null,
        rating: parseFloat(product.rating) || 0,
        reviews: product.review_count || 0,
        discount: defaultVariant
          ? parseFloat(defaultVariant.discount_percent)
          : discount,
        badge: discount > 0 ? "sale" : null,
        sizeType: product.size_type,
        stock: defaultVariant ? defaultVariant.stock : 0,
        createdAt: product.created_at,
        variants: variants.map((v) => ({
          id: v.id,
          size: v.size,
          price: parseFloat(v.price),
          originalPrice: parseFloat(v.original_price),
          imageUrl: v.image_url,
          stock: v.stock,
          discount: parseFloat(v.discount_percent),
        })),
      };
    });

    // Filter by price range
    if (minPrice) {
      transformedProducts = transformedProducts.filter(
        (p) => p.price >= parseFloat(minPrice)
      );
    }
    if (maxPrice) {
      transformedProducts = transformedProducts.filter(
        (p) => p.price <= parseFloat(maxPrice)
      );
    }

    // Apply sorting after transformation (for price and rating)
    switch (sortBy) {
      case "price":
        if (sortOrder === "asc") {
          transformedProducts.sort((a, b) => a.price - b.price);
        } else {
          transformedProducts.sort((a, b) => b.price - a.price);
        }
        break;
      case "rating":
        if (sortOrder === "asc") {
          transformedProducts.sort((a, b) => a.rating - b.rating);
        } else {
          transformedProducts.sort((a, b) => b.rating - a.rating);
        }
        break;
      case "created_at":
      default:
        // Already sorted by DB query or default order
        break;
    }

    // Apply pagination after all filtering and sorting
    const totalCount = transformedProducts.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    const paginatedProducts = transformedProducts.slice(
      offset,
      offset + limitNum
    );

    res.json({
      success: true,
      count: paginatedProducts.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: paginatedProducts,
    });
  } catch (error) {
    console.error("Get all active products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/home/related-products/:id
 * Fetch related products based on category
 */
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    // First, get the current product's category
    const { data: currentProduct, error: productError } = await supabase
      .from("products")
      .select("category")
      .eq("product_id", id)
      .single();

    if (productError || !currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get related products from same category, excluding current product
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        product_id,
        name,
        category,
        rating,
        review_count,
        product_variants!inner (
          id,
          size,
          image_url,
          price,
          original_price,
          stock,
          discount_percent,
          is_active
        )
      `
      )
      .eq("category", currentProduct.category)
      .eq("is_active", true)
      .eq("product_variants.is_active", true)
      .neq("product_id", id)
      .limit(parseInt(limit));

    if (error) {
      console.error("Fetch related products error:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Transform data
    const transformedProducts = data.map((product) => {
      const variants = product.product_variants || [];
      const defaultVariant =
        variants.length > 0
          ? variants.reduce(
              (min, v) => (v.price < min.price ? v : min),
              variants[0]
            )
          : null;

      let discount = 0;
      if (
        defaultVariant &&
        defaultVariant.original_price &&
        defaultVariant.price
      ) {
        discount = Math.round(
          ((defaultVariant.original_price - defaultVariant.price) /
            defaultVariant.original_price) *
            100
        );
      }

      return {
        id: product.product_id,
        name: product.name,
        category: product.category,
        price: defaultVariant ? defaultVariant.price : 0,
        originalPrice: defaultVariant ? defaultVariant.original_price : 0,
        image: defaultVariant ? defaultVariant.image_url : null,
        rating: product.rating || 0,
        reviews: product.review_count || 0,
        discount: defaultVariant ? defaultVariant.discount_percent : discount,
        badge: discount > 0 ? "sale" : null,
      };
    });

    res.json({
      success: true,
      count: transformedProducts.length,
      data: transformedProducts,
    });
  } catch (error) {
    console.error("Get related products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/home/search
 * Search products by name, category, or description
 * Returns matching products and category suggestions
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        products: [],
        categories: [],
      });
    }

    const searchTerm = q.trim().toLowerCase();

    // Define available categories with display names
    const availableCategories = [
      {
        value: "oils",
        label: "Oils",
        keywords: ["oil", "oils", "lamp", "edible", "cooking"],
      },
      {
        value: "cleaners",
        label: "Cleaners",
        keywords: [
          "cleaner",
          "cleaners",
          "floor",
          "bathroom",
          "detergent",
          "wash",
        ],
      },
      {
        value: "appalam",
        label: "Appalam",
        keywords: ["appalam", "papad", "papadum"],
      },
    ];

    // Find matching categories
    const matchingCategories = availableCategories.filter((cat) => {
      return (
        cat.value.includes(searchTerm) ||
        cat.label.toLowerCase().includes(searchTerm) ||
        cat.keywords.some(
          (keyword) =>
            keyword.includes(searchTerm) || searchTerm.includes(keyword)
        )
      );
    });

    // Search products by name (using ilike for case-insensitive search)
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        product_id,
        name,
        category,
        description,
        rating,
        review_count,
        product_variants!inner (
          id,
          size,
          image_url,
          price,
          original_price,
          stock,
          discount_percent,
          is_active
        )
      `
      )
      .eq("is_active", true)
      .eq("product_variants.is_active", true)
      .or(
        `name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      )
      .limit(parseInt(limit));

    if (error) {
      console.error("Search products error:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Transform products data
    const transformedProducts = data.map((product) => {
      const variants = product.product_variants || [];
      const defaultVariant =
        variants.length > 0
          ? variants.reduce(
              (min, v) => (v.price < min.price ? v : min),
              variants[0]
            )
          : null;

      let discount = 0;
      if (
        defaultVariant &&
        defaultVariant.original_price &&
        defaultVariant.price
      ) {
        discount = Math.round(
          ((defaultVariant.original_price - defaultVariant.price) /
            defaultVariant.original_price) *
            100
        );
      }

      return {
        id: product.product_id,
        name: product.name,
        category: product.category,
        description: product.description,
        price: defaultVariant ? parseFloat(defaultVariant.price) : 0,
        originalPrice: defaultVariant
          ? parseFloat(defaultVariant.original_price)
          : 0,
        image: defaultVariant ? defaultVariant.image_url : null,
        rating: parseFloat(product.rating) || 0,
        reviews: product.review_count || 0,
        discount: discount,
      };
    });

    res.json({
      success: true,
      query: q,
      products: transformedProducts,
      categories: matchingCategories,
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
