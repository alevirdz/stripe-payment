const { Sequelize } = require('sequelize');
const dotenv = require ('dotenv');
dotenv.config();

const connection = new Sequelize(process.env.DATABASE, process.env.DB_USER, process.env.DB_PWD, {
  host: process.env.HOST,
  dialect:  process.env.MOTOR,
  port: process.env.DB_PORT,
  logging: false
});

(async () => {
  try {
    await connection.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error(`Unable to connect to the database: ${error.message}`);
  }
})();

module.exports = connection;