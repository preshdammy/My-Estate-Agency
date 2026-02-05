// utils/emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email templates
const templates = {
  // User registration
  welcome: (name) => ({
    subject: "Welcome to RealEstate Agency!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to RealEstate Agency, ${name}!</h2>
        <p>Thank you for registering with us. We're excited to help you find your dream property.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse available apartments</li>
          <li>Book property inspections</li>
          <li>Save your favorite properties</li>
          <li>Submit reports about properties</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <br>
        <p>Best regards,<br>The RealEstate Agency Team</p>
      </div>
    `
  }),

  // Agent registration
  agentWelcome: (name) => ({
    subject: "Agent Registration Submitted",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome, ${name}!</h2>
        <p>Thank you for registering as an agent with RealEstate Agency.</p>
        <p>Your registration is currently <strong>pending approval</strong>. Our admin team will review your application and get back to you within 24-48 hours.</p>
        <p>Once approved, you'll be able to:</p>
        <ul>
          <li>List properties for rent/sale</li>
          <li>Manage inspection requests</li>
          <li>Handle property bookings</li>
          <li>View your dashboard statistics</li>
        </ul>
        <p>We'll notify you once your account is approved.</p>
        <br>
        <p>Best regards,<br>The RealEstate Agency Team</p>
      </div>
    `
  }),

  // Agent approval
  agentApproved: (name) => ({
    subject: "Agent Account Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Congratulations, ${name}!</h2>
        <p>Your agent account has been <strong>approved</strong> by our admin team.</p>
        <p>You can now log in to your dashboard and start listing properties.</p>
        <p><a href="${process.env.FRONTEND_URL}/agent/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Dashboard</a></p>
        <p>If you have any questions, please contact our support team.</p>
        <br>
        <p>Best regards,<br>The RealEstate Agency Team</p>
      </div>
    `
  }),

  // Agent rejection
  agentRejected: (name, reason) => ({
    subject: "Agent Registration Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Update on Your Agent Registration</h2>
        <p>Dear ${name},</p>
        <p>We regret to inform you that your agent registration has been <strong>rejected</strong>.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you believe this is a mistake or would like to appeal this decision, please contact our support team.</p>
        <br>
        <p>Best regards,<br>The RealEstate Agency Team</p>
      </div>
    `
  }),

  // Booking confirmation
  bookingConfirmation: (userName, apartmentLocation, bookingId) => ({
    subject: "Booking Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Booking Confirmed!</h2>
        <p>Dear ${userName},</p>
        <p>Your booking for <strong>${apartmentLocation}</strong> has been confirmed.</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p>The property agent will contact you shortly to arrange the next steps.</p>
        <p>You can view your booking details in your dashboard.</p>
        <p><a href="${process.env.FRONTEND_URL}/bookings/${bookingId}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking</a></p>
        <br>
        <p>Best regards,<br>The RealEstate Agency Team</p>
      </div>
    `
  }),

  // Inspection request
  inspectionRequest: (userName, agentName, date, time, apartmentLocation) => ({
    subject: "New Inspection Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Inspection Request</h2>
        <p>Dear ${agentName},</p>
        <p>You have a new inspection request from <strong>${userName}</strong>.</p>
        <p><strong>Property:</strong> ${apartmentLocation}</p>
        <p><strong>Requested Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        <p><strong>Requested Time:</strong> ${time}</p>
        <p>Please log in to your dashboard to approve or reject this request.</p>
        <p><a href="${process.env.FRONTEND_URL}/agent/inspections" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a></p>
        <br>
        <p>Best regards,<br>The RealEstate Agency Team</p>
      </div>
    `
  }),

  // Password reset
  passwordReset: (name, resetToken) => ({
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>Dear ${name},</p>
        <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <p><a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <br>
        <p>Best regards,<br>The RealEstate Agency Team</p>
      </div>
    `
  }),

  // Payment receipt
  paymentReceipt: (userName, amount, transactionId, apartmentLocation) => ({
    subject: "Payment Receipt",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Receipt</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for your payment. Here's your receipt:</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Property:</strong> ${apartmentLocation}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> Completed</p>
        </div>
        <p>You can view your payment history in your dashboard.</p>
        <br>
        <p>Best regards,<br>The RealEstate Agency Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, templateName, templateData = {}) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured. Skipping email send.");
      return { success: false, message: "Email service not configured" };
    }

    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const emailContent = typeof template === 'function' 
      ? template(...Object.values(templateData))
      : template;

    const mailOptions = {
      from: `"RealEstate Agency" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      to,
      template: templateName
    };
  } catch (error) {
    console.error("Send email error:", error);
    return { 
      success: false, 
      error: error.message,
      to,
      template: templateName
    };
  }
};

// Send bulk email
const sendBulkEmail = async (recipients, templateName, templateDataArray) => {
  try {
    const results = [];
    
    for (let i = 0; i < recipients.length; i++) {
      const result = await sendEmail(
        recipients[i], 
        templateName, 
        templateDataArray[i] || templateDataArray[0]
      );
      results.push(result);
      
      // Delay between emails to avoid rate limiting
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return {
      total: recipients.length,
      successful,
      failed,
      results
    };
  } catch (error) {
    console.error("Send bulk email error:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("Email server connection verified");
    return { success: true, message: "Email server connection verified" };
  } catch (error) {
    console.error("Email connection test failed:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  testEmailConnection,
  templates
};