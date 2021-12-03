require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');

const NotFoundError = require('./errors/not-found-err');
const users = require('./routes/users');
const movies = require('./routes/movies');
const signin = require('./routes/signin');
const signup = require('./routes/signup');

const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const corsOptions = require('./middlewares/cors');

const { PORT = 3000 } = process.env;
const app = express();

const { MONGODB, NODE_ENV } = process.env;
const DBPATH = NODE_ENV === 'production' ? MONGODB : 'mongodb://localhost:27017/moviesdb';
mongoose.connect(DBPATH, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use('*', corsOptions);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());
app.disable('x-powered-by');

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.use(signin);
app.use(signup);

app.use(requestLogger);
app.use(auth);

app.use(users);
app.use(movies);

app.all('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);

app.use(errors());

app.use((error, req, res, next) => {
  const { statusCode = 500, message } = error;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'Internal Server error' : message,
  });
  next();
});

app.listen(PORT, () => {
});
