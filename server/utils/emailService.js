const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email helper
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Digital Loan Approval" <noreply@digitalloan.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  applicationSubmitted: (data) => ({
    subject: `Loan Application Submitted - ${data.applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669;">Application Submitted Successfully</h2>
        <p>Dear ${data.userName},</p>
        <p>Your loan application has been submitted successfully.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Application Number:</strong> ${data.applicationNumber}</p>
          <p><strong>Loan Amount:</strong> ₹${data.loanAmount.toLocaleString()}</p>
          <p><strong>Loan Type:</strong> ${data.loanType}</p>
        </div>
        <p>We will review your application and get back to you within 2-3 business days.</p>
        <p style="color: #6b7280;">Best regards,<br>Digital Loan Approval Team</p>
      </div>
    `,
    text: `Your loan application ${data.applicationNumber} has been submitted successfully. We will review it within 2-3 business days.`,
  }),

  applicationApproved: (data) => ({
    subject: `Loan Application Approved - ${data.applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669;">Congratulations! Your Loan is Approved</h2>
        <p>Dear ${data.userName},</p>
        <p>Your loan application has been approved.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Application Number:</strong> ${data.applicationNumber}</p>
          <p><strong>Approved Amount:</strong> ₹${data.loanAmount.toLocaleString()}</p>
          <p><strong>Monthly EMI:</strong> ₹${data.emi.toLocaleString()}</p>
          <p><strong>Tenure:</strong> ${data.durationMonths} months</p>
        </div>
        <p>Please log in to your dashboard to view the loan agreement and complete the disbursement process.</p>
        <p style="color: #6b7280;">Best regards,<br>Digital Loan Approval Team</p>
      </div>
    `,
    text: `Congratulations! Your loan application ${data.applicationNumber} has been approved. Approved amount: ₹${data.loanAmount.toLocaleString()}. Monthly EMI: ₹${data.emi.toLocaleString()}.`,
  }),

  applicationRejected: (data) => ({
    subject: `Loan Application Rejected - ${data.applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Application Update</h2>
        <p>Dear ${data.userName},</p>
        <p>We regret to inform you that your loan application has been rejected.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Application Number:</strong> ${data.applicationNumber}</p>
          <p><strong>Reason:</strong> ${data.reason || 'Contact support for more information'}</p>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p style="color: #6b7280;">Best regards,<br>Digital Loan Approval Team</p>
      </div>
    `,
    text: `Your loan application ${data.applicationNumber} has been rejected. Reason: ${data.reason || 'Contact support for more information'}.`,
  }),

  documentsRequested: (data) => ({
    subject: `Additional Documents Required - ${data.applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Documents Requested</h2>
        <p>Dear ${data.userName},</p>
        <p>We require additional documents to process your loan application.</p>
        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Application Number:</strong> ${data.applicationNumber}</p>
          <p><strong>Message:</strong> ${data.message || 'Please upload the required documents.'}</p>
        </div>
        <p>Please log in to your dashboard to upload the requested documents.</p>
        <p style="color: #6b7280;">Best regards,<br>Digital Loan Approval Team</p>
      </div>
    `,
    text: `Additional documents are required for your application ${data.applicationNumber}. ${data.message || 'Please upload the required documents.'}`,
  }),

  documentVerified: (data) => ({
    subject: `Document Verified - ${data.fileName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669;">Document Verified</h2>
        <p>Dear ${data.userName},</p>
        <p>Your document has been verified successfully.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Document:</strong> ${data.fileName}</p>
          <p><strong>Application Number:</strong> ${data.applicationNumber}</p>
        </div>
        <p style="color: #6b7280;">Best regards,<br>Digital Loan Approval Team</p>
      </div>
    `,
    text: `Your document "${data.fileName}" has been verified successfully for application ${data.applicationNumber}.`,
  }),

  documentRejected: (data) => ({
    subject: `Document Rejected - ${data.fileName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Document Rejected</h2>
        <p>Dear ${data.userName},</p>
        <p>Your document has been rejected.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Document:</strong> ${data.fileName}</p>
          <p><strong>Application Number:</strong> ${data.applicationNumber}</p>
          <p><strong>Reason:</strong> ${data.reason || 'Please upload a revised version.'}</p>
        </div>
        <p>Please upload a revised version of the document.</p>
        <p style="color: #6b7280;">Best regards,<br>Digital Loan Approval Team</p>
      </div>
    `,
    text: `Your document "${data.fileName}" has been rejected for application ${data.applicationNumber}. Reason: ${data.reason || 'Please upload a revised version.'}`,
  }),
};

// Send specific email types
const sendApplicationSubmittedEmail = async (user, application, loanType) => {
  const template = emailTemplates.applicationSubmitted({
    userName: user.fullName,
    applicationNumber: application.applicationNumber,
    loanAmount: application.loanAmount,
    loanType: loanType.name,
  });
  return sendEmail({ to: user.email, ...template });
};

const sendApplicationApprovedEmail = async (user, application) => {
  const template = emailTemplates.applicationApproved({
    userName: user.fullName,
    applicationNumber: application.applicationNumber,
    loanAmount: application.loanAmount,
    emi: application.emi,
    durationMonths: application.durationMonths,
  });
  return sendEmail({ to: user.email, ...template });
};

const sendApplicationRejectedEmail = async (user, application, reason) => {
  const template = emailTemplates.applicationRejected({
    userName: user.fullName,
    applicationNumber: application.applicationNumber,
    reason,
  });
  return sendEmail({ to: user.email, ...template });
};

const sendDocumentsRequestedEmail = async (user, application, message) => {
  const template = emailTemplates.documentsRequested({
    userName: user.fullName,
    applicationNumber: application.applicationNumber,
    message,
  });
  return sendEmail({ to: user.email, ...template });
};

const sendDocumentVerifiedEmail = async (user, document, application) => {
  const template = emailTemplates.documentVerified({
    userName: user.fullName,
    fileName: document.fileName,
    applicationNumber: application.applicationNumber,
  });
  return sendEmail({ to: user.email, ...template });
};

const sendDocumentRejectedEmail = async (user, document, application, reason) => {
  const template = emailTemplates.documentRejected({
    userName: user.fullName,
    fileName: document.fileName,
    applicationNumber: application.applicationNumber,
    reason,
  });
  return sendEmail({ to: user.email, ...template });
};

module.exports = {
  sendEmail,
  sendApplicationSubmittedEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendDocumentsRequestedEmail,
  sendDocumentVerifiedEmail,
  sendDocumentRejectedEmail,
};
