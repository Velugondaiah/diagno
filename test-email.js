const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'diagnoaiteam1@gmail.com',
    pass: 'cqfqihpyftpisgmi'
  }
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: 'your.email@gmail.com',
      to: 'test.recipient@gmail.com',  // Your test email
      subject: 'Test Email',
      text: 'If you receive this, email sending is working!'
    });
    console.log('Test email sent:', info.response);
  } catch (error) {
    console.error('Test email failed:', error);
  }
}

testEmail(); 