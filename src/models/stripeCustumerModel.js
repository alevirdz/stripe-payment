const { DataTypes } = require('sequelize');
const connection = require('../database/mysql');

const StripeCustomer = connection.define('StripeCustomer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stripe_customer_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'alb_stripe_customers',
  timestamps: true,
});

module.exports = StripeCustomer;
