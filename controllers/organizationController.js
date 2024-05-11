const axios = require('axios');
const Joi = require('joi');
const connection = require('../DataBase/connection'); // Import the connection module 
require('dotenv').config();

//==================================================================================================================
function getallOrganizations(req, res) {         //Get All Organizations
  const sql_query = generateRecordQuery('', '');
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.status(404).json({ message: 'No Organization found in Organizations list' });
    } else {
      const records = processQueryResult(result);
      res.status(200).json(records);
    }
  });
}
//==================================================================================================================
function getOrganizationByID(req, res) {  //Get All Organizations By organizationID
  const organizationID = req.params.organizationID;
  const sql_query = generateRecordQuery('', `AND organization.orgID = ${organizationID}`);
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.status(404).json({ message: `Organization with ID ${organizationID} not found.` });
    } else {
      const records = processQueryResult(result);
      res.status(200).json(records);
    }
  });
}

// ============================================================================================================
function generateRecordQuery(joinConditions, whereConditions) {   // Function to generate the common SQL query for retrieving records
  select_query = `
  SELECT organization.orgID, organization.oname, organization.contact, organization.urgentNumber, organization.speciality, organization.location, organization.organizationImage, 
  organization.payement, organization.availableTime, organization.ostatus,
  FROM organization
  ${joinConditions}
  WHERE organization.orgID IS NOT NULL ${whereConditions}`;

  return select_query;
}
//==========================================================================================================================
function processQueryResult(result) {          //Function to process the query result and build the record map
  const organizationMap = {};

  
  result.forEach((row) => {
    const {orgID} = row;

    if (!organizationMap[orgID]) {
      organizationMap[orgID] = {
        orgID,
        oname: row.oname,
        contact: row.contact,
        urgentNumber: row.urgentNumber,
        speciality: row.speciality,
        location: row.location,
        organizationImage: row.organizationImage,
        payement: row.payement,
        availableTime: row.availableTime,
        ostatus: row.ostatus,
      };
    }

    // if (orgID != null && !uniqueNutritionIDs.has(orgID)) {        // Check if NutritionID is not null 
    //   uniqueNutritionIDs.add(orgID);
    //   recordMap[orgID].Nutrition.push({ DietPlan: row.DietPlan, Inbody: row.Inbody });
    // }
  });

  return Object.values(organizationMap);
}
//===============================================================================================
module.exports = {
    getallOrganizations,
    getOrganizationByID
  };