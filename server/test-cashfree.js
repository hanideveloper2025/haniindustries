/**
 * Test script to verify Cashfree credentials
 * Run: node test-cashfree.js
 */
require("dotenv").config();

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL;

console.log("🔍 Testing Cashfree Credentials...\n");
console.log("Environment Variables:");
console.log(
  "- APP_ID:",
  CASHFREE_APP_ID ? `${CASHFREE_APP_ID.substring(0, 20)}...` : "❌ MISSING"
);
console.log(
  "- SECRET_KEY:",
  CASHFREE_SECRET_KEY
    ? `${CASHFREE_SECRET_KEY.substring(0, 20)}...`
    : "❌ MISSING"
);
console.log("- BASE_URL:", CASHFREE_BASE_URL || "❌ MISSING");
console.log("");

if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY || !CASHFREE_BASE_URL) {
  console.error("❌ One or more environment variables are missing!");
  process.exit(1);
}

// Test API call
const testPayload = {
  order_id: `TEST_${Date.now()}`,
  order_amount: "100.00",
  order_currency: "INR",
  customer_details: {
    customer_id: "TEST_CUSTOMER",
    customer_name: "Test User",
    customer_email: "test@example.com",
    customer_phone: "9999999999",
  },
  order_meta: {
    return_url: "https://example.com/return",
  },
};

console.log("📤 Sending test request to Cashfree API...\n");

fetch(`${CASHFREE_BASE_URL}/pg/orders`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-client-id": CASHFREE_APP_ID,
    "x-client-secret": CASHFREE_SECRET_KEY,
    "x-api-version": "2023-08-01",
  },
  body: JSON.stringify(testPayload),
})
  .then(async (response) => {
    const data = await response.json();

    console.log("📥 Response Status:", response.status);
    console.log("📥 Response Data:", JSON.stringify(data, null, 2));
    console.log("");

    if (response.ok) {
      console.log("✅ SUCCESS! Cashfree credentials are working correctly!");
      console.log("Order ID:", data.order_id);
      console.log("Payment Session ID:", data.payment_session_id);
    } else {
      console.error("❌ FAILED! Cashfree authentication error.");
      console.error("");
      console.error("Common causes:");
      console.error("1. Invalid or expired API credentials");
      console.error(
        "2. Credentials do not match environment (test vs production)"
      );
      console.error("3. IP whitelisting required in Cashfree dashboard");
      console.error("4. Account not activated or verified");
      console.error("");
      console.error("🔧 Fix:");
      console.error("- Login to https://merchant.cashfree.com/merchant/login");
      console.error("- Go to Developers → API Keys");
      console.error("- Regenerate test credentials");
      console.error("- Update .env file with new credentials");
      console.error("- Restart your server");
    }
  })
  .catch((error) => {
    console.error("❌ Network or fetch error:", error.message);
  });
