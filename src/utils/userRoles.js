const grants = {
  Admin: { // indicate the role 
    User: { // indicate the resources of the role can access 
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    }
  },
  Normal: {
    User: {
      "read:own": ['email', 'password'],
      "update:own": ['email', 'password'],
    }
  }
};
module.exports = grants;
