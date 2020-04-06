const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt
require('dotenv').config()

const User = require('../models/User')

const params = {
  secretOrKey: process.env.TOKEN_AUTH_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const strategy = new Strategy(params, async (payload, done) => {
  try{
    const user = await User.findOne({_id: payload.id})
    done(null, user ? {...payload} : false)
  }
  catch(err){
    done(err, false)
  }
})

passport.use(strategy)

module.exports = {
  authenticate: () => passport.authenticate('jwt', { session: false })
}
