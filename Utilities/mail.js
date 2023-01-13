const nodemailer=require('nodemailer')

const MAIL_SETTINGS= {
    service: 'gmail',
    auth: {
      user: process.env.AUTH_USER,
      pass: process.env.AUTH_PASS
      
    },
     otp:`${Math.floor(1000+Math.random()*9000)}`
    
  }
  const transporter = nodemailer.createTransport(MAIL_SETTINGS);

  module.exports={
  transporter,
  MAIL_SETTINGS
}