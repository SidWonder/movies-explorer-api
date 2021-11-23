const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUser, updateProfile,
} = require('../controllers/users');
// const isURL = require('../utils/isUrl');

router.get('/me', getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);

module.exports = router;
