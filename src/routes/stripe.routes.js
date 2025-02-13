const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.Controller');

router.post('/customers', stripeController.createCustomer);
// router.post('/api/customers/:customerId/payment-methods', stripeController.addPaymentMethod);
// router.post('/api/payment-intents', stripeController.createPaymentIntent);
// router.post('/api/payment-intents/:paymentIntentId/confirm', stripeController.confirmPaymentIntent);
// router.post('/api/webhooks', stripeController.handleWebhook);
module.exports = router;