/* eslint-disable linebreak-style */
const Card = require('../models/cards');

const UncorectDataError = require('../errors/uncorect-data-err');
const NotFoundError = require('../errors/not-found-err');
const AccessError = require('../errors/access-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new UncorectDataError('Данные для создания карточки места введены с ошибкой, пожалуйста, проверьте поля и значения'));
      }
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new Error('NotValidId'))
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        throw new AccessError('У вас недостаточно прав для удаления этой карточки');
      }
      card.remove().then(() => res.status(200).send({ message: 'Карточка удалена' }));
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Такой карточки нет в базе'));
      }
      next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Такой карточки нет в базе'));
      }
      if (err.name === 'ValidationError') {
        next(new UncorectDataError('Данные для проставления лайка некорректные, пожалуйста, проверьте запрос и попробуйте снова'));
      }
      if (err.name === 'CastError') {
        next(new UncorectDataError('Такой карточки не существет'));
      }
      next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Такой карточки нет в базе'));
      }
      if (err.name === 'ValidationError') {
        next(new UncorectDataError('Данные для удаления лайка некорректные, пожалуйста, проверьте запрос и попробуйте снова'));
      }
      if (err.name === 'CastError') {
        next(new UncorectDataError('Такой карточки не существет'));
      }
      next(err);
    });
};
