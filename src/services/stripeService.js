const stripeCustumerModel = require('../models/stripeCustumerModel');

const createCustumer = async (name, email) => {
    try {

        // Crear cliente en Stripe
        //Falta la api para acompletar está acción
        const stripeCustomer = await stripe.customers.create({
            email: email,
            name: name || '',
        });

         // Guardar cliente en tu base de datos
        const customer = await stripeCustumerModel.create({
            stripe_customer_id: stripeCustomer.id,
            email: email,
            name: name || '',
        });

        
        return customer;

    } catch (error) {
        throw new Error('Error creating appointment: ' + error.message);
    }
};



module.exports = {
    createCustumer,
};
