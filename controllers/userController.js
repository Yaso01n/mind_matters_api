const axios = require('axios');
const Joi = require('joi');
const connection = require('../DataBase/connection'); // Import the connection module 
require('dotenv').config();
//================================================ Schema ==============================================================
const usercreateSchema = Joi.object({
  userEmail: Joi.string().allow('').required(),
  userPassword: Joi.string().allow('').required(),
  language: Joi.string().allow('').required(),
})
//========================================== Create new user  ===============================================
async function createuser(req, res) {  
  const { error } = usercreateSchema.validate(req.body);    // Validate the request body

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const {
    userEmail,
    userPassword,
    language,
  } = req.body;

  try {      
    // Check if this userEmail exists 
    const checkuserEmailQuery = `SELECT * FROM mmuse WHERE userEmail = ?`;
    const [userEmailResult] = await connection.promise().query(checkuserEmailQuery, [userEmail]);

    if (userEmailResult.length > 0) { 
      const Message = `Sorry, user ${userEmail} has already added his email before`;
      console.log(Message);
      return res.status(404).json({ message: Message });
    }
    
    insertNewUser(userEmail, userPassword, language);
    console.log( "New User is created successfully");
    res.status(201).json({ message: "New User is created successfully" });

  } catch (appointmentsError) {
    console.error("Error checking for existing userEmail:", appointmentsError);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//================================================================================================
async function insertNewUser(userEmail, userPassword, language) {    // Insert into Prescription table
  const sql_query_user = `INSERT INTO mmuser (userEmail, userPassword, languages) VALUES (?, ?, ?)`;
  const [userResult] = await connection.promise().query(sql_query_user,[userEmail, userPassword, language]);
  console.log("New User created with userEmail:",userEmail);
}

//================================================================================================
function getAllPrescriptions(req, res) {  //Get all prescriptions
  const sql_query = generatePrescriptionQuery("","");
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.status(404).json({ message: "No Prescriptions found in prescriptions list" });
    } 
    else {
      const prescriptionArray = processQueryResult(result);
      res.json(prescriptionArray);
    }
  });
}
//================================================================================================
function getPrescriptionByID (req, res){  // Get prescription by prescriptionId
  const PrescriptionID = req.params.prescriptionId;
  const sql_query = generatePrescriptionQuery("",` AND prescription.PrescriptionID = ${PrescriptionID}`);
  connection.query(sql_query, [PrescriptionID], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.status(404).json({ message: `Prescription with ID ${PrescriptionID} not found.` });
    } 
    else {
      const prescriptionArray = processQueryResult(result);
      res.json(prescriptionArray);
    }
  });
}

//===============================================================================================
function generatePrescriptionQuery(joinConditions, whereConditions) {   // Function to generate the common SQL query for retrieving prescriptions
  const sql_query = `
    SELECT prescription.PrescriptionID, prescription.PatientID, prescription.AppointmentID,  prescription.DoctorName, prescription.Diagnosis, prescription.ExtraNotes, 
    prescription.CreatedAt, drug.DrugID, drug.DName, drug.DDuration, drug.DDose
    FROM prescription
    LEFT JOIN drug ON prescription.PrescriptionID = drug.PrescriptionID
    ${joinConditions}
    WHERE prescription.PrescriptionID IS NOT NULL ${whereConditions}` ;

  return sql_query;
}
//===============================================================================================
function processQueryResult(result) {          //Function to process the query result and build the prescription map
  const prescriptionMap = {};
  result.forEach((row) => {
    const {PrescriptionID, DrugID} = row;

    if (!prescriptionMap[PrescriptionID]) {
      prescriptionMap[PrescriptionID] = {
        PrescriptionID,
        PatientID: row.PatientID,
        AppointmentID: row.AppointmentID,
        DoctorName: row.DoctorName,
        Diagnosis: row.Diagnosis,
        ExtraNotes: row.ExtraNotes,
        CreatedAt: row.CreatedAt,
        drug: []
      };
    }
    // Check if DrugID is not null and not already in the array
    if (DrugID !== null ) {
      prescriptionMap[PrescriptionID].drug.push({ DrugID, DrugName: row.DName, DrugDuration: row.DDuration, DrugDose: row.DDose });
    }
  });

  return Object.values(prescriptionMap);
}



//===============================================================================================
module.exports = {
  createuser,
  getuserReport,
  getuserByuserEmail,
  updateuserByuserEmail
};
