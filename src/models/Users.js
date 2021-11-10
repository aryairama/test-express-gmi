const { error } = require('console');
const connection = require('../configs/db');
const { promiseResolveReject } = require('../helpers/helpers');

const checkExistUser = (fieldValue, field) =>
  new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM users WHERE ${field} = ?`, fieldValue, (error, result) => {
      promiseResolveReject(resolve, reject, error, result);
    });
  });

const insterUser = (data) =>
  new Promise((resolve, reject) => {
    connection.query('INSERT INTO users set ?', data, (error, result) => {
      promiseResolveReject(resolve, reject, error, result);
    });
  });

const updateUser = (data, id) =>
  new Promise((resolve, reject) => {
    connection.query('UPDATE users set ? where user_id = ?', [data, id], (error, result) => {
      promiseResolveReject(resolve, reject, error, result);
    });
  });

const allUsers = () =>
  new Promise((resolve, reject) => {
    connection.query('SELECT * FROM users', (error, result) => {
      promiseResolveReject(resolve, reject, error, result);
    });
  });

const deleteUser = (userId) =>
  new Promise((resolve, reject) => {
    connection.query('DELETE FROM users where user_id = ?', userId, (error, result) => {
      promiseResolveReject(resolve, reject, error, result);
    });
  });
module.exports = { checkExistUser, insterUser, updateUser, allUsers, deleteUser };
