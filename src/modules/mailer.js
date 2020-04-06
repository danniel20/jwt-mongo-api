const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

const mailConfig = require('../config/mail.json')

// Create a SMTP transporter object
const transport = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  auth: {
    user: mailConfig.user,
    pass: mailConfig.password
  }
})

const handleBarOptions = {
  viewEngine: {
    extName: '.html',
    partialsDir: path.resolve('./src/resources/mail/'),
    layoutsDir: path.resolve('./src/resources/mail/'),
    defaultLayout: 'auth/forgot_password.html',
  },
  viewPath: path.resolve('./src/resources/mail/'),
  extName: '.html'
}

transport.use('compile', hbs(handleBarOptions))

module.exports = transport
