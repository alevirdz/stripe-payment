// Importamos el modelo correctamente
const { DataTypes } = require('sequelize');
const connection = require('../database/mysql');
const StripeCustomer = require('./stripeCustumerModel');

const PaymentMethod = connection.define('PaymentMethod', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stripe_payment_method_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  card_brand: {
    type: DataTypes.STRING,
  },
  last4: {
    type: DataTypes.CHAR(4),
  },
  exp_month: {
    type: DataTypes.INTEGER,
  },
  exp_year: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'alb_stripe_payment_methods',
  timestamps: true, 
});

//Un método de pago pertenece a un cliente
PaymentMethod.belongsTo(StripeCustomer, { foreignKey: 'customer_id', onDelete: 'CASCADE' });

module.exports = PaymentMethod;
