var express = require('express');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var ensureLogin = require('connect-ensure-login');
var massive = require('massive');

var dbUsers = require('./db/users');
var secret = require('./secret');

passport.use(new localStrategy(
    function (username, password, cb) {
        dbUsers.findByUsername(username, function (err, userObj) {
            if(err) { return cb(err); }
            if(!userObj) { return cb(null, false); }
            if(userObj.password != password) { return cb(null, false); }
            return cb(null, userObj);
        });
    }
));

passport.use(new facebookStrategy({
    clientID: secret.FB_CLIENT_ID,
    clientSecret: secret.FB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/login/facebook/return',
    profileFields: ['id', 'displayName', 'email']
}, function (accessToken, refreshToken, profile, cb) {

    return cb(null, profile);

}));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    dbUsers.findById(id, function (err, user) {
        if(err) { return cb(err); }
        cb(null, user);
    });
});

var app = express();

//middlewares
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: secret.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('home', {user: req.user});
});


//Passport-Local Login
app.post('/login', passport.authenticate('local', { failureRedirect: '/'} ), function (req, res) {
    res.redirect('/');
});

//passport-Facebook login
app.get('/login/facebook', passport.authenticate('facebook', {authType: 'rerequest', scope: ['email'] } ));

app.get('/login/facebook/return', passport.authenticate('facebook', {
    failureRedirect: '/'
}), function (req, res) {
    res.redirect('/');
});


app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/mypolls', ensureLogin.ensureLoggedIn('/'), function (req, res) {
    res.render('mypolls', {user: req.user});
});

app.get('/newpoll', ensureLogin.ensureLoggedIn('/'), function (req, res) {
    res.render('newpoll', {user: req.user});
});

app.post('/signup', function (req, res) {
    var displayName = req.body.displayName;
    var username = req.body.username;
    var password = req.body.password;

    //TODO: do express validation
    var db = req.app.get('db');
    db.users.findOne({
        username: username
    }).then((user) => {
        if(!user) {

            db.users.insert({
                displayname: displayName,
                username: username,
                password: password
            }).then((newUser) => {

                //TODO: redirected logged in auth
                return res.status(200).send(newUser);

            });

        } else {
            //TODO: message username has been taken
            return res.redirect('/');
        }
    });


});

massive(secret.DB_URI)
    .then((db) => {
        app.set('db', db);

        app.listen(3000, function () {
            console.log('Listening on port 3000');
        });
    });
