const express = require('express');
const { createAddress, getAddresses, deleteAddress } = require('../controllers/addressController.js');
//import { createAddress, getAddresses } from '../controllers/addressController.js';

const router = express.Router();

router.post('/create', createAddress);   
router.get('/getaddress', getAddresses); 
router.delete('/delete/:userId', deleteAddress);    

module.exports = router;
