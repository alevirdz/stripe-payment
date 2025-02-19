const stripePaymentMethodModel = require('../models/stripePaymentMethodModel');

const {createCustomerInDB, createCustomerMethodInDB, createOrUpdatePaymentIntentInDB, createEventHookInDB } = require('../taskfile/stripeDataService')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

const createCustumer = async (name, email) => {
    try {
        // Registrar cliente en Stripe
        const stripeCustomer = await stripe.customers.create({
            email: email,
            name: name || '',
        }).catch(error => {
          console.error(error);
          throw new Error("No se pudo registrar al cliente en stripe");
      });

        // Guardar en la base de datos
        const saveStripeCustomer = await createCustomerInDB(stripeCustomer);
        return stripeCustomer;

    } catch (error) {
        throw new Error('Error al crear el cliente en Stripe: ' + error.message);
    }
};


const createPaymentMethod = async (customerId, paymentMethodId) => {
    try {
        // Primero, adjuntamos el paymentMethod al cliente
        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        console.log(paymentMethod)

        // Luego, actualizamos el cliente para establecer el paymentMethod como predeterminado
        const updatedCustomer = await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethod.id, // Establecer como método de pago predeterminado
            },
        });

        // Obtener los detalles del método de pago adjuntado
        const paymentMethodDetails = await stripe.paymentMethods.retrieve(paymentMethodId);

        console.log('Método de pago adjuntado y configurado como predeterminado:', paymentMethodDetails);

        // Si es necesario, puedes guardar los detalles en la base de datos
        // Guardar en la base de datos
        const saveStripeMethod = await createCustomerMethodInDB(stripeCustomer);

        
        console.log(saveStripeMethod)
        return {
            customer: updatedCustomer,  // Devolver los datos del cliente actualizado
            // paymentMethod: newPaymentMethod,
        };
    } catch (error) {
        throw new Error('Error al agregar el método de pago: ' + error.message);
    }
};


const createPaymentIntent = async (amount, currency) => {
  try {

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
      description: "Pago por producto imaginario",
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };

  } catch (error) {
    throw new Error("No se pudo procesar el pago, intenta nuevamente.");
  }
};

const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    // Recuperamos el PaymentIntent desde Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verificamos si el PaymentIntent ya existe en la base de datos o si es necesario crear o actualizarlo
    const paymentIntentBD = await createOrUpdatePaymentIntentInDB(paymentIntent);

    // Si ya ha sido procesado, no necesitamos hacer nada más
    if (paymentIntentBD.status === 'succeeded') {
      return {
        success: true,
        message: 'El pago ya ha sido procesado exitosamente.',
        paymentIntentId: paymentIntent.id,
        status: paymentIntentBD.status,
      };
    }

    // Si no ha sido procesado, procedemos a confirmar el PaymentIntent
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    // Verificamos si la confirmación fue exitosa
    if (confirmedPaymentIntent.status === 'succeeded') {
      await updatePaymentIntentInDB(paymentIntent); // Actualizamos a 'succeeded'
      return {
        success: true,
        message: 'Pago confirmado exitosamente',
        paymentIntentId: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
      };
    } else {
      await updatePaymentIntentInDB(paymentIntent); // Actualizamos si no se pudo confirmar
      return {
        success: false,
        message: 'No se pudo confirmar el pago, el estado se actualizó a "requires_confirmation".',
        status: confirmedPaymentIntent.status,
      };
    }

  } catch (error) {
    throw new Error(error.message);
  }
};


const stripeWebhook = async (body, sig, webhookSecret) => {
    let event;
    
    try {
      // Verificamos la firma del evento
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
      console.log("Ocurrio un error en la verificación de la firma:", err);
      return { success: false, message: `Webhook Error: ${err.message}`, status: 400 };
  }
    // Guardar el evento en la tabla de webhooks
    await createEventHookInDB(event);
};

  

module.exports = {
    createCustumer,
    createPaymentMethod,
    createPaymentIntent,
    confirmPaymentIntent,
    stripeWebhook,
};