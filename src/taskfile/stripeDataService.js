const stripeCustomerModel = require('../models/stripeCustumerModel');
const stripePaymentMethodModel = require('../models/stripePaymentMethodModel');
const stripePaymentIntentModel = require('../models/StripePaymentIntentModel');
const stripeWebhookModel = require('../models/stripeWebhookModel');

// Crear cliente en la base de datos
const createCustomerInDB = async (stripeCustomer) => {
    try {
        const newCustomer = await stripeCustomerModel.create({
            stripe_customer_id: stripeCustomer.id,
            email: stripeCustomer.email,
            name: stripeCustomer.name,
        });

        return {
            success: true,
            message: 'Cliente creado exitosamente',
            customer: newCustomer,
        };

    } catch (error) {
        console.error('Error al crear el cliente en la base de datos:', error);
        return {
            success: false,
            message: 'Error al crear el cliente',
            error: error.message,
        };
    }
};

// Crear método de pago en la base de datos
const createCustomerMethodInDB = async (paymentMethodDetails, customerId) => {
    try {
        const newPaymentMethod = await stripePaymentMethodModel.create({
            stripe_payment_method_id: paymentMethodDetails.id,
            card_brand: paymentMethodDetails.card.brand,
            last4: paymentMethodDetails.card.last4,
            exp_month: paymentMethodDetails.card.exp_month,
            exp_year: paymentMethodDetails.card.exp_year,
            customer_id: customerId,
        });

        return {
            success: true,
            message: 'Método de pago creado exitosamente',
            paymentMethod: newPaymentMethod,
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al crear el método de pago',
            error: error.message,
        };
    }
};

const createOrUpdatePaymentIntentInDB = async (paymentIntent) => {
    try {
        // Verificar si el PaymentIntent ya existe en la base de datos
        let paymentIntentBD = await stripePaymentIntentModel.findOne({
            where: { stripe_payment_intent_id: paymentIntent.id }
        });

        // Si no existe, lo creamos en la base de datos
        if (!paymentIntentBD) {
            paymentIntentBD = await stripePaymentIntentModel.create({
                stripe_payment_intent_id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                customer_id: paymentIntent.customer || 'anonimo',
            });

            return {
                success: true,
                message: 'PaymentIntent guardado exitosamente en la base de datos.',
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
            };
        }

        // Si ya existe, verificamos si es necesario actualizar el estado
        if (paymentIntent.status === 'succeeded' && paymentIntentBD.status !== 'succeeded') {
            // Si el pago fue exitoso, actualizamos el estado
            await stripePaymentIntentModel.update(
                {
                    status: 'succeeded',
                    updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
                    amount_capturable: paymentIntent.amount_capturable || null,
                },
                { where: { stripe_payment_intent_id: paymentIntent.id } }
            );

            return {
                success: true,
                message: 'Pago confirmado exitosamente',
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
            };
        }

        // Si el pago no fue exitoso, actualizamos el estado a 'requires_confirmation' o 'pending'
        if (paymentIntent.status !== 'succeeded' && paymentIntentBD.status !== 'requires_confirmation') {
            await stripePaymentIntentModel.update(
                {
                    status: 'requires_confirmation',
                    updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                { where: { stripe_payment_intent_id: paymentIntent.id } }
            );

            return {
                success: false,
                message: 'No se pudo confirmar el pago, el estado se actualizó a "requires_confirmation".',
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
            };
        }

        return {
            success: false,
            message: 'El PaymentIntent ya está en el estado esperado.',
            paymentIntentId: paymentIntent.id,
            status: paymentIntentBD.status,
        };

    } catch (error) {
        return {
            success: false,
            message: 'Error al procesar el PaymentIntent.',
            error: error.message,
        };
    }
};


const createEventHookInDB = async (event) => {
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
            case 'payment_intent.payment_failed':
            case 'payment_intent.amount_capturable_updated':
            case 'payment_intent.canceled':
                try {
                    await stripeWebhookModel.create({
                        event_type: event.type,
                        event_data: event.data,
                        event_id: event.id,
                        failure_reason: event.data.object.failure_reason || null,
                        status: event.data.object.status,
                        order_id: event.data.object.metadata.order_id || null,
                        customer_id: event.data.object.customer || null,
                    });
                    return { success: true, message: `${event.type} registrado exitosamente`, status: 200 };
                } catch (error) {
                    console.error('Error al guardar el evento de Stripe en la base de datos:', error);
                    return { success: false, message: 'Error al guardar el evento', status: 500 };
                }

            default:
                return { success: false, message: `Evento no manejado: ${event.type}`, status: 400 };
        }
    } catch (error) {
        return { success: false, message: 'Error interno al procesar el webhook', status: 500 };
    }
};


module.exports = {
    createCustomerInDB,
    createCustomerMethodInDB,
    createOrUpdatePaymentIntentInDB,
    createEventHookInDB
};
