const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // doing by SendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // do the actual sending - basically sending an email
  async send(template, subject) {
    const renderHTML = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: renderHTML,
      text: htmlToText.fromString(renderHTML),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // for sending welcome message when someone created a new account
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Broom Broom Bike');
  }

  // for sending password reset when a user forgot his account
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Reset Password Instructions for Broom Broom Account'
    );
  }
  async sendPasswordResetSuccessful() {
    await this.send('resetSuccess', 'Your Password Reset Successfully');
  }

  async newBicycleBooked() {
    await this.send('newBooking', 'Booked a bicycle successfully');
  }
}

// If this email address was used to create an account, instructions to reset your password will be sent to you. Please check your email.

module.exports = Email;
