import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import connectPgSimple from 'connect-pg-simple';

import './config/passport';
import dbConnection from './models/dbConnection';
import poll from './routes/poll';
import auth from './routes/auth';
import error from './routes/error';
import twitterRedirect from './utils/twitterRedirect';

const app = express();
app.enable('trust proxy');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    store: new (connectPgSimple(session))({
      conString: process.env.DATABASE_URL
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../client/build')));

// passport-Facebook login
app.get('/login/twitter', passport.authenticate('twitter'));
app.get('/login/twitter/return', passport.authenticate('twitter', twitterRedirect()));

// all routing
app.use('/auth', auth);
app.use('/api/poll', poll);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.use('', error);

dbConnection.then((db) => {
  app.set('db', db);

  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
});
