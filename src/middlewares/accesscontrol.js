const AccessControl = require("accesscontrol");
// import custom utils
const grants = require("../utils/userRoles");
const httpStatus = require("../utils/httpStatus");
// import logger
const logger = require('../../config/logger');
// access control init
const ac = new AccessControl(grants);

// config setting to control whether logging the success case of grant premission
// default set to false
let logSuccessCase = false; // better to use env variable or winston setting to control over

// A middleware to check if the user is premitted to access resources
canRegister = (req, res, next) => {
  // check the permission by this awesome syntax from npm package - accesscontrol  !🤑
  const permission = ac.can(req.decoded.userType).createAny('User');

  if (!permission.granted) {
    // log no premission event trigger
    const message = "No permission to access resources";
    const metadata = { issuer: req.decoded.displayName, action: "register", payload: req.body }
    logger.error({ message, metadata });
    res.status(httpStatus.FORBIDDEN).send({ message, metadata });
  } else {
    if (logSuccessCase) {
      const message = "Permission granted to access resources";
      const metadata = { issuer: req.decoded.displayName, action: "register", payload: req.body }
      logger.info({ message, metadata });
    }
    // next middleware
    next();
  }
}
module.exports = {
  canRegister,
};