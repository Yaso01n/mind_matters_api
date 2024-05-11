const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

//===================================================================================================
router.get('/organization', organizationController.getallOrganizations);
router.get('/organization/:organizationID', organizationController.getOrganizationByID);
//===================================================================================================

module.exports = router;
