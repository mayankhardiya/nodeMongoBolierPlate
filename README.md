# nodejs-backend-boilerplate
A custom node.js boilerplate with register &amp; login, featured on JWT authentication, role base access control, winston logging, mongoDB and simple use 🙂

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Guide](#guide)
- [Run in development](#run-in-development)
- [Run in production](#run-in-production)
- [Project Structure](#project-structure)
- [Features](#features)
  - [JWT Authentication](#jwt-authentication)
  - [Role Base Access Control](#role-base-access-control)
  - [CRUD Logging to MongoDB](#crud-logging-to-mongodb)
  
## Prerequisites
- [MongoDB](https://www.mongodb.com/)
- [Node.js 12+](https://nodejs.org/en/) (I was using -v 12.13.1 when make this boilerplate)

## Installation
    git clone https://github.com/ChunHoLum/nodejs-backend-boilerplate.git
    cd nodejs-backend-boilerplate
    npm install

In `.env` file, replace the config to your own setting

    DB_CONNECTION=mongodb+srv:// YOU_DB_URI
    JWT_ISSUER=YOUR_APPLICATION_NAME
    JWT_EXPIRES=YOUR_EXPPIRES_TIME_IN_MS
    JWT_SECRETORKEY=YOU_JWT_SECRETORKEY
    
## Guide

In this boilerplate, there are two types of user: Admin & Normal User.
|  | Admin | Normal User |
| --- | --- | --- |
| Create User| Any | - |
| Read User| Any  | Own |
| Update User| Any  | Own |
| Delete User| Any  | - |


Admin can operate CRUD on all user, normal user can only Read and Update their own user properties

(Only create user is implemented in the code, other CRUD function are not included)

By default, the database have no any user records, so we have to be a bit hacky to create a admin account.

In `/src/controllers/authController.js`, we have a special route to achieve this
```js
/* hacky route that bypass all validation and accesscontrol checking!!!*/
// @route POST api/v1/authentication/createRoot
router.post('/createRoot', async (req, res) => {
  ...
});
```
Use [Postman](https://www.postman.com/) or other tools to call the API

`POST api/v1/authentication/createRoot`

**[Important !] You should only use once to create admin account, delete the code after creation**

Now you could login the admin account and register other accounts through the APIs

## Run in development

    npm run dev:start

The successful run message should shown as follow:
[![cap.png](https://i.postimg.cc/JhWwZx0t/cap.png)](https://postimg.cc/k2whdxxd)

## Run in production
This boilerplate is not fully tested, don't use in any production environment directly

## Project Structure
    📦node-backend-boilerplate
     ┣ 📂config
     ┃ ┣ 📄db.js                  //mongoose config
     ┃ ┗ 📄logger.js              //logger config
     ┣ 📂node_modules
     ┣ 📂src
     ┃ ┣ 📂controllers
     ┃ ┃ ┗ 📄authController.js    //control route for user register & login
     ┃ ┣ 📂middlewares
     ┃ ┃ ┣ 📄accesscontrol.js     //access control middleware
     ┃ ┃ ┗ 📄verifyToken.js       //JWT verify middleware
     ┃ ┣ 📂models
     ┃ ┃ ┗ 📄User.js              //user model
     ┃ ┣ 📂services
     ┃ ┃ ┗ 📄authService.js       //business logic of regiser & login
     ┃ ┗ 📂utils
     ┃ ┃ ┣ 📄customError.js       //custom error for easier handling
     ┃ ┃ ┣ 📄httpStatus.js        //make http status code readable
     ┃ ┃ ┣ 📄jwtModule.js         //jwt core functions
     ┃ ┃ ┗ 📄userRoles.js         //user access grant inventory
     ┣ 📄.env                     //environment variable setting
     ┣ 📄app.js                   //app setup
     ┣ 📄LICENSE    
     ┣ 📄package.json
     ┗ 📄server.js                //starting point to run
(File tree generate by [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Shinotatwu-DS.file-tree-generator))

The file structure is inspired by a github project [bulletproof-nodejs](https://github.com/santiq/bulletproof-nodejs).

However, I want to build a more light-weight and easy-config boilerplate for self use.

The main conecpt of this structure is to move all business logic from the controller to the services layer. 

## Features 
### JWT Authentication
If you are new to JWT, find out details in [introduction](https://jwt.io/introduction/).
  
For simple, you can use `/src/middleware/verifyToken` as a middleware to protect the route you want. 
  
A JWT token will be generate when a user is login, a JWT token containing a payload of Object, you can decode the token and retrieve the Object.
  
In this boilerplate, user type (Admin/ Normal User) is placed in the payload, so everytime the middleware run through the routing, it can catch the current user's user type. It can help us to do a further access control.
 
I learn and modify this feature from a github project [node-api-jwt](https://github.com/bobmacneal/node-api-jwt)
 
### Role Base Access Control
There are many ways to implement a Role Base Access Control. In this boilerplate, I used npm package [accesscontrol](https://www.npmjs.com/package/accesscontrol)

I use this package because it has a awesome readable API: e.g. `ac.can(role).create(resource)`. Check out more usage in their [site](https://www.npmjs.com/package/accesscontrol).

On top of this package, I decided to use a middleware to wrap up the access control flow.
```js
// first we verify the JWT token, then we check the premission by middleware "canRegister"
router.post('/register', verifyToken, canRegister, async (req, res) => {...}
```

In the above example, I used a custom middleware "canRegister" to perform the access control. In this way, the code is more readable and the logic can sperate.

Inside of the "canRegister" middleware
```js
canRegister = (req, res, next) => {
  // check the permission by this awesome syntax from npm package - accesscontrol  !🤑
  const permission = ac.can(req.decoded.userType).createAny('User');
  // if there is no permission
  if (!permission.granted) { 
    // not permitted
    ...
  } else {
    // permitted
    // next middleware
    next();
  }
}
// dont forget to export your middleware
module.exports = {
  canRegister,
};
```
The following is an extra example (not in the boilerplate) that check in details of using resource attributes:
Usage: check if user have to right to register a type of user

```js
// First, you should define the user permission

//src/utils/userRoles.js
const grants = {
  Admin: { // indicate the role 
    User: { // indicate the resources of the role can access 
      "create:any": ['Admin', 'Staff' ,'NormalUser'], //Admin can create Admin, Staff or Normal User account
      ...
    }
  },
  Staff: {
    User: {
      "create:any": ['NormalUser'], //Staff can create only Normal User account
      ...
    }
  },
  NormalUser: {
    User: {
      ...
    }
  }
};
```

```js
// Second, implement the middleware

//src/middleware/accesscontrol.js
canRegister = (req, res, next) => {
  // check the permission by this awesome syntax from npm package - accesscontrol  !🤑
  const permission = ac.can(req.decoded.userType).createAny('User');
  // The trick is here
  // permission.attributes.indexOf(req.body.accountData.userType) < 0) will check if the current user is permitted to create a certain account type.
  
  if (!permission.granted || permission.attributes.indexOf(req.body.accountData.userType) < 0) {
    // not permitted
    ...
  } else {
    // permitted
    // next middleware
    next();
  }
}
```
Also, before create your own access control middleware, be aware of ACTION:own requires you to also check for the actual possession. Check for [more](https://github.com/onury/accesscontrol/issues/14#issuecomment-328316670).


### CRUD Logging to MongoDB

For loggin user operation, I used [winston](https://www.npmjs.com/package/winston) and [winston-mongodb](https://www.npmjs.com/package/winston-mongodb) since it is easy config and powerful.

```js
// config/logger.js
// Winston logger config
const { createLogger, transports, format } = require('winston');
require('winston-mongodb');

const logger = createLogger({
  transports: [
    new transports.MongoDB({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      options: { useUnifiedTopology: true },
      db: process.env.DB_CONNECTION, // connect the database with winston-mongodb
      collection: 'logger'  // collection name of your logs
    })
  ]
})

module.exports = logger;
```

To log a message to mongoDB, simpliy run
```js
logger.info({ message: "Log this message" });
```

To log a message and object to mongoDB, run
```js
logger.info({ message: "Log this message", metadata: { yourObject } });
```

Then, in every business logic you implemented in the services, add a logger in it, that's all!
