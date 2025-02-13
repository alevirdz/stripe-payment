const express = require('express');
const dotenv = require ('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
app.set('port', process.env.PORT);
app.use(express.json());
app.use(cors({
  origin: process.env.ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

//Callback Controllers
const stripePayment = require('./routes/stripe.routes');
app.use('/api', stripePayment );


module.exports = app;