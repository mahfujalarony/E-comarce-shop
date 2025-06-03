require('dotenv').config();
const SSLCommerzPayment = require('sslcommerz-lts');

const sslcz = new SSLCommerzPayment(
  process.env.SSL_STORE_ID, 
  process.env.SSL_STORE_PASS, 
  process.env.SSL_IS_SANDBOX === 'true'
);

module.exports = sslcz;