const nodemailer = require('nodemailer');
require('dotenv').config();

// Test Gmail SMTP connection
async function testGmailConnection() {
  console.log('🧪 Testing Gmail SMTP Configuration...');
  console.log('📧 Gmail User:', process.env.GMAIL_USER);
  console.log('🔑 App Password Length:', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 'NOT SET');
  console.log('🔑 App Password (masked):', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.replace(/./g, '*') : 'NOT SET');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove spaces
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Step 1: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    console.log('📤 Step 2: Sending test email...');
    const testEmail = {
      from: {
        name: 'AYUSH EMR System',
        address: process.env.GMAIL_USER
      },
      to: process.env.GMAIL_USER, // Send to yourself for testing
      subject: '🧪 Test Email - AYUSH EMR OTP System',
      html: `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #0f766e;">✅ Gmail SMTP Test Successful!</h2>
          <p>This is a test email to verify that your Gmail SMTP configuration is working correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${process.env.GMAIL_USER}</p>
          <p style="color: #059669;">🎉 Your OTP system should now work properly!</p>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('🎉 Gmail SMTP is working correctly!');

  } catch (error) {
    console.log('❌ Gmail SMTP Error:');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('');
      console.log('🔧 SOLUTION: Authentication failed');
      console.log('1. Make sure 2-Step Verification is enabled on your Google account');
      console.log('2. Generate a new App Password at: https://myaccount.google.com/apppasswords');
      console.log('3. Use the 16-character app password (not your regular Gmail password)');
      console.log('4. Remove all spaces from the app password in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('🔧 SOLUTION: Connection refused');
      console.log('1. Check your internet connection');
      console.log('2. Make sure Gmail SMTP is not blocked by firewall');
    }
    
    console.log('');
    console.log('Full error object:', error);
  }
}

// Run the test
testGmailConnection().then(() => {
  console.log('');
  console.log('🏁 Test completed!');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});