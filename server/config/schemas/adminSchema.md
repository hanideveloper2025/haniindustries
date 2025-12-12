-- =============================================
-- CUSTOMERS TABLE (if you want to save customer info)
-- =============================================
CREATE TABLE customers (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
email VARCHAR(255) NOT NULL UNIQUE,
phone VARCHAR(20) NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CUSTOMER ADDRESSES TABLE
-- =============================================
CREATE TABLE customer_addresses (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
address_line VARCHAR(500) NOT NULL,
city VARCHAR(100) NOT NULL,
state VARCHAR(100) NOT NULL,
postal_code VARCHAR(20) NOT NULL,
is_default BOOLEAN DEFAULT false,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE orders (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
order_id VARCHAR(50) NOT NULL UNIQUE, -- Your custom order ID like 'ORD001'
customer_id UUID REFERENCES customers(id),

    -- Customer details (stored directly for order history)
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,

    -- Shipping address
    shipping_address VARCHAR(500) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,

    -- Order amounts (stored in paise for Razorpay compatibility)
    subtotal INTEGER NOT NULL,           -- Amount in paise (e.g., 50000 = ₹500)
    tax_amount INTEGER NOT NULL,         -- Tax in paise
    shipping_amount INTEGER NOT NULL,    -- Shipping in paise
    total_amount INTEGER NOT NULL,       -- Total in paise

    -- Order status
    order_status VARCHAR(50) DEFAULT 'pending',  -- pending, confirmed, processing, shipped, delivered, cancelled

    -- Delivery info
    estimated_delivery DATE,
    actual_delivery DATE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE order_items (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
product_id VARCHAR(100) NOT NULL, -- References your products table
product_name VARCHAR(255) NOT NULL,
product_image VARCHAR(500),
size VARCHAR(50) NOT NULL,
quantity INTEGER NOT NULL,
unit_price INTEGER NOT NULL, -- Price per unit in paise
total_price INTEGER NOT NULL, -- quantity \* unit_price in paise
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PAYMENTS TABLE (Razorpay Integration)
-- =============================================
CREATE TABLE payments (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    -- Payment method
    payment_method VARCHAR(50) NOT NULL,  -- 'cod', 'razorpay', 'card'

    -- Razorpay specific fields
    razorpay_order_id VARCHAR(100),       -- Order ID from Razorpay (starts with 'order_')
    razorpay_payment_id VARCHAR(100),     -- Payment ID from Razorpay (starts with 'pay_')
    razorpay_signature VARCHAR(500),      -- Signature for verification

    -- Payment details
    amount INTEGER NOT NULL,              -- Amount in paise
    currency VARCHAR(10) DEFAULT 'INR',

    -- Payment status
    payment_status VARCHAR(50) DEFAULT 'pending',  -- pending, authorized, captured, failed, refunded

    -- Additional Razorpay response data
    payment_response JSONB,               -- Store full Razorpay response

    -- For COD
    cod_collected BOOLEAN DEFAULT false,
    cod_collected_at TIMESTAMP WITH TIME ZONE,

    -- Refund details
    refund_id VARCHAR(100),
    refund_amount INTEGER,
    refund_status VARCHAR(50),
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

-- =============================================
-- PAYMENT LOGS TABLE (For debugging & audit)
-- =============================================
CREATE TABLE payment_logs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
event_type VARCHAR(100) NOT NULL, -- 'order_created', 'payment_initiated', 'payment_success', 'payment_failed', 'webhook_received'
event_data JSONB, -- Full event payload
ip_address VARCHAR(50),
user_agent TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- =============================================
-- UPDATE TRIGGER FOR updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;

$$
language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION TO DECREMENT STOCK
-- =============================================
CREATE OR REPLACE FUNCTION decrement_stock(
    p_product_id VARCHAR,
    p_size VARCHAR,
    p_quantity INTEGER
)
RETURNS VOID AS
$$

BEGIN
UPDATE product_variants
SET stock = GREATEST(stock - p_quantity, 0)
WHERE product_id = p_product_id AND size = p_size;
END;
$$ LANGUAGE plpgsql;
