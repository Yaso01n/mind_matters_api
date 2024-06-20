const axios = require('axios');
const Joi = require('joi');
const connection = require('../DataBase/connection'); // Import the connection module 
require('dotenv').config();
//================================================ Schema ==============================================================
const usercreateSchema = Joi.object({
  name: Joi.string().allow('').required(),
  email: Joi.string().allow('').required(),
  password: Joi.string().allow('').required(),
  language: Joi.string().allow('').required(),
})
//========================================== Create new user  ===============================================
async function createuser(req, res) {  
  const { error } = usercreateSchema.validate(req.body);    // Validate the request body

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const {
    name,
    email,
    password,
    language,
  } = req.body;

  try {      
    // Check if this userEmail exists 
    const checkuserEmailQuery = `SELECT * FROM mmuser WHERE userEmail = ?`;
    const [userEmailResult] = await connection.promise().query(checkuserEmailQuery, [email]);

    if (userEmailResult.length > 0) { 
      const Message = `Sorry, user ${email} has already added his email before`;
      console.log(Message);
      return res.status(404).json({ message: Message });
    }
    
    userResult = insertNewUser(name, email, password, language);
    console.log( "New User is created successfully");
    console.log(userResult);
    res.status(200).json({message: "New User is created successfully"});
    console.log("33");

  } catch (appointmentsError) {
    console.error("Error checking for existing userEmail:", appointmentsError);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//================================================================================================
async function insertNewUser(name, userEmail, userPassword, language) {
  // Insert into mmuser table
  const sql_query_user = `INSERT INTO mmuser (name, userEmail, userPassword, languages) VALUES (?, ?, ?, ?)`;
  const [userResult] = await connection.promise().query(sql_query_user, [name, userEmail, userPassword, language]);

  // Get the auto-incremented userID from the inserted record
  const inserteduserID = userResult.insertId;

  // Insert into appdata table
  const sql_query_appdata = `INSERT INTO appdata (userID) VALUES (?)`;
  const [appdataResult] = await connection.promise().query(sql_query_appdata, [inserteduserID]);

  console.log("New User created with userEmail:", userEmail);
  return userResult;
}


async function feelingsProcessing(req, res) {
  const userEmail = req.params.userEmail;
  const { feelingText } = req.body;

  try {
    // Check if this userEmail exists
    const checkuserEmailQuery = `SELECT * FROM mmuser WHERE userEmail = ?`;
    const [userEmailResult] = await connection.promise().query(checkuserEmailQuery, [userEmail]);

    if (userEmailResult.length == 0) {
      const Message = `Sorry, this user ${userEmail} does not exist`; // Corrected variable name
      console.log(Message);
      return res.status(404).json({ message: Message });
    }

    // Get userID for the userEmail
    const getuserIDQuery = `SELECT userID FROM mmuser WHERE userEmail = ?`;
    const [userResult] = await connection.promise().query(getuserIDQuery, [userEmail]);

    // Extract userID from the result
    const userID = userResult[0].userID;

    // Update feelingText in appdata table
    const sql_query_insertfeelingText = `UPDATE appdata SET feelingText = ? WHERE userID = ?`;
    const [insertfeelingTextResult] = await connection.promise().query(sql_query_insertfeelingText, [feelingText, userID]);
    console.log(feelingText);
    // Call external NLP service
    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', {
        text: feelingText
      });
      console.log(response.data.response);

      // Update NLPOutput in appdata table
      const sql_query_insertNLPOutput = `UPDATE appdata SET NLPOutput = ? WHERE userID = ?`;
      const [insertNLPOutputResult] = await connection.promise().query(sql_query_insertNLPOutput, [response.data.response, userID]);
      console.log("2_done");
      return res.status(200).json({ response: response.data.response });
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (feelingsProcessingError) {
    console.error("Error checking for existing userEmail:", feelingsProcessingError);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// //================================================================================================
// function getuserReport(req, res) {  //Get all prescriptions
//   const sql_query = generatePrescriptionQuery("","");
//   connection.query(sql_query, (err, result) => {
//     if (err) throw err;
//     if (result.length === 0) {
//       res.status(404).json({ message: "No Prescriptions found in prescriptions list" });
//     } 
//     else {
//       const prescriptionArray = processQueryResult(result);
//       res.json(prescriptionArray);
//     }
//   });
// }
//================================================================================================
function signinUser(req, res) {
  const userEmail = req.params.userEmail;
  const userPassword = req.params.userPassword;
  if(userEmail.includes("@")){
    // Generate the SQL query to fetch user data based on email and password
    const sql_query = `SELECT * FROM mmuser WHERE userEmail = ? AND userPassword = ?`;

    connection.query(sql_query, [userEmail, userPassword], (err, result) => {
      if (err) throw err;

      if (result.length === 0) {
        console.log('no');
        res.status(404).json({ message: `Incorrect email or password.` });
      } else {
        console.log(result[0]);
        res.status(200).json({ key: 'user'});
      }
    });
  }
  else{
     // Generate the SQL query to fetch user data based on email and password
     const sql_query = `SELECT * FROM doctor WHERE dUsername = ? AND doctorPassword = ?`;

     connection.query(sql_query, [userEmail, userPassword], (err, result) => {
       if (err) throw err;
 
       if (result.length === 0) {
         console.log('no');
         res.status(404).json({ message: `Incorrect username or password.` });
       } else {
         console.log(result[0]);
         res.status(200).json({ key: 'doctor'});
       }
     });
  }
}

// Function to get user data by email
function getuserData(req, res) {
  const userEmail = req.params.userEmail;
  const sql_query = generatePrescriptionQuery("", "AND mmuser.userEmail = ?");

  console.log('SQL Query:', sql_query); // Log the SQL query
  console.log('Parameters:', userEmail); // Log the parameters

  connection.query(sql_query, [userEmail], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ message: "No user found in users list" });
    } else {
      const userArray = processQueryResult(result);
      res.status(200).json(userArray[0]);
    }
  });
}

// Function to generate the SQL query for retrieving user data
function generatePrescriptionQuery(joinConditions, whereConditions) {
  const sql_query = `
    SELECT mmuser.userID, mmuser.userPID, mmuser.name, mmuser.userEmail, mmuser.userPassword, mmuser.gender, 
    mmuser.profileImage, mmuser.education, mmuser.relationship, mmuser.phoneNumber, mmuser.languages, mmuser.facebooklink, mmuser.interests,
    mmuser.address, mmuser.city, mmuser.workExperience, mmuser.prescribedMedications, mmuser.commonDisorders, mmuser.mentalDisorders, mmuser.familyHistory, mmuser.CreatedAt,
    appdata.appdataID, appdata.screeningOutputs, appdata.appExcercises, appdata.personalityScore, appdata.depressionScore, appdata.CreatedAt AS appdataCreatedAt
    FROM mmuser
    LEFT JOIN appdata ON mmuser.userID = appdata.userID
    ${joinConditions}
    WHERE mmuser.userID IS NOT NULL ${whereConditions}`;
  return sql_query;
}

// Function to process query result and map it to the user data structure
function processQueryResult(result) {
  const userMap = {};
  result.forEach((row) => {
    const { userID, appdataID, profileImage } = row;

    if (!userMap[userID]) {
      userMap[userID] = {
        userID,
        userPID: row.userPID,
        name: row.name,
        userEmail: row.userEmail,
        gender: row.gender,
        profileImage: profileImage ? profileImage.toString('base64') : null,
        education: row.education,
        relationship: row.relationship,
        phoneNumber: row.phoneNumber,
        languages: row.languages,
        facebooklink: row.facebooklink,
        interests: row.interests,
        address: row.address,
        city: row.city,
        workExperience: row.workExperience,
        prescribedMedications: row.prescribedMedications,
        commonDisorders: row.commonDisorders,
        mentalDisorders: row.mentalDisorders,
        familyHistory: row.familyHistory,
        CreatedAt: row.CreatedAt,
        appdata: []
      };
    }
    if (appdataID !== null) {
      userMap[userID].appdata.push({
        appdataID,
        screeningOutputs: row.screeningOutputs,
        personalityScore: row.personalityScore,
        depressionScore: row.depressionScore,
        appExcercises: row.appExcercises,
        CreatedAt: row.appdataCreatedAt
      });
    }
  });
  console.log(userMap);
  return Object.values(userMap);
}

function updateuserByuserEmail (req, res){  // Get prescription by prescriptionId
  
}

//===============================================================================================
module.exports = {
  createuser,
  feelingsProcessing,
  // getuserReport,
  signinUser,
  getuserData,
  updateuserByuserEmail
};
