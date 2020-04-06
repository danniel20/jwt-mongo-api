const mongoose = require('../../database')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    require: true,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

UserSchema.pre('save', function(next){
  const hash = bcrypt.hashSync(this.password, 10)
  this.password = hash

  next()
})

UserSchema.pre('updateOne', function() {
  this.set({ updatedAt: new Date() });
})

const User = mongoose.model('User', UserSchema)

module.exports = User