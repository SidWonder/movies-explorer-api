const bcrypt = require('bcryptjs');
const User = require('../models/users');

const UncorectDataError = require('../errors/uncorect-data-err');
const UserExistError = require('../errors/user-exist-err');

module.exports.createUser = (req, res, next) => {
  const {
    // eslint-disable-next-line no-unused-vars
    name, email, password,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      User.findOne({ email }).select('+password')
        .then((searchedUser) => {
          if (!searchedUser) {
            User.create({
              name, email, password: hash,
            })
              .then((user) => res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
              }));
          } else {
            throw new UserExistError('Пользователь с данным email уже существует');
          }
        })
        .catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            next(new UserExistError('Пользователь с данным email уже существует'));
          }
          if (err.name === 'ValidationError') {
            next(new UncorectDataError('Данные для создания пользователя введены с ошибкой, пожалуйста, проверьте поля и значения'));
          }
          next(err);
        });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new UncorectDataError('Данные для создания пользователя введены с ошибкой, пожалуйста, проверьте поля и значения'));
      }
      next(err);
    });
};
