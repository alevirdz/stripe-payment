const { DataTypes } = require('sequelize');
const connection = require('../database/mysql');

const StripeWebhook = connection.define('StripeWebhook', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  event_data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  event_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  failure_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  received_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'alb_stripe_webhooks',
  timestamps: false,
});

module.exports = StripeWebhook;
