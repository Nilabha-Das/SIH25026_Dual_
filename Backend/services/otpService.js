const nodemailer = require('nodemailer');

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter (using Gmail SMTP)
const createTransporter = () => {
  console.log('Creating email transporter...');
  console.log('Gmail User:', process.env.GMAIL_USER);
  console.log('Gmail App Password length:', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 'NOT SET');
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove spaces from app password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Store OTP with expiration (5 minutes)
function storeOTP(email, otp) {
  const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStorage.set(email, {
    otp: otp,
    expiresAt: expirationTime,
    attempts: 0
  });
  console.log(`OTP stored for ${email}: ${otp} (expires at ${new Date(expirationTime)})`);
}

// Verify OTP
function verifyOTP(email, providedOTP) {
  const storedData = otpStorage.get(email);
  
  if (!storedData) {
    return { success: false, message: 'No OTP found. Please request a new one.' };
  }
  
  if (Date.now() > storedData.expiresAt) {
    otpStorage.delete(email);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  if (storedData.attempts >= 3) {
    otpStorage.delete(email);
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  if (storedData.otp !== providedOTP) {
    storedData.attempts++;
    return { success: false, message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.` };
  }
  
  // Success - remove OTP from storage
  otpStorage.delete(email);
  return { success: true, message: 'OTP verified successfully!' };
}

// Send OTP email
async function sendOTPEmail(email, name) {
  try {
    console.log(`🚀 Attempting to send OTP to ${email} for ${name}`);
    
    const otp = generateOTP();
    const transporter = createTransporter();
    
    // Verify transporter configuration
    console.log('📧 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    const mailOptions = {
      from: {
        name: 'AYUSH EMR System',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: '🔐 Your AYUSH EMR Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏥 AYUSH EMR</h1>
            <p style="color: #e6fffa; margin: 10px 0 0 0; font-size: 16px;">Secure Medical Records Portal</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hello ${name}! 👋</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              To complete your secure login to AYUSH EMR, please enter the verification code below:
            </p>
            
            <div style="background: #f3f4f6; border: 2px dashed #0f766e; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #0f766e; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <div style="background: #fef7cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Important:</strong> This code will expire in <strong>5 minutes</strong> for your security.
              </p>
            </div>
            
            <div style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p><strong>Security Tips:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>AYUSH EMR staff will never ask for your verification code</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated message from AYUSH EMR System</p>
            <p>© 2025 AYUSH EMR - Secure Healthcare Technology</p>
          </div>
        </div>
      `
    };
    
    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent info:', info.messageId);
    
    storeOTP(email, otp);
    
    console.log(`✅ OTP sent successfully to ${email} - OTP: ${otp}`);
    return { success: true, message: 'OTP sent successfully to your email!' };
    
  } catch (error) {
    console.error('❌ Failed to send OTP email. Full error:', error);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      return { success: false, message: 'Email authentication failed. Please check Gmail App Password.' };
    } else if (error.code === 'ECONNREFUSED') {
      return { success: false, message: 'Cannot connect to Gmail servers. Please check internet connection.' };
    } else if (error.responseCode === 535) {
      return { success: false, message: 'Invalid Gmail credentials. Please verify your App Password.' };
    }
    
    return { success: false, message: `Email error: ${error.message || 'Failed to send OTP. Please try again.'}` };
  }
}

module.exports = {
  sendOTPEmail,
  verifyOTP,
  generateOTP
};