const express = require('express');
const cookieParser = require('cookie-parser');
const { logInUser, signInUser } = require('../middleware/authorization');
const Users = require('../utils/mongo-users-interface');

const auth = express();

auth.use(express.urlencoded({ extended: true }));
auth.use(express.json());
auth.use(cookieParser());

auth.post('/signup', async (req, res) => {
  try {
    let response;

    const {
      name, email, pass, confirmPass,
    } = req.body;

    if (pass !== confirmPass) {
      response = {
        ok: false,
        message: 'The passwords do not match',
      };
    }
    const successfullNewUserId = await signInUser({ name, email, pass });

    if (!successfullNewUserId) {
      response = {
        ok: false,
        message: 'Operation failed, no user was added to the database',
      };
    } else {
      response = {
        ok: true,
        message: 'User created successfully',
        user_id: successfullNewUserId,
      };
    }
    res.send(response);
  } catch (err) {
    throw new Error(err);
  }
});

auth.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const jsonWebToken = await logInUser({ username, password });
  if (jsonWebToken) {
    res.cookie('_auth', jsonWebToken, {
      maxAge: 1000 * 60 * 5,
    });
    res.send(`This now redirects to the panel... The given cookie is: </br> ${jsonWebToken}`);
  } else {
    res.send('Login Unsuccessfull');
  }
});

auth.post('/logout', async (req, res) => {

});

auth.post('/delete-all', async (req, res) => {
  const { pass } = req.body;
  const result = await Users.deleteAllItems(pass);
  res.send(result);
});

module.exports = auth;
