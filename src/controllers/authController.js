// express setting
const express = require("express");
const router = express.Router();
// import Middleware
const verifyToken = require("../middlewares/verifyToken");
const { canRegister } = require('../middlewares/accesscontrol');
// import custom utils
const httpStatus = require("../utils/httpStatus");
// import services
const AuthService = require('../services/authService');

/* hacky route that bypass all validation and accesscontrol checking!!!*/
/* ONLY USE TO CREATE ROOT USER ONCE */
/* DELETE the route after root is created !!! */

// @route POST api/v1/authentication/createRoot
router.post('/createRoot', async (req, res) => {
  try {
    const userObject = {
      //use your own unpredictable login account and password!  
      email: "root@root.com",
      password: "123456", // NEVER use this!!!!
      userType: "Admin",
    }
    const dispatcher = { displayName: "Me" }; // dispatcher in here is use for the Register service to log who is operating this action
    // initalize auth service instance
    const authServiceInstance = new AuthService();
    // call register service
    const { newUser, newUserData } = await authServiceInstance.Register(userObject, dispatcher);
    // response status and data 
    return res.status(httpStatus.OK).send({ newUser, newUserData });
  } catch (error) {
    // if the error is not defined, give status code of 500
    !error.status ? error.status = httpStatus.INTERNAL_SERVER_ERROR : error.status;
    // response status and data 
    return res.status(error.status).send(error.message);
  };
});


// @route POST api/v1/authentication/register
// In this example, only Admin can register new account
router.post('/register', verifyToken, canRegister, async (req, res) => {
  try {
    const userObject = req.body;
    const dispatcher = req.decoded;
    // initalize auth service instance
    const authServiceInstance = new AuthService();
    // call register service
    const { newUser, newUserData } = await authServiceInstance.Register(userObject, dispatcher);
    // response status and data 
    return res.status(httpStatus.OK).send({ newUser, newUserData });
  } catch (error) {
    // if the error is not defined, give status code of 500
    !error.status ? error.status = httpStatus.INTERNAL_SERVER_ERROR : error.status;
    // response status and data 
    return res.status(error.status).send(error.message);
  };
});

// @route POST api/v1/authentication/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userInput = { inputEmail: email, inputPassword: password };
    // initalize auth service instance
    const authServiceInstance = new AuthService();
    // call login service
    const { signedToken } = await authServiceInstance.Login(userInput);
    // response status and data 
    return res.status(httpStatus.OK).send({ token: signedToken });
  } catch (error) {
    // if the error is not defined, give status code of 500
    !error.status ? error.status = httpStatus.INTERNAL_SERVER_ERROR : error.status;
    // response status and data 
    return res.status(error.status).send(error.message);
  }

})


module.exports = router;