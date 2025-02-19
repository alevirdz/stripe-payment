const express = require('express');
const dotenv = require ('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
dotenv.config();

const app = express();
app.set('port', process.env.PORT);

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Usar bodyParser.raw() para los webhooks antes de express.json()
// Esto es crucial porque los webhooks de Stripe necesitan ser raw JSON
app.use('/api/webhooks', bodyParser.raw({ type: 'application/json' }));

// Usar express.json() para el resto de las rutas
app.use(express.json());

// Callback Controllers
const stripePayment = require('./routes/stripe.routes');
app.use('/api', stripePayment);

module.exports = app;
