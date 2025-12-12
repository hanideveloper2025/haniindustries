const { Resend } = require("resend");

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Company details
const COMPANY = {
  name: "Hani Industries",
  email: process.env.ADMIN_EMAIL,
  phone: "+91 98765 43210",
  address: "123 Industrial Area, Mumbai, Maharashtra 400001",
  website: "https://hani-industries.in",
  logo: "https://hani-industries.in/logo.png",
};

// Format currency
const formatCurrency = (amount) => {
  return `₹${(amount / 100).toFixed(2)}`;
};

// Format date
const formatDate = (dateString) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};

// Generate order items HTML
const generateOrderItemsHTML = (items) => {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center;">
            <img 
              src="${
                item.image || "https://via.placeholder.com/60x60?text=Product"
              }" 
              alt="${item.name}" 
              style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;"
            />
            <div>
              <p style="margin: 0; font-weight: 600; color: #1f2937;">${
                item.name
              }</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Size: ${
                item.size
              }</p>
            </div>
          </div>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">
          ${item.quantity}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">
          ${formatCurrency(item.unitPrice)}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937;">
          ${formatCurrency(item.totalPrice)}
        </td>
      </tr>
    `
    )
    .join("");
};

// =====================================================
// CUSTOMER ORDER CONFIRMATION EMAIL TEMPLATE
// =====================================================
const getCustomerEmailTemplate = (orderData) => {
  const {
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPostalCode,
    items,
    subtotal,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    estimatedDelivery,
    orderDate,
  } = orderData;

  const paymentLabel =
    paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online";
  const paymentIcon = paymentMethod === "cod" ? "💵" : "✅";
  const paymentColor = paymentMethod === "cod" ? "#f59e0b" : "#10b981";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  
  <!-- Main Container -->
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

          <!-- Success Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #dcfce7; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; line-height: 80px;">✅</span>
              </div>
              <h2 style="margin: 0; color: #059669; font-size: 24px; font-weight: 700;">
                Order Confirmed!
              </h2>
              <p style="margin: 12px 0 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                Thank you for your order, <strong style="color: #1f2937;">${customerName}</strong>!<br>
                We're excited to get your items on the way.
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
                <p style="margin: 8px 0 0; color: #1a365d; font-size: 28px; font-weight: 700; letter-spacing: 2px;">
                  ${orderId}
                </p>
              </div>
            </td>
          </tr>

          <!-- Order Info Cards -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Order Date -->
                  <td width="48%" style="background-color: #f0f9ff; border-radius: 12px; padding: 20px; vertical-align: top;">
                    <p style="margin: 0; font-size: 24px;">📅</p>
                    <p style="margin: 8px 0 4px; color: #0369a1; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Order Date
                    </p>
                    <p style="margin: 0; color: #1a365d; font-size: 16px; font-weight: 700;">
                      ${formatDate(orderDate)}
                    </p>
                  </td>
                  <td width="4%"></td>
                  <!-- Payment Status -->
                  <td width="48%" style="background-color: ${
                    paymentMethod === "cod" ? "#fef3c7" : "#dcfce7"
                  }; border-radius: 12px; padding: 20px; vertical-align: top;">
                    <p style="margin: 0; font-size: 24px;">${paymentIcon}</p>
                    <p style="margin: 8px 0 4px; color: ${
                      paymentMethod === "cod" ? "#92400e" : "#166534"
                    }; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Payment
                    </p>
                    <p style="margin: 0; color: ${
                      paymentMethod === "cod" ? "#78350f" : "#14532d"
                    }; font-size: 16px; font-weight: 700;">
                      ${paymentLabel}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items Section -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                📋 Order Details
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Product
                    </th>
                    <th style="padding: 14px 16px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Qty
                    </th>
                    <th style="padding: 14px 16px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Price
                    </th>
                    <th style="padding: 14px 16px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${generateOrderItemsHTML(items)}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Price Summary -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Subtotal</td>
                        <td style="text-align: right; color: #1f2937; font-size: 14px;">${formatCurrency(
                          subtotal
                        )}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Tax (18% GST)</td>
                        <td style="text-align: right; color: #1f2937; font-size: 14px;">${formatCurrency(
                          taxAmount
                        )}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Shipping</td>
                        <td style="text-align: right; color: ${
                          shippingAmount === 0 ? "#059669" : "#1f2937"
                        }; font-size: 14px; font-weight: ${
    shippingAmount === 0 ? "600" : "400"
  };">
                          ${
                            shippingAmount === 0
                              ? "FREE"
                              : formatCurrency(shippingAmount)
                          }
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px 8px; border-top: 2px solid #e5e7eb; margin-top: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #1f2937; font-size: 18px; font-weight: 700;">Total Amount</td>
                        <td style="text-align: right; color: #1a365d; font-size: 24px; font-weight: 700;">${formatCurrency(
                          totalAmount
                        )}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      📍 Shipping Address
                    </p>
                    <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600;">
                      ${customerName}
                    </p>
                    <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                      ${shippingAddress}<br>
                      ${shippingCity}, ${shippingState} - ${shippingPostalCode}<br>
                      📞 ${customerPhone}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next Section -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #eff6ff; border-radius: 12px; padding: 24px; border: 1px solid #bfdbfe;">
                <h4 style="margin: 0 0 16px; color: #1e40af; font-size: 16px; font-weight: 700;">
                  🚀 What happens next?
                </h4>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 28px; height: 28px; background-color: #2563eb; border-radius: 50%; text-align: center; color: white; font-size: 12px; font-weight: 700; line-height: 28px;">1</td>
                          <td style="padding-left: 12px; color: #1f2937; font-size: 14px;">We're preparing your order for shipment</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 28px; height: 28px; background-color: #2563eb; border-radius: 50%; text-align: center; color: white; font-size: 12px; font-weight: 700; line-height: 28px;">2</td>
                          <td style="padding-left: 12px; color: #1f2937; font-size: 14px;">You'll receive tracking details via email</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 28px; height: 28px; background-color: #2563eb; border-radius: 50%; text-align: center; color: white; font-size: 12px; font-weight: 700; line-height: 28px;">3</td>
                          <td style="padding-left: 12px; color: #1f2937; font-size: 14px;">Your order will be delivered to your doorstep soon!</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Support Section -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                Questions about your order?
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

// =====================================================
// ADMIN NEW ORDER NOTIFICATION EMAIL TEMPLATE
// =====================================================
const getAdminEmailTemplate = (orderData) => {
  const {
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPostalCode,
    items,
    subtotal,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    estimatedDelivery,
    orderDate,
  } = orderData;

  const paymentLabel =
    paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online";
  const paymentBadgeColor = paymentMethod === "cod" ? "#f59e0b" : "#10b981";
  const paymentBadgeBg = paymentMethod === "cod" ? "#fef3c7" : "#dcfce7";

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order - ${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Admin Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 30px; text-align: center;">
              <p style="margin: 0; font-size: 32px;">🔔</p>
              <h1 style="margin: 12px 0 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                New Order Received!
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                ${COMPANY.name} - Admin Notification
              </p>
            </td>
          </tr>

          <!-- Quick Stats -->
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Order ID -->
                  <td width="32%" style="background-color: #f0f9ff; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #bae6fd;">
                    <p style="margin: 0; color: #0369a1; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Order ID</p>
                    <p style="margin: 8px 0 0; color: #1a365d; font-size: 18px; font-weight: 700;">${orderId}</p>
                  </td>
                  <td width="2%"></td>
                  <!-- Total Amount -->
                  <td width="32%" style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #bbf7d0;">
                    <p style="margin: 0; color: #166534; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total Amount</p>
                    <p style="margin: 8px 0 0; color: #14532d; font-size: 18px; font-weight: 700;">${formatCurrency(
                      totalAmount
                    )}</p>
                  </td>
                  <td width="2%"></td>
                  <!-- Items -->
                  <td width="32%" style="background-color: #fef3c7; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #fde68a;">
                    <p style="margin: 0; color: #92400e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Items</p>
                    <p style="margin: 8px 0 0; color: #78350f; font-size: 18px; font-weight: 700;">${itemCount} Item(s)</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Status Badge -->
          <tr>
            <td style="padding: 0 30px 20px; text-align: center;">
              <span style="display: inline-block; background-color: ${paymentBadgeBg}; color: ${paymentBadgeColor}; padding: 10px 24px; border-radius: 30px; font-weight: 700; font-size: 14px; border: 2px solid ${paymentBadgeColor};">
                ${paymentMethod === "cod" ? "💵" : "✅"} ${paymentLabel}
              </span>
            </td>
          </tr>

          <!-- Customer Information -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                👤 Customer Information
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30%" style="color: #6b7280; font-size: 13px; font-weight: 500;">Name</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: 600;">${customerName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30%" style="color: #6b7280; font-size: 13px; font-weight: 500;">Email</td>
                        <td style="color: #1f2937; font-size: 14px;">
                          <a href="mailto:${customerEmail}" style="color: #2563eb; text-decoration: none;">${customerEmail}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30%" style="color: #6b7280; font-size: 13px; font-weight: 500;">Phone</td>
                        <td style="color: #1f2937; font-size: 14px;">
                          <a href="tel:${customerPhone}" style="color: #2563eb; text-decoration: none;">${customerPhone}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30%" style="color: #6b7280; font-size: 13px; font-weight: 500; vertical-align: top;">Address</td>
                        <td style="color: #1f2937; font-size: 14px; line-height: 1.5;">
                          ${shippingAddress}<br>
                          ${shippingCity}, ${shippingState}<br>
                          PIN: ${shippingPostalCode}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                📦 Order Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #1f2937;">
                    <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Product
                    </th>
                    <th style="padding: 14px 16px; text-align: center; font-size: 12px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Qty
                    </th>
                    <th style="padding: 14px 16px; text-align: center; font-size: 12px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Unit Price
                    </th>
                    <th style="padding: 14px 16px; text-align: right; font-size: 12px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${generateOrderItemsHTML(items)}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Price Breakdown -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                💰 Payment Summary
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px;">
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Subtotal</td>
                        <td style="text-align: right; color: #1f2937; font-size: 14px;">${formatCurrency(
                          subtotal
                        )}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Tax (18% GST)</td>
                        <td style="text-align: right; color: #1f2937; font-size: 14px;">${formatCurrency(
                          taxAmount
                        )}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Shipping</td>
                        <td style="text-align: right; color: ${
                          shippingAmount === 0 ? "#059669" : "#1f2937"
                        }; font-size: 14px;">
                          ${
                            shippingAmount === 0
                              ? "FREE"
                              : formatCurrency(shippingAmount)
                          }
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; background-color: #1a365d; border-radius: 0 0 12px 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #ffffff; font-size: 16px; font-weight: 700;">TOTAL</td>
                        <td style="text-align: right; color: #fbbf24; font-size: 22px; font-weight: 700;">${formatCurrency(
                          totalAmount
                        )}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Date Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f0f9ff; border-radius: 12px; padding: 20px; border-left: 4px solid #0ea5e9;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="text-align: center;">
                      <p style="margin: 0; font-size: 13px; color: #0369a1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        📅 Order Placed On
                      </p>
                      <p style="margin: 8px 0 0; font-size: 18px; color: #1a365d; font-weight: 700;">
                        ${formatDate(orderDate)}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Action Required (for COD) -->
          ${
            paymentMethod === "cod"
              ? `
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; border: 1px solid #fecaca;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #dc2626; font-weight: 700;">
                  ⚠️ Action Required
                </p>
                <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
                  This is a Cash on Delivery order. Payment of <strong>${formatCurrency(
                    totalAmount
                  )}</strong> will be collected upon delivery. Please ensure the delivery agent collects the exact amount.
                </p>
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 16px; font-weight: 700;">
                ${COMPANY.name} - Admin Panel
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated notification. Order ID: ${orderId}
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

// =====================================================
// SEND ORDER EMAILS FUNCTION
// =====================================================
const sendOrderEmails = async (orderData) => {
  try {
    const customerEmailHtml = getCustomerEmailTemplate(orderData);
    const adminEmailHtml = getAdminEmailTemplate(orderData);

    // Send customer email
    const customerEmailPromise = resend.emails.send({
      from: `${COMPANY.name} <${process.env.RESEND_FROM_EMAIL}>`,
      to: orderData.customerEmail,
      subject: `Order Confirmed! 🎉 Your Order #${orderData.orderId} has been placed`,
      html: customerEmailHtml,
    });

    // Send admin email
    const adminEmailPromise = resend.emails.send({
      from: `${COMPANY.name} Orders <${process.env.RESEND_FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🔔 New Order #${orderData.orderId} - ${formatCurrency(
        orderData.totalAmount
      )} - ${orderData.customerName}`,
      html: adminEmailHtml,
    });

    // Send both emails in parallel
    const [customerResult, adminResult] = await Promise.all([
      customerEmailPromise,
      adminEmailPromise,
    ]);

    console.log("✅ Customer email sent:", customerResult);
    console.log("✅ Admin email sent:", adminResult);

    return {
      success: true,
      customerEmailId: customerResult.data?.id,
      adminEmailId: adminResult.data?.id,
    };
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendOrderEmails,
  getCustomerEmailTemplate,
  getAdminEmailTemplate,
};

// =====================================================
// CONTACT US EMAIL TEMPLATE (Admin Notification)
// =====================================================
const getContactEmailTemplate = (contactData) => {
  const { name, email, phone, organization, message, submittedAt } =
    contactData;

  const formatDateTime = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
              <p style="margin: 0; font-size: 40px;">💬</p>
              <h1 style="margin: 12px 0 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                New Contact Form Submission
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                ${COMPANY.name} - Website Inquiry
              </p>
            </td>
          </tr>

          <!-- Timestamp -->
          <tr>
            <td style="padding: 30px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 24px;">
                <p style="margin: 0; color: #166534; font-size: 13px;">
                  📅 Received on <strong>${formatDateTime(submittedAt)}</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                👤 Contact Information
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; overflow: hidden;">
                <!-- Name -->
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="120" style="color: #6b7280; font-size: 13px; font-weight: 500;">
                          <span style="margin-right: 8px;">👤</span> Name
                        </td>
                        <td style="color: #1f2937; font-size: 15px; font-weight: 600;">${name}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Email -->
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="120" style="color: #6b7280; font-size: 13px; font-weight: 500;">
                          <span style="margin-right: 8px;">📧</span> Email
                        </td>
                        <td style="color: #1f2937; font-size: 15px;">
                          <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Phone -->
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="120" style="color: #6b7280; font-size: 13px; font-weight: 500;">
                          <span style="margin-right: 8px;">📱</span> Phone
                        </td>
                        <td style="color: #1f2937; font-size: 15px;">
                          <a href="tel:${phone}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${phone}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Organization -->
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="120" style="color: #6b7280; font-size: 13px; font-weight: 500;">
                          <span style="margin-right: 8px;">🏢</span> Organization
                        </td>
                        <td style="color: #1f2937; font-size: 15px; font-weight: 500;">${
                          organization || "Not provided"
                        }</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Section -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                ✉️ Message
              </h3>
              <div style="background-color: #fffbeb; border-radius: 12px; padding: 24px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
              </div>
            </td>
          </tr>

          <!-- Quick Action Buttons -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                ⚡ Quick Actions
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="padding-right: 8px;">
                    <a href="mailto:${email}?subject=Re: Your inquiry to Hani Industries" style="display: block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center;">
                      📧 Reply via Email
                    </a>
                  </td>
                  <td width="48%" style="padding-left: 8px;">
                    <a href="tel:${phone}" style="display: block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center;">
                      📞 Call Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- WhatsApp Button -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="https://wa.me/${phone.replace(
                /[^0-9]/g,
                ""
              )}?text=Hello ${encodeURIComponent(
    name
  )}, thank you for contacting Hani Industries. " style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                💬 Reply on WhatsApp
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 16px; font-weight: 700;">
                ${COMPANY.name}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated notification from your website contact form.
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

// Send Contact Form Email to Admin
const sendContactEmail = async (contactData) => {
  try {
    const contactEmailHtml = getContactEmailTemplate(contactData);

    const result = await resend.emails.send({
      from: `${COMPANY.name} Website <${process.env.RESEND_FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: contactData.email,
      subject: `💬 New Contact Form: ${contactData.name} - ${
        contactData.organization || "Individual"
      }`,
      html: contactEmailHtml,
    });

    console.log("✅ Contact email sent to admin:", result);
    return {
      success: true,
      emailId: result.data?.id,
    };
  } catch (error) {
    console.error("❌ Contact email sending error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update exports
module.exports = {
  sendOrderEmails,
  sendContactEmail,
  getCustomerEmailTemplate,
  getAdminEmailTemplate,
  getContactEmailTemplate,
};
