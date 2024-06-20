const express = require('express');
const router = express.Router();
const UserController = require("../controllers/userController");

//===================================================================================================
router.post('/user', UserController.createuser);
router.post('/user/ExpressFeeling/:userEmail', UserController.feelingsProcessing);
// router.get('/user/:userID', UserController.getuserReport);
router.get('/user/:userEmail/:userPassword', UserController.signinUser);
router.get('/user/:userEmail', UserController.getuserData);
router.put('/user/:userEmail', UserController.updateuserByuserEmail);
//===================================================================================================

module.exports = router;
