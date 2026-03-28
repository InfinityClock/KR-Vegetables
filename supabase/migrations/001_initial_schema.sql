-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────
CREATE TYPE stock_status_enum AS ENUM ('in_stock', 'limited', 'out_of_stock');
CREATE TYPE order_status_enum AS ENUM ('placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method_enum AS ENUM ('razorpay', 'cod');

-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🥬',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  price NUMERIC(10,2) NOT NULL,
  offer_price NUMERIC(10,2),
  offer_label TEXT,
  offer_expires_at TIMESTAMPTZ,
  stock_status stock_status_enum DEFAULT 'in_stock',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  status order_status_enum DEFAULT 'placed',
  payment_status payment_status_enum DEFAULT 'pending',
  payment_method payment_method_enum NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 40,
  discount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  delivery_slot TEXT,
  notes TEXT,
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity NUMERIC(10,3) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- ─────────────────────────────────────────
-- ORDER TRACKING
-- ─────────────────────────────────────────
CREATE TABLE order_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'system'
);

-- ─────────────────────────────────────────
-- OFFERS BANNER
-- ─────────────────────────────────────────
CREATE TABLE offers_banner (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  bg_color TEXT DEFAULT '#2D6A4F',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- STORE SETTINGS
-- ─────────────────────────────────────────
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_tracking_order ON order_tracking(order_id);
CREATE INDEX idx_addresses_customer ON addresses(customer_id);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers_banner ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Categories: public read
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin_all" ON categories FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Products: public read (active only for anon), admin full access
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "products_admin_all" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Customers: own row only
CREATE POLICY "customers_own_read" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "customers_own_insert" ON customers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "customers_own_update" ON customers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "customers_admin_all" ON customers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Addresses: own rows only
CREATE POLICY "addresses_own" ON addresses FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "addresses_admin_all" ON addresses FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders: own rows only
CREATE POLICY "orders_own_read" ON orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "orders_own_insert" ON orders FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "orders_admin_all" ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Order items: through orders
CREATE POLICY "order_items_own" ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));
CREATE POLICY "order_items_own_insert" ON order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
);
CREATE POLICY "order_items_admin" ON order_items FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Order tracking: own through orders
CREATE POLICY "tracking_own" ON order_tracking FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));
CREATE POLICY "tracking_admin" ON order_tracking FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Offers banner: public read
CREATE POLICY "banners_public_read" ON offers_banner FOR SELECT USING (is_active = TRUE);
CREATE POLICY "banners_admin_all" ON offers_banner FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Store settings: public read
CREATE POLICY "settings_public_read" ON store_settings FOR SELECT USING (TRUE);
CREATE POLICY "settings_admin_all" ON store_settings FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
