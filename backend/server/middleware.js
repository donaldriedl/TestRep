const passport = require('passport');
const passportLocal = require('passport-local');
const bcrypt = require('bcrypt');
const User = require('../models/user.js');

passport.use(new passportLocal.Strategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async function(email, password, done) {
    const user = await User.findOne({ where: { email }});
    if (!user) {
      return done(null, false);
    }

    const valid = await bcrypt.compare(password, user.pass);
    if (valid) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  const user = await User.findByPk(id);
  done(null, user);
});

module.exports = passport;