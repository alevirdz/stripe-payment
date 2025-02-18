const express = require('express');
const dotenv = require ('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
dotenv.config();

const app = express();
app.set('port', process.env.PORT);
//app.use(express.json());
app.use(bodyParser.raw({ type: 'application/json' }));
// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:4000', // Permite solicitudes solo desde esta URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

//Callback Controllers
const stripePayment = require('./routes/stripe.routes');
app.use('/api', stripePayment );


module.exports = app;