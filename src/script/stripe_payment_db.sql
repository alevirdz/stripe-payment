CREATE DATABASE IF NOT EXISTS stripe_payment;
USE stripe_payment;

CREATE TABLE IF NOT EXISTS alb_stripe_customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alb_stripe_payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
    card_brand VARCHAR(50),
    last4 VARCHAR(4),
    exp_month INT,
    exp_year INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES alb_stripe_customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alb_stripe_payment_intents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
    amount INT NOT NULL, -- Monto en centavos
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES alb_stripe_customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alb_stripe_webhooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(255),
    event_data JSON,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SHOW TABLES;
