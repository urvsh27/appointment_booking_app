// Import models
const usersModel = require('../models').users;

//Import controllers
const globalController = require('./globalController');

//Import files
const {
  successObjectResponse,
  errorObjectResponse,
  successArrayResponse,
  errorArrayResponse,
} = require('../utils/response');
const { IsNullOrEmpty, IsNotNullOrEmpty } = require('../utils/enum');
const {
  getHashedPassword,
  compareHashedPassword,
  createJwtToken,
} = require('../middlewares/auth');
const { userMessages } = require('../utils/messages');
const Sequelize = require('sequelize');
const db = require('../models/index');
const { error } = require('../validators/userUpdate.validator');

module.exports = {
  /*
   * Register
   * name : string
   * email : email
   * password : string
   */
  async register(req, res) {
    let successObjectRes = successObjectResponse;
    let errorObjectRes = errorObjectResponse;
    try {
      const { name, email, password } = req.body;
      let newUserId = '';
      await db.sequelize.transaction(
        {
          deferrable: Sequelize.Deferrable.SET_DEFERRED,
        },
        async (t1) => {
          const existingUserDetails = await globalController.getModuleDetails(
            usersModel,
            'findOne',
            { email: email },
            ['id', 'name', 'email'],
            true
          );
          if (IsNotNullOrEmpty(existingUserDetails.id)) {
            throw new Error(userMessages.userAlreadyExists);
          } else {
            const hashedPassword = await getHashedPassword(password);
            await usersModel
              .create(
                { name, email, password: hashedPassword },
                { transaction: t1 },
                { raw: true }
              )
              .then(async (newUserDetails) => {
                if (IsNotNullOrEmpty(newUserDetails.id)) {
                  newUserId = newUserDetails.id;
                } else {
                  throw new Error(userMessages.userRegisterFail);
                }
              })
              .catch(async (error) => {
                let message =
                  await globalController.getMessageFromErrorInstance(error);
                if (message) {
                  throw new Error(message);
                } else {
                  throw new Error(error.message);
                }
              });
          }
        }
      );
      successObjectRes.message = userMessages.userRegisterSuccess;
      successObjectRes.data = await globalController.getModuleDetails(
        usersModel,
        'findOne',
        { id: newUserId },
        ['id', 'name', 'email'],
        true
      );
      res.status(201).send(successObjectRes);
    } catch (error) {
      errorObjectRes.message = error.message;
      res.status(400).send(errorObjectRes);
    }
  },

  /*
   * Login
   * email : email
   * password : string
   */
  async login(req, res) {
    let successObjectRes = successObjectResponse;
    let errorObjectRes = errorObjectResponse;
    try {
      const { email, password } = req.body;
      const userDetails = await globalController.getModuleDetails(
        usersModel,
        'findOne',
        { email: email },
        [['id', 'userId'], 'name', 'email', 'password'],
        true
      );
      if (IsNullOrEmpty(userDetails.userId)) {
        throw new Error(userMessages.userNotFound);
      } else {
        const matchPassword = await compareHashedPassword(
          password,
          userDetails.password
        );
        if (matchPassword === true) {
          const token = await createJwtToken(userDetails.userId);
          delete userDetails.password;
          successObjectRes.message = userMessages.userLoginSuccess;
          successObjectRes.data = {
            accessToken: token,
            userDetails: userDetails,
          };
        } else {
          throw new Error(userMessages.userLoginFailure);
        }
      }
      res.status(201).send(successObjectRes);
    } catch (error) {
      errorObjectRes.message = error.message;
      res.status(400).send(errorObjectRes);
    }
  },

  /*
  Get all users
  */
  async getAllUsersDetails(req, res) {
    let successArrayRes = successArrayResponse;
    let errorArrayRes = errorArrayResponse;
    try {
      const allUsersDetails = await globalController.getModuleDetails(
        usersModel,
        'findAll',
        { activated: true, deleted: false },
        [['id', 'userId'], 'name', 'email'],
        true
      );
      if (IsNotNullOrEmpty(allUsersDetails)) {
        successArrayRes.message = userMessages.allUsersDetailsFound;
        successArrayRes.data = allUsersDetails;
      } else {
        throw new Error(userMessages.allUsersDetailsNotFound);
      }
      res.status(201).send(successArrayRes);
    } catch (error) {
      errorArrayRes.message = error.message;
      res.status(400).send(errorArrayRes);
    }
  },

  /*
   * Get single user details
   */
  async getUserDetails(req, res) {
    let successObjectRes = successObjectResponse;
    let errorObjectRes = errorObjectResponse;
    try {
      const userDetails = await globalController.getModuleDetails(
        usersModel,
        'findOne',
        { id: req.headers.loggedInUserId },
        [['id', 'userId'], 'name', 'email']
      );
      if (IsNullOrEmpty(userDetails)) {
        throw new Error(userMessages.userDetailsNotFound);
      } else {
        successObjectRes.message = userMessages.userDetailsFound;
        successObjectRes.data = userDetails;
      }
      res.status(201).send(successObjectRes);
    } catch (error) {
      errorObjectRes.message = error.message;
      res.status(400).send(errorObjectRes);
    }
  },

  /*
   * Update single user details
   */
  async updateUserDetails(req, res) {
    let successObjectRes = successObjectResponse;
    let errorObjectRes = errorObjectResponse;
    try {
      await db.sequelize.transaction(
        {
          deferrable: Sequelize.Deferrable.SET_DEFERRED,
        },
        async (t1) => {
          await usersModel
            .update(req.body,
              {
                where: { id: req.headers.loggedInUserId },
              },
              { transaction: t1 }
            )
            .then(async (userUpdated) => {
              if (userUpdated[0] === 1) {
                successObjectRes.data = await globalController.getModuleDetails(
                  usersModel,
                  'findOne',
                  {
                    id: req.headers.loggedInUserId,
                    activated: true,
                    deleted: false,
                  },
                  [['id', 'userId'], 'name', 'email'],
                  true
                );
                successObjectRes.message =
                  userMessages.userDetailsUpdateSuccess;
              } else {
                throw new Error(userMessages.userDetailsUpdateFail);
              }
            })
            .catch(async (error) => {
              let message = await globalController.getMessageFromErrorInstance(
                error
              );
              if (message) {
                throw new Error(message);
              } else {
                throw new Error(error.message);
              }
            });
        }
      );
      res.status(201).send(successObjectRes);
    } catch (error) {
      errorObjectRes.message = error.message;
      res.status(400).send(errorObjectRes);
    }
  },
};
