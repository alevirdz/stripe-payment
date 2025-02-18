CREATE DATABASE IF NOT EXISTS stripe_payment;
USE stripe_payment;

-- Crear la tabla de clientes (alb_stripe_customers)
CREATE TABLE IF NOT EXISTS alb_stripe_customers (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- ID del cliente de tipo INT
    stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear la tabla de métodos de pago (alb_stripe_payment_methods)
CREATE TABLE IF NOT EXISTS alb_stripe_payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,  -- Cambié de VARCHAR a INT para que coincida con el tipo de datos de `id` de la tabla de clientes
    stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
    card_brand VARCHAR(50),
    last4 VARCHAR(4),
    exp_month INT,
    exp_year INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES alb_stripe_customers(id) ON DELETE CASCADE
);

-- Crear la tabla de payment_intents (alb_stripe_payment_intents)
CREATE TABLE IF NOT EXISTS alb_stripe_payment_intents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,  -- Cambié de VARCHAR a INT para que coincida con el tipo de datos de `id` de la tabla de clientes
    stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
    amount INT NOT NULL, -- Monto en centavos
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES alb_stripe_customers(id) ON DELETE CASCADE
);

-- Crear la tabla de webhooks (alb_stripe_webhooks)
CREATE TABLE IF NOT EXISTS alb_stripe_webhooks (
    id INT AUTO_INCREMENT PRIMARY KEY,               -- ID único para cada evento
    event_type VARCHAR(255) NOT NULL,                -- Tipo de evento (payment_intent.succeeded, etc.)
    event_data JSON NOT NULL,                       -- Datos completos del evento recibido
    event_id VARCHAR(255) UNIQUE NOT NULL,           -- ID del evento de Stripe (único)
    failure_reason VARCHAR(255),                     -- Razón del fallo (si aplica)
    status VARCHAR(50),                              -- Estado del evento (por ejemplo, succeeded, failed, pending)
    order_id INT,                                   -- ID de la orden relacionada (si aplica)
    customer_id INT,                                -- ID del cliente relacionado (si aplica)
    processed BOOLEAN DEFAULT FALSE,                 -- Si el evento ya ha sido procesado
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Fecha y hora en la que se recibió el evento
);

-- Mostrar las tablas creadas
SHOW TABLES;
