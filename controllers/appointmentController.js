const axios = require('axios');
const Joi = require('joi');
const connection = require('../DataBase/connection'); // Import the connection module 
require('dotenv').config();


//===============================================================================================
module.exports = {
    insertAppointment,
    getAppointmentByDoctorUsername,
    getAppointmentByUserEmail,
    deleteAppointmentByUserEmail
  };