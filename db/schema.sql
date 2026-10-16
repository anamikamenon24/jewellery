-- Glimmora schema. Safe to run repeatedly.
-- All money columns are integers in paise (₹1 = 100 paise).

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  loyalty_points  INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  tier            TEXT NOT NULL DEFAULT 'Silver' CHECK (tier IN ('Silver', 'Gold', 'Diamond')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id                SERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  category          TEXT NOT NULL CHECK (category IN ('Earrings', 'Necklaces', 'Rings', 'Bangles', 'Anklets', 'Sets')),
  finish            TEXT NOT NULL CHECK (finish IN ('Gold-plated', 'Silver', 'Rose Gold', 'Oxidised', 'Kundan', 'Pearl')),
  occasion          TEXT NOT NULL CHECK (occasion IN ('Wedding', 'Festive', 'Office', 'Party', 'Everyday')),
  price             INTEGER NOT NULL CHECK (price >= 0),
  compare_at_price  INTEGER CHECK (compare_at_price IS NULL OR compare_at_price >= price),
  stock             INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating            NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count      INTEGER NOT NULL DEFAULT 0,
  description       TEXT NOT NULL DEFAULT '',
  care_tips         TEXT NOT NULL DEFAULT '',
  is_trending       BOOLEAN NOT NULL DEFAULT false,
  is_new            BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (product_id, sort_order)
);

CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id              SERIAL PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value  INTEGER NOT NULL CHECK (discount_value > 0), -- percent (1-100) or paise
  min_order       INTEGER NOT NULL DEFAULT 0,                  -- paise
  is_active       BOOLEAN NOT NULL DEFAULT true,
  expires_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number      TEXT NOT NULL UNIQUE,
  status            TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'packed', 'shipped', 'delivered', 'cancelled')),
  subtotal          INTEGER NOT NULL,
  discount          INTEGER NOT NULL DEFAULT 0,
  shipping_fee      INTEGER NOT NULL DEFAULT 0,
  total             INTEGER NOT NULL,
  coupon_code       TEXT,
  payment_method    TEXT NOT NULL CHECK (payment_method IN ('cod', 'card')),
  shipping_name     TEXT NOT NULL,
  shipping_phone    TEXT NOT NULL,
  shipping_address  TEXT NOT NULL,
  gift_message      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  unit_price    INTEGER NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS deals (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  deal_price  INTEGER NOT NULL CHECK (deal_price >= 0),
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_products_category    ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_finish      ON products (finish);
CREATE INDEX IF NOT EXISTS idx_products_occasion    ON products (occasion);
CREATE INDEX IF NOT EXISTS idx_products_price       ON products (price);
CREATE INDEX IF NOT EXISTS idx_products_is_trending ON products (is_trending);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product      ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user         ON reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user        ON wishlist_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user            ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user          ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_deals_window         ON deals (starts_at, ends_at);
