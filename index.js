const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const { responseError } = require('./src/helpers/helpers');
const usersRouter = require('./src/routes/Users');

const app = express();
const port = process.env.port;
app.use(fileUpload());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use('/users', usersRouter);
app.use('*', (req, res, next) => {
  next(new Error('Endpoint Not Found'));
});

app.use((err, req, res, next) => {
  responseError(res, 'Error', 500, err.message, []);
});

app.listen(port, () => {
  console.log(`server running port ${port}`);
});
