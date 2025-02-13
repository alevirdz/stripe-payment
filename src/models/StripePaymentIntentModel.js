// src/models/stripePaymentIntentModel.js
const { DataTypes } = require('sequelize');
const connection = require('../database/mysql');
const StripeCustomer = require('./stripeCustumerModel');

const PaymentIntent = connection.define('StripePaymentIntent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stripe_payment_intent_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'alb_stripe_payment_intents',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// Un intento de pago pertenece a un cliente
PaymentIntent.belongsTo(StripeCustomer, { foreignKey: 'customer_id', onDelete: 'CASCADE' });

module.exports = PaymentIntent;
