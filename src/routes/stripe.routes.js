const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.Controller');

router.post('/customer', stripeController.createCustomer);
router.post('/customer/:customerId/payment-methods', stripeController.addPaymentMethod);
router.post('/payment-intents', stripeController.createPaymentIntent);
router.post('/payment-intents/:paymentIntentId/confirm', stripeController.confirmPaymentIntent);
router.post('/webhooks', stripeController.handleWebhook);
module.exports = router;