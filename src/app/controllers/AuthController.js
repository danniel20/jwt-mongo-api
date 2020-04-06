const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')
require('dotenv').config()

const mailConfig = require('../config/mail.json')

module.exports = {
  
  async register(req, res){
    const { email }  = req.body

    try{
      if(await User.findOne({email})){
        return res.status(400).json({error: 'User already exists!'})
      }

      const user = await User.create(req.body)
      user.password = undefined

      res.json(user)
    }
    catch(err){
      res.status(400).json({error: 'Registration failed!'})
    }
  },

  async authenticate(req, res){
    const { email, password }  = req.body

    try{

      const user = await User.findOne({email}).select('+password')

      if(!user){
        return res.status(400).json({error: 'User not found!'})
      }

      if(!await bcrypt.compare(password, user.password)){
        return res.status(400).json({error: 'Invalid password!'})
      }

      user.password = undefined

      const now = Math.floor(Date.now() / 1000)

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        iat: now,
        exp: now + (60 * 60 * 24 * 1)
    }

      const token = jwt.sign(payload, process.env.TOKEN_AUTH_SECRET)

      res.json({...payload, token})
    }
    catch(err){
      res.status(400).json({error: 'Authenticate failed!'})
    }
  },

  async forgotPassword(req, res){
    const { email } = req.body

    try{
      const user = await User.findOne({email})

      if(!user){
        return res.status(400).json({error: 'User not found!'})
      }

      const now = new Date()
      now.setHours(now.getHours() + 1)

      const token = crypto.randomBytes(20).toString('hex')

      await User.updateOne(
        { _id: user._id }, 
        { $set: { passwordResetToken: token, passwordResetExpires: now } }
      )

      mailer.sendMail({
        to: email,
        from: mailConfig.sender,
        subject: 'Reset your password',
        template: 'auth/forgot_password',
        context: { token }
      }, (err, info) => {
        if(err){
          console.log(err)
          return res.status(400).json({error: 'Cannot send forgot password email'})
        }

        res.sendStatus(200)
      })
    }
    catch(err){
      res.status(400).json({error: 'Error on forgot password, try again.'})
    }

  },

  async resetPassword(req, res){
    const { email, token, password } = req.body

    try{
      const user = await User.findOne({email}).select('+passwordResetToken passwordResetExpires')

      if(!user){
        return res.status(400).json({error: 'User not found!'})
      }

      if(token != user.passwordResetToken){
        return res.status(400).json({error: 'Token invalid!'})
      }

      if(new Date() > user.passwordResetExpires){
        return res.status(400).json({error: 'Token expired, generate a new one'})
      }

      user.password = password
      await user.save()

      res.sendStatus(200)
    }
    catch(err){
      console.log(err)
      res.status(400).json({error: 'Cannot reset password, try again'})
    }
  }

}
