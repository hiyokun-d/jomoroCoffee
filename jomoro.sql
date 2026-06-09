-- Jomoro Koffee - Database Setup
-- Import this file into MySQL via Sequel Ace or phpMyAdmin

-- ============================================================
-- AUTH SERVICE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS jomoro_auth;
USE jomoro_auth;

CREATE TABLE IF NOT EXISTS users (
  id         INT           NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(255)  NOT NULL,
  last_name  VARCHAR(255)  NOT NULL,
  email      VARCHAR(255)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       VARCHAR(25)   NOT NULL DEFAULT 'CUSTOMER',
  PRIMARY KEY (id)
);

-- Seed users
INSERT INTO users (first_name, last_name, email, password, role) VALUES
  ('Admin',  'Jomoro',   'admin@jomoro.com',  'admin12pass',  'ADMIN'),
  ('John',   'Doe',      'john@example.com',  'mypass12',     'CUSTOMER'),
  ('Jane',   'Smith',    'jane@example.com',  'secret34me',   'CUSTOMER'),
  ('Budi',   'Santoso',  'budi@example.id',   'budi56pass',   'CUSTOMER');

-- ============================================================
-- PRODUCT SERVICE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS jomoro_product;
USE jomoro_product;

CREATE TABLE IF NOT EXISTS categories (
  id   INT          NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS products (
  id          INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  price       DOUBLE       NOT NULL,
  stock       INT          NOT NULL,
  image_url   VARCHAR(255) NULL,
  category_id INT          NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Seed categories
INSERT INTO categories (name) VALUES
  ('Espresso Series'),
  ('Latte Blends'),
  ('Non-Coffee'),
  ('Pastries');

-- Seed products
-- Espresso Series (category_id = 1)
INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES
  ('Classic Espresso Shot',      'A bold and intense single shot of pure espresso with rich crema',        25000, 100, NULL, 1),
  ('Double Americano Coffee',    'Two espresso shots diluted with hot water for a smooth full bodied cup', 30000, 80,  NULL, 1),
  ('Creamy Cappuccino Cup',      'Equal parts espresso steamed milk and thick velvety microfoam on top',  35000, 75,  NULL, 1);

-- Latte Blends (category_id = 2)
INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES
  ('Sweet Vanilla Latte Blend',      'Smooth espresso paired with vanilla syrup and silky steamed milk',          38000, 90,  NULL, 2),
  ('Iced Caramel Macchiato Latte',   'Chilled espresso layered over milk with rich caramel drizzle on top',       42000, 85,  NULL, 2),
  ('Japanese Matcha Green Latte',    'Premium Japanese matcha whisked with steamed milk for earthy sweetness',    40000, 60,  NULL, 2),
  ('Brown Sugar Oat Milk Latte',     'Espresso with oat milk and brown sugar for a warm nutty sweetness',        43000, 50,  NULL, 2);

-- Non-Coffee (category_id = 3)
INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES
  ('Dark Chocolate Frappe Drink',    'Blended frozen chocolate milk topped with whipped cream and cocoa powder',  38000, 70,  NULL, 3),
  ('Fresh Strawberry Smoothie Drink','Blended fresh strawberries with yogurt milk and a hint of honey sweetness', 35000, 55,  NULL, 3),
  ('Taro Purple Milk Tea Drink',     'Creamy taro flavored milk tea served over ice with chewy tapioca pearls',   37000, 65,  NULL, 3);

-- Pastries (category_id = 4)
INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES
  ('Classic Butter Croissant Pastry', 'Flaky golden croissant made with pure butter baked fresh every morning',   28000, 40,  NULL, 4),
  ('Double Chocolate Muffin Cake',    'Moist chocolate muffin loaded with chocolate chips and a soft fudgy center',25000, 45,  NULL, 4),
  ('Cinnamon Raisin Danish Pastry',   'Soft Danish pastry swirled with cinnamon sugar and plump golden raisins',  30000, 35,  NULL, 4);

-- ============================================================
-- TRANSACTION SERVICE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS jomoro_transaction;
USE jomoro_transaction;

CREATE TABLE IF NOT EXISTS carts (
  id      INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id         INT NOT NULL AUTO_INCREMENT,
  cart_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (cart_id) REFERENCES carts(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id         INT      NOT NULL AUTO_INCREMENT,
  user_id    INT      NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS order_details (
  id         INT    NOT NULL AUTO_INCREMENT,
  order_id   INT    NOT NULL,
  product_id INT    NOT NULL,
  price      DOUBLE NOT NULL,
  quantity   INT    NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
