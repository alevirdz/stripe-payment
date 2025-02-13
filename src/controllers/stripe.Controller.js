const stripeMiddleware = require('../middleware/stripeMiddleware');
// const appointmentService = require('../services/appointmentService');
const stripeService = require('../services/stripeService');
const dotenv = require ('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 


exports.createCustomer = async (req, res) => {
  const { name, email } = req.body;

  const secure = stripeMiddleware.createData(name, email, res);

  try {
    if(secure){
      const createdCustumer = await stripeService.createCustumer(name, email);
          res.status(201).json({
          message: 'Usuario creado exitosamente'
      });
    }


    // Aquí puedes guardar el ID del cliente de Stripe en tu base de datos si lo necesitas
    // Ejemplo: await db.saveCustomer(userId, customer.id);

    // Devolver el cliente creado (puedes agregar más datos si es necesario)
    res.status(200).json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      created: customer.created,
    });
  } catch (error) {
    console.error('Error creando el cliente en Stripe:', error);
    res.status(500).json({ error: 'Hubo un error al crear el cliente en Stripe' });
  }
};


