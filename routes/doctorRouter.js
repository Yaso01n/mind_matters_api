const express = require('express');
const router = express.Router();

const DoctorController = require("../controllers/doctorController");

//===================================================================================================
router.get('/doctor', DoctorController.getallDoctors);                   // GET All doctors
router.get("/doctor/:dUsername", DoctorController.getDoctorByUsername);    // GET doctor by RecordID
router.put("/doctor/:dUsername", DoctorController.updateDoctorByUsername);   // Update report-data
//===================================================================================================

module.exports =  router;      // Export the 'router' object

