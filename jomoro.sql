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

-- Default admin account (email: admin@jomoro.com / password: admin12pass)
INSERT INTO users (first_name, last_name, email, password, role)
VALUES ('Admin', 'Jomoro', 'admin@jomoro.com', 'admin12pass', 'ADMIN');

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

-- Sample categories
INSERT INTO categories (name) VALUES
  ('Espresso Series'),
  ('Latte Blends'),
  ('Non-Coffee'),
  ('Pastries');

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
