const Movie = require('../models/movies');

const UncorectDataError = require('../errors/uncorect-data-err');
const NotFoundError = require('../errors/not-found-err');
const AccessError = require('../errors/access-err');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movie) => res.send(movie))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new UncorectDataError('Данные для создания фильма места введены с ошибкой, пожалуйста, проверьте поля и значения'));
      }
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(new Error('NotValidId'))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new AccessError('У вас недостаточно прав для удаления этого фильма');
      }
      return movie.remove().then(() => res.status(200).send({ message: 'Фильм удален' }));
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Такого фильма нет в базе'));
      }
      next(err);
    });
};
