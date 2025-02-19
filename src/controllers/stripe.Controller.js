const stripeMiddleware = require('../middleware/stripeMiddleware');
const { createCustumer, createPaymentMethod, createPaymentIntent, confirmPaymentIntent, stripeWebhook } = require('../services/stripeService');
const dotenv = require ('dotenv');
dotenv.config();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//En los siguientes 2 metodos requieres un lado admin para permitir añadir sus tarjetas
exports.createCustomer = async (req, res) => {
  const { name, email } = req.body;

  const validate = stripeMiddleware.validateStripeCustomerData(name, email, res);
  try {
    if (validate) {
      //IN BD
      const createdCustomer = await createCustumer(name, email);

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        customerId: createdCustomer.id,
        email: createdCustomer.email,
        name: createdCustomer.name
      });
    }

  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al crear el cliente en Stripe' });
  }
};

exports.addPaymentMethod = async (req, res) => {
  const { customerId } = req.params;  // Recibimos el ID del cliente
  const { paymentMethodId } = req.body;  // Recibimos el ID del método de pago

  try {
    // Llamamos al servicio para agregar el método de pago
    const paymentMethod = await createPaymentMethod(customerId, paymentMethodId);

    res.status(200).json({
      message: 'Método de pago asociado correctamente',
      paymentMethod: paymentMethod,
    });
  } catch (error) {
    console.error('Error asociando el método de pago:', error);
    res.status(500).json({ error: 'Hubo un error al asociar el método de pago' });
  }
};

// Comprando un producto
exports.createPaymentIntent = async (req, res) => {
  const { amount, currency } = req.body;

  try {
    if (!amount || !currency) {
      return res.status(400).json({ error: 'Faltan parámetros en la solicitud' });
    }

    const paymentIntent = await createPaymentIntent(amount, currency);
      // Extraemos clientSecret y paymentIntentId de la respuesta del servicio
      const { clientSecret, paymentIntentId } = paymentIntent;

      return res.status(200).json({
      client_secret: clientSecret,
      payment_intent_id: paymentIntentId,
      });

  } catch (error) {
    console.error('Error al crear el Payment Intent:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.confirmPaymentIntent = async (req, res) => {
  const { paymentIntentId } = req.params;

  try {
    // Confirmar el PaymentIntent llamando al servicio
    const paymentIntent = await confirmPaymentIntent(paymentIntentId);
    console.log(paymentIntent.message)

    // Verificar el estado del PaymentIntent
    if (paymentIntent.status === 'succeeded') {
      return res.json({
        success: true,
        message: 'Pago confirmado exitosamente',
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'No se pudo confirmar el pago',
        status: paymentIntent.status,
      });
    }
    
  } catch (error) {
    console.error('Error al confirmar el PaymentIntent:', error.message);

    // Manejar el error correctamente, si el error es sobre pago ya procesado, dar el mensaje adecuado
    if (error.message === 'El pago ya ha sido procesado previamente.') {
      return res.status(200).json({
        success: true,
        message: 'El pago ya ha sido procesado exitosamente.',
      });
    }

    // Si es un error genérico, mostrar mensaje general
    return res.status(400).json({
      success: false,
      message: 'No se pudo confirmar el pago, intenta nuevamente.',
    });
  }
};

exports.handleWebhook  = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  const webhook = await stripeWebhook(req.body, sig, webhookSecret);
};
