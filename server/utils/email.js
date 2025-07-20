// const nodemailer = require('nodemailer');
// const pug = require('pug');
// const htmlToText = require('html-to-text');

// exports.sendEmail = async (options, url, userName) => {
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });

//   const html = pug.renderFile(`${__dirname}/../views/test.pug`);

//   console.log(htmlToText.FromString(html));
//   // 2) Define the email options
//   const mailOptions = {
//     from: options.sender,
//     to: options.email,
//     subject: options.subject,
//     html,
//     text: htmlToText.FromString(html),
//     replyTo: options.replyTo
//   };

//   // 3)send the email
//   await transporter.sendMail(mailOptions);
// };

const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user, url).sendEmail();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_SENDER;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  //send the actual email
  async send(template, subject) {
    //1)Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    //2)Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    //3)Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes'
    );
  }
};
