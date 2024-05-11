const express = require('express');
const router = express.Router();
const UserController = require("../controllers/userController");

//===================================================================================================
router.post('/user', UserController.createuser);
router.get('/user/:userID', UserController.getuserReport);
router.get('/user/:userEmail', UserController.getuserByuserEmail);
router.put('/user/:userEmail', UserController.updateuserByuserEmail);
//===================================================================================================

module.exports = router;
