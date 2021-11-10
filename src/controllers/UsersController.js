const UsersModel = require('../models/Users');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const { genAccessToken, genVerifEmailToken } = require('../helpers/jwt');
const { responseError, response, responseCookie, sendVerifEmailRegister } = require('../helpers/helpers');

const register = async (req, res, next) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const data = {
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt),
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    };
    const checkExistUser = await UsersModel.checkExistUser(req.body.email, 'email');
    if (checkExistUser.length > 0) {
      responseError(res, 'E-mail already resgistered', 422, 'E-mail already resgistered', []);
    } else if (checkExistUser.length === 0) {
      const insertUser = await UsersModel.insterUser(data);
      if (insertUser.affectedRows) {
        delete data.password;
        response(res, 'success', 200, 'Successfully added user data', data);
        const token = await genVerifEmailToken({ ...data, user_id: insertUser.insertId }, { expiresIn: '30000ms' });
        await sendVerifEmailRegister(token, data.email);
      }
    }
  } catch (error) {
    next(error);
  }
};

const verifEmail = async (req, res, next) => {
  try {
    Jwt.verify(req.params.token, process.env.VERIF_EMAIL_TOKEN_SECRET, async (err, decode) => {
      if (err) {
        return responseError(res, 'Verif failed', 403, 'Verif Register Email failed', err);
      }
      const checkExistUser = await UsersModel.checkExistUser(decode.email, 'email');
      if (checkExistUser.length > 0) {
        const updateVerifEmail = await UsersModel.updateUser({ email_verified: 1 }, decode.user_id);
        if (updateVerifEmail.affectedRows) {
          return response(res, 'success', 200, 'successfully verified email', []);
        }
      } else {
        responseError(res, 'Not Found', 404, 'User not found', []);
      }
    });
  } catch (error) {
    next(error);
  }
};

const resendVerifEmail = async (req, res, next) => {
  try {
    const checkExistUser = await UsersModel.checkExistUser(req.body.email, 'email');
    if (checkExistUser.length > 0) {
      delete checkExistUser[0].password;
      if (checkExistUser[0].email_verified === 0) {
        const token = await genVerifEmailToken({ ...checkExistUser[0] }, { expiresIn: '30000ms' });
        await sendVerifEmailRegister(token, checkExistUser[0].email);
        response(res, 'success', 200, 'successfully resend verification email', []);
      } else {
        response(res, 'email is verified', 200, 'email is verified', []);
      }
    } else {
      responseError(res, 'Not Found', 404, 'User not found', []);
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const checkExistUser = await UsersModel.checkExistUser(req.body.email, 'email');
  if (checkExistUser.length > 0) {
    if (checkExistUser[0].email_verified === 0) {
      return responseError(res, 'Email not verified', 403, 'Email has not been verified', {});
    }
    const comparePassword = await bcrypt.compare(req.body.password, checkExistUser[0].password);
    if (comparePassword) {
      delete checkExistUser[0].password;
      const accessToken = await genAccessToken({ ...checkExistUser[0] }, { expiresIn: 60 * 60 * 2 });
      responseCookie(
        res,
        'Success',
        200,
        'Login success',
        { ...checkExistUser[0] },
        { accessToken },
        {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        }
      );
    } else {
      responseError(res, 'Authorized failed', 401, 'Wrong password', {
        password: 'passwords dont match',
      });
    }
  } else {
    responseError(res, 'Authorized failed', 401, 'User not Found', {
      email: 'email not found',
    });
  }
};

const home = async (req, res, next) => {
  try {
    const dataUser = await UsersModel.checkExistUser(req.userLogin.user_id, 'user_id');
    res.json(`Hello ${dataUser[0].first_name}`);
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const allUsers = await UsersModel.allUsers();
    allUsers.forEach((user) => delete user.password);
    response(res, 'success', 200, 'data list user', allUsers);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const checkExistUser = await UsersModel.checkExistUser(req.params.id, 'user_id');
    if (checkExistUser.length > 0) {
      const data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
      };
      const updateUser = await UsersModel.updateUser(data, req.params.id);
      if (updateUser.affectedRows) {
        response(res, 'success', 200, 'succesfuly update user', data);
      } else {
        responseError(res, 'failed', 500, 'failed update data user', []);
      }
    } else {
      responseError(res, 'Not Found', 404, 'User not found', []);
    }
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const checkExistUser = await UsersModel.checkExistUser(req.params.id, 'user_id');
    if (checkExistUser.length > 0) {
      const deleteUser = await UsersModel.deleteUser(req.params.id);
      if (deleteUser.affectedRows) {
        response(res, 'success', 200, 'succesfuly delete user data', []);
      } else {
        responseError(res, 'failed', 500, 'failed delete data user', []);
      }
    } else {
      responseError(res, 'Not Found', 404, 'User not found', []);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, verifEmail, resendVerifEmail, home, listUsers, updateUser, deleteUser };
