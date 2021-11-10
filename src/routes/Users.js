const express = require('express');
const usersController = require('../controllers/UsersController');
const { Auth } = require('../middlewares/Auth');

const router = express.Router();

router
  .post('/auth/register', usersController.register)
  .post('/auth/verif-email/:token', usersController.verifEmail)
  .post('/auth/resend-verif-email', usersController.resendVerifEmail)
  .post('/auth/login', usersController.login)
  .get('/home', Auth, usersController.home)
  .get('/', Auth, usersController.listUsers)
  .put('/:id', Auth, usersController.updateUser)
  .delete('/:id', Auth, usersController.deleteUser);

module.exports = router;
