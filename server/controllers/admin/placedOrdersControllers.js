const { supabase } = require("../../config/supabaseClient");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const COMPANY = {
  name: "Hani Industries",
  email: process.env.ADMIN_EMAIL,
  phone: "+91 98765 43210",
  address: "123 Industrial Area, Mumbai, Maharashtra 400001",
  website: "https://hani-industries.in",
};

const formatCurrency = (amount) => {
  return `₹${(amount / 100).toFixed(2)}`;
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};

/**
 * Get All Placed Orders with Filters
 */
const getPlacedOrders = async (req, res) => {
  try {
    const { status = "all" } = req.query;

    /* console.log("📦 Fetching placed orders with status:", status); */

    // Build query
    let query = supabase
      .from("orders")
      .select("*, order_items(*), payments(payment_method)")
      .order("created_at", { ascending: false });

    // Apply status filter
    if (status !== "all") {
      query = query.eq("delivery_status", status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Error fetching placed orders:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching orders",
        error: error.message,
      });
    }

    // Format orders for frontend
    const formattedOrders = orders.map((order) => {
      const totalItems = order.order_items
        ? order.order_items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;

      const paymentMethod =
        order.payments && order.payments.length > 0
          ? order.payments[0].payment_method
          : "N/A";

      return {
        id: order.order_id,
        orderId: order.order_id,
        customerName: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        paymentMode: paymentMethod,
        status: order.delivery_status || "Pending",
        subtotal: formatCurrency(order.subtotal || 0),
        taxAmount: formatCurrency(order.tax_amount || 0),
        shippingAmount: formatCurrency(order.shipping_amount || 0),
        totalAmount: formatCurrency(order.total_amount || 0),
        subtotalRaw: order.subtotal || 0,
        taxAmountRaw: order.tax_amount || 0,
        shippingAmountRaw: order.shipping_amount || 0,
        totalAmountRaw: order.total_amount || 0,
        address: `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_postal_code}`,
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingState: order.shipping_state,
        shippingPostalCode: order.shipping_postal_code,
        orderDate: order.created_at,
        expectedDelivery: order.estimated_delivery,
        dispatchMsgSent: order.dispatch_msg || false,
        products: order.order_items
          ? order.order_items.map((item) => ({
              name: item.product_name,
              quantity: item.quantity,
              price: formatCurrency(item.unit_price),
              total: formatCurrency(item.total_price),
              image: item.product_image,
              size: item.size,
            }))
          : [],
      };
    });

    /* console.log("✅ Fetched", formattedOrders.length, "orders"); */

    res.status(200).json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error in getPlacedOrders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Mark Order as Completed
 */
const markOrderCompleted = async (req, res) => {
  try {
    const { orderId } = req.params;

    /* console.log("✅ Marking order as completed:", orderId); */

    // Update order delivery_status to "Completed"
    const { data, error } = await supabase
      .from("orders")
      .update({
        delivery_status: "completed",
        actual_delivery: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .select();

    if (error) {
      console.error("Error marking order as completed:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating order status",
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* console.log("✅ Order marked as completed successfully"); */

    res.status(200).json({
      success: true,
      message: "Order marked as completed",
      data: data[0],
    });
  } catch (error) {
    console.error("Error in markOrderCompleted:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Cancel Order
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log("❌ Cancelling order:", orderId);

    // Check if order exists and get full details
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_id", orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is already completed or cancelled
    if (order.delivery_status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed order",
      });
    }

    if (order.delivery_status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Update order delivery_status to "cancelled"
    const { data, error } = await supabase
      .from("orders")
      .update({
        delivery_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .select();

    if (error) {
      console.error("Error cancelling order:", error);
      return res.status(500).json({
        success: false,
        message: "Error cancelling order",
        error: error.message,
      });
    }

    // Send cancellation email to customer
    try {
      const cancellationEmailHTML = getCancellationEmailTemplate({
        orderId: order.order_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        orderDate: order.created_at,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method || "N/A",
        items: order.order_items.map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          image: item.product_image,
        })),
      });

      const emailResponse = await resend.emails.send({
        from: `${COMPANY.name} <${process.env.RESEND_FROM_EMAIL}>`,
        to: [order.customer_email],
        subject: `Order Cancelled - ${order.order_id}`,
        html: cancellationEmailHTML,
      });

      if (emailResponse.error) {
        console.error("Error sending cancellation email:", emailResponse.error);
        // Don't fail the cancellation if email fails
      } else {
        console.log("✅ Cancellation email sent successfully");
      }
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
      // Don't fail the cancellation if email fails
    }

    console.log("✅ Order cancelled successfully");

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Send Dispatch Notification Email
 */
const sendDispatchNotification = async (req, res) => {
  try {
    const { orderId } = req.params;

    /* console.log("📧 Sending dispatch notification for order:", orderId); */

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if dispatch message already sent
    if (order.dispatch_msg) {
      return res.status(400).json({
        success: false,
        message: "Dispatch notification already sent for this order",
      });
    }

    // Generate dispatch email HTML
    const dispatchEmailHTML = getDispatchEmailTemplate({
      orderId: order.order_id,
      customerName: order.customer_name,
      orderDate: order.created_at,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingState: order.shipping_state,
      shippingPostalCode: order.shipping_postal_code,
      items: order.order_items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        image: item.product_image,
      })),
      totalAmount: order.total_amount,
    });

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: `${COMPANY.name} <${process.env.RESEND_FROM_EMAIL}>`,
      to: [order.customer_email],
      subject: `🚚 Your Order ${order.order_id} Has Been Dispatched!`,
      html: dispatchEmailHTML,
    });

    if (emailResponse.error) {
      console.error("Error sending dispatch email:", emailResponse.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send dispatch notification",
        error: emailResponse.error,
      });
    }

    // Update dispatch_msg to true
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        dispatch_msg: true,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("Error updating dispatch status:", updateError);
      return res.status(500).json({
        success: false,
        message: "Email sent but failed to update dispatch status",
        error: updateError.message,
      });
    }

    /* console.log("✅ Dispatch notification sent successfully"); */

    res.status(200).json({
      success: true,
      message: "Dispatch notification sent successfully",
      emailId: emailResponse.id,
    });
  } catch (error) {
    console.error("Error in sendDispatchNotification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Dispatch Email Template
 */
const getDispatchEmailTemplate = (orderData) => {
  const {
    orderId,
    customerName,
    orderDate,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPostalCode,
    items,
    totalAmount,
  } = orderData;

  const itemsList = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center;">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px;" />`
              : ""
          }
          <div>
            <p style="margin: 0; font-weight: 600; color: #1f2937;">${
              item.name
            }</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Qty: ${
              item.quantity
            }</p>
          </div>
        </div>
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Dispatched - ${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ${COMPANY.name}
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Premium Quality Industrial Products
              </p>
            </td>
          </tr>

          <!-- Dispatch Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #dbeafe; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🚚</span>
              </div>
              <h2 style="margin: 0; color: #2563eb; font-size: 24px; font-weight: 700;">
                Your Order is On Its Way!
              </h2>
              <p style="margin: 12px 0 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                Dear <strong style="color: #1f2937;">${customerName}</strong>,<br>
                Great news! Your order has been dispatched and will reach you soon.
              </p>
            </td>
          </tr>

          <!-- Order ID Badge -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <div style="display: inline-block; background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 16px 32px;">
                <p style="margin: 0; color: #0369a1; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Order Number
                </p>
                <p style="margin: 8px 0 0; color: #1a365d; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
                  ${orderId}
                </p>
              </div>
            </td>
          </tr>

          <!-- Delivery Timeline -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  📅 Expected Delivery
                </p>
                <p style="margin: 0; color: #1e3a8a; font-size: 20px; font-weight: 700;">
                  Within 24-48 Hours
                </p>
              </div>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                📦 Items Being Delivered
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; border-left: 4px solid #22c55e;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                  📍 Delivery Address
                </p>
                <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600;">
                  ${customerName}
                </p>
                <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                  ${shippingAddress}<br>
                  ${shippingCity}, ${shippingState} - ${shippingPostalCode}
                </p>
              </div>
            </td>
          </tr>

          <!-- Tracking Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fffbeb; border-radius: 12px; padding: 20px; border: 2px dashed #fbbf24;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6; text-align: center;">
                  💡 <strong>Tip:</strong> Please keep your phone handy for delivery updates. Our delivery partner will contact you before delivery.
                </p>
              </div>
            </td>
          </tr>

          <!-- Support Section -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                Need help with your order?
              </p>
              <a href="mailto:${
                COMPANY.email
              }" style="display: inline-block; background-color: #1a365d; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                📧 Contact Support
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px; text-align: center;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 700;">
                ${COMPANY.name}
              </p>
              <p style="margin: 0 0 16px; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                ${COMPANY.address}<br>
                📞 ${COMPANY.phone} | 📧 ${COMPANY.email}
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} ${
    COMPANY.name
  }. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

/**
 * Cancellation Email Template
 */
const getCancellationEmailTemplate = (orderData) => {
  const {
    orderId,
    customerName,
    customerEmail,
    orderDate,
    totalAmount,
    paymentMethod,
    items,
  } = orderData;

  const itemsList = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center;">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px;" />`
              : ""
          }
          <div>
            <p style="margin: 0; font-weight: 600; color: #1f2937;">${
              item.name
            }</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Qty: ${
              item.quantity
            }</p>
          </div>
        </div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #4b5563;">
        ${formatCurrency(item.price)}
      </td>
    </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancelled - ${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ${COMPANY.name}
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Premium Quality Industrial Products
              </p>
            </td>
          </tr>

          <!-- Cancel Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #fee2e2; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">❌</span>
              </div>
              <h2 style="margin: 0; color: #dc2626; font-size: 24px; font-weight: 700;">
                Order Cancelled
              </h2>
              <p style="margin: 12px 0 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                Dear <strong style="color: #1f2937;">${customerName}</strong>,<br>
                Your order has been cancelled as per your request.
              </p>
            </td>
          </tr>

          <!-- Order ID Badge -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <div style="display: inline-block; background-color: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; padding: 16px 32px;">
                <p style="margin: 0; color: #991b1b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Order Number
                </p>
                <p style="margin: 8px 0 0; color: #7f1d1d; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
                  ${orderId}
                </p>
              </div>
            </td>
          </tr>

          <!-- Cancellation Reason -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 24px; border-left: 4px solid #dc2626;">
                <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  📋 Cancellation Reason
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 16px; font-weight: 600; line-height: 1.6;">
                  As per your request
                </p>
              </div>
            </td>
          </tr>

          <!-- Order Date -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background-color: #f9fafb; border-radius: 12px; padding: 20px;">
                    <p style="margin: 0; font-size: 24px;">📅</p>
                    <p style="margin: 8px 0 4px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Order Date
                    </p>
                    <p style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                      ${formatDate(orderDate)}
                    </p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #fef2f2; border-radius: 12px; padding: 20px;">
                    <p style="margin: 0; font-size: 24px;">💳</p>
                    <p style="margin: 8px 0 4px; color: #991b1b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Payment Method
                    </p>
                    <p style="margin: 0; color: #7f1d1d; font-size: 14px; font-weight: 600;">
                      ${
                        paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Paid Online"
                      }
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cancelled Items -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                📦 Cancelled Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Product
                    </th>
                    <th style="padding: 14px 16px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Total -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #1f2937; border-radius: 12px; padding: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color: #ffffff; font-size: 16px; font-weight: 600;">
                      Order Total:
                    </td>
                    <td style="text-align: right; color: #fbbf24; font-size: 22px; font-weight: 700;">
                      ${formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Refund Information (if applicable) -->
          ${
            paymentMethod !== "cod"
              ? `
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #eff6ff; border-radius: 12px; padding: 24px; border: 1px solid #bfdbfe;">
                <h4 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; font-weight: 700;">
                  💰 Refund Information
                </h4>
                <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">
                  Since this was a prepaid order, your refund will be processed within <strong>5-7 business days</strong> to your original payment method. You will receive a confirmation email once the refund is initiated.
                </p>
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <!-- What's Next -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; border: 1px solid #bbf7d0;">
                <h4 style="margin: 0 0 16px; color: #166534; font-size: 16px; font-weight: 700;">
                  🛒 Continue Shopping
                </h4>
                <p style="margin: 0 0 16px; color: #1f2937; font-size: 14px; line-height: 1.6;">
                  We're sorry to see your order cancelled. If you faced any issues or need assistance, please don't hesitate to contact us. We're here to help!
                </p>
                <a href="${
                  COMPANY.website
                }" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Browse Products
                </a>
              </div>
            </td>
          </tr>

          <!-- Support Section -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                Have questions about the cancellation?
              </p>
              <a href="mailto:${
                COMPANY.email
              }" style="display: inline-block; background-color: #1a365d; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                📧 Contact Support
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px; text-align: center;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 700;">
                ${COMPANY.name}
              </p>
              <p style="margin: 0 0 16px; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                ${COMPANY.address}<br>
                📞 ${COMPANY.phone} | 📧 ${COMPANY.email}
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} ${
    COMPANY.name
  }. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

module.exports = {
  getPlacedOrders,
  markOrderCompleted,
  cancelOrder,
  sendDispatchNotification,
};
