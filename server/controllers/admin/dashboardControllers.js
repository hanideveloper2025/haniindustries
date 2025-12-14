const { supabase } = require("../../config/supabaseClient");

/**
 * Get Dashboard Statistics
 * Returns total products, total orders, and revenue
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total products count from products table
    const { count: productsCount, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (productsError) {
      console.error("Error fetching products count:", productsError);
      return res.status(500).json({
        success: false,
        message: "Error fetching products count",
        error: productsError.message,
      });
    }

    // Get total orders count (excluding cancelled orders)
    const { count: ordersCount, error: ordersError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .neq("delivery_status", "cancelled");

    if (ordersError) {
      console.error("Error fetching orders count:", ordersError);
      return res.status(500).json({
        success: false,
        message: "Error fetching orders count",
        error: ordersError.message,
      });
    }

    // Get total sold amount (sum of all completed orders subtotal, excluding cancelled)
    const { data: soldData, error: soldError } = await supabase
      .from("orders")
      .select("subtotal")
      .eq("delivery_status", "completed");

    if (soldError) {
      console.error("Error fetching sold amount:", soldError);
      return res.status(500).json({
        success: false,
        message: "Error fetching sold amount",
        error: soldError.message,
      });
    }

    const totalSoldAmount = soldData.reduce(
      (sum, order) => sum + (order.subtotal || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalSoldAmount: totalSoldAmount || 0,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get Recent Orders with Filters and Pagination
 * Supports filtering by status, payment, date range, time range, and search
 */
const getRecentOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = "",
      payment = "",
      search = "",
      dateFrom = "",
      dateTo = "",
      timeFrom = "",
      timeTo = "",
    } = req.query;

    /* console.log("📊 Dashboard Orders Request:", {
      page,
      limit,
      status,
      payment,
      search,
    });
 */
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Start building the query - left join with payments table to handle orders without payments
    let query = supabase
      .from("orders")
      .select("*, order_items(*), payments(payment_method)", {
        count: "exact",
      });

    // Apply status filter using delivery_status
    if (status) {
      query = query.eq("delivery_status", status);
    }

    // Apply search filter (customer name, email, or order_id)
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,order_id.ilike.%${search}%`
      );
    }

    // Apply date range filter
    if (dateFrom) {
      query = query.gte("created_at", new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      // Add 1 day to include the entire dateTo day
      const dateToEnd = new Date(dateTo);
      dateToEnd.setDate(dateToEnd.getDate() + 1);
      query = query.lt("created_at", dateToEnd.toISOString());
    }

    // Apply time range filter (hours comparison)
    if (timeFrom || timeTo) {
      query = query.not("created_at", "is", null);
    }

    // Order by created_at descending (most recent first)
    query = query.order("created_at", { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: orders, error, count } = await query;

    /* console.log("📦 Orders fetched:", { count, ordersLength: orders?.length }); */

    if (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching orders",
        error: error.message,
      });
    }

    // Filter by time if time filters are provided
    let filteredOrders = orders || [];

    // Apply payment filter (filter after fetch since payment is in related table)
    if (payment) {
      filteredOrders = filteredOrders.filter((order) => {
        const paymentMethod =
          order.payments && order.payments.length > 0
            ? order.payments[0].payment_method
            : null;
        return (
          paymentMethod && paymentMethod.toLowerCase() === payment.toLowerCase()
        );
      });
    }

    if (timeFrom || timeTo) {
      filteredOrders = filteredOrders.filter((order) => {
        const orderTime = new Date(order.created_at);
        const hours = orderTime.getHours();
        const minutes = orderTime.getMinutes();
        const orderTimeString = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        let matchesTimeFrom = true;
        let matchesTimeTo = true;

        if (timeFrom) {
          matchesTimeFrom = orderTimeString >= timeFrom;
        }
        if (timeTo) {
          matchesTimeTo = orderTimeString <= timeTo;
        }

        return matchesTimeFrom && matchesTimeTo;
      });
    }

    // Format orders for frontend
    const formattedOrders = filteredOrders.map((order) => {
      const orderDate = new Date(order.created_at);
      const itemsCount = order.order_items ? order.order_items.length : 0;
      const totalItems = order.order_items
        ? order.order_items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;

      // Get payment method from payments table
      const paymentMethod =
        order.payments && order.payments.length > 0
          ? order.payments[0].payment_method
          : "N/A";

      // Handle amount - amounts are stored as integers (e.g., 36000 for ₹360.00)
      // Divide by 100 to get actual amount
      const actualAmount = order.total_amount ? order.total_amount / 100 : 0;

      return {
        id: order.order_id,
        customer: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        date: orderDate.toISOString().split("T")[0],
        time: `${orderDate.getHours().toString().padStart(2, "0")}:${orderDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
        items: `${totalItems} item${totalItems !== 1 ? "s" : ""}`,
        amount: `₹${actualAmount.toFixed(2)}`,
        payment: paymentMethod,
        status: order.delivery_status || order.order_status || "Pending",
        address: {
          shipping: order.shipping_address,
          city: order.shipping_city,
          state: order.shipping_state,
          postalCode: order.shipping_postal_code,
        },
        orderItems: order.order_items,
      };
    });

    /* console.log("✅ Sending response with", formattedOrders.length, "orders"); */

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil((filteredOrders.length || 0) / limitNum),
          totalOrders: filteredOrders.length || 0,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Error in getRecentOrders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentOrders,
};
