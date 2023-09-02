// Import models
const usersModel = require('../models').users;

//Import controllers
const globalController = require('./globalControllers'); 

//Import files
const {successObjectResponse,errorObjectResponse} = require('../utils/response');
const { IsNullOrEmpty ,IsNotNullOrEmpty } = require('../utils/enum');
const { getHashedPassword , compareHashedPassword, createJwtToken} = require('../middlewares/auth');
const { userMessages } = require('../utils/messages');

module.exports = {
  // Register
  async register(req, res) {
    let successObjectRes = successObjectResponse;
    let errorObjectRes = errorObjectResponse;
    try {
      const { name, email, password } = req.body;
      await usersModel
        .findOne({ email: email })
        .then(async (existingUserDetails) => {
          if (IsNotNullOrEmpty(existingUserDetails)) {
            throw new Error(userMessages.userAlreadyExists);
          } else {
            const hashedPassword = await getHashedPassword(password);
            await user
              .save()
              .then(async (newUserDetails) => {
                if(IsNullOrEmpty(newUserDetails)){
                  throw new Error(userMessages.userRegisterFail);
                }else{
                  successObjectRes.message = userMessages.userRegisterSuccess;
                  successObjectRes.data = newUserDetails;
                }
              })
              .catch((error) => {
                throw new Error(error.message);
              });
          }
        })
        .catch((error) => {
          throw new Error(error.message);
        });
      res.status(201).send(successObjectRes);
    } catch (error) {
      errorObjectRes.message = error.message;
      res.status(400).send(errorObjectRes);
    }
  },

   // Login
  async login(req, res) {
      let successObjectRes = successObjectResponse;
      let errorObjectRes = errorObjectResponse;
      try {
        const {  email, password } = req.body;
        await usersModel.findOne({ email: email }).select('_id name email password').then(async (existingUserDetails) => {
            if (IsNullOrEmpty(existingUserDetails)) {
              throw new Error(userMessages.userNotFound);
            } else{
              const matchPassword = await compareHashedPassword(password, existingUserDetails.password);
              if(matchPassword===true){
                let userDetails = await globalController.getModuleDetails(usersModel, 'findOne', {email:email}, {_id : 1, name : 1, email :1 });
                const token = await createJwtToken(userDetails._id);
                successObjectRes.message = userMessages.userLoginSuccess;
                successObjectRes.data = { accessToken : token , userDetails : userDetails};
              }else{
                throw new Error(userMessages.userLoginFailure);
              } 
            }         
          })
          .catch((error) => {
            throw new Error(error.message);
          });
        res.status(201).send(successObjectRes);
      } catch (error) {
        errorObjectRes.message = error.message;
        res.status(400).send(errorObjectRes);
      }
  },

   // user auth
   async userAuth(req, res) {
    let successObjectRes = successObjectResponse;
    let errorObjectRes = errorObjectResponse;
    try {
      res.status(201).send(successObjectRes);
    } catch (error) {
      errorObjectRes.message = error.message;
      res.status(400).send(errorObjectRes);
    }
},
};
