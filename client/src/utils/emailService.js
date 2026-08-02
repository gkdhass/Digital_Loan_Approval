import emailjs from '@emailjs/browser';

/**
 * Send decision email (approved/rejected) using a single generic template
 * @param {Object} application - Application data
 * @param {string} decision - 'approved' or 'rejected'
 * @param {Object} extra - Extra data (rejectionReason for rejected, etc.)
 */
export const sendDecisionEmail = async (application, decision, extra = {}) => {
  try {
    const { decision_status, decision_message } = buildDecisionContent(application, decision, extra);

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_DECISION,
      {
        to_email: application.user.email,
        customer_name: application.user.fullName,
        application_number: application.applicationNumber,
        loan_amount: application.loanAmount,
        loan_type: application.loanType?.name || 'Loan',
        decision_status,
        decision_message,
        emi: application.emi,
        tenure: application.durationMonths,
        interest_rate: application.loanType?.interestRate,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    console.log(`Decision email sent via EmailJS: ${decision}`);
    return true;
  } catch (error) {
    console.error('Failed to send decision email:', error);
    throw error;
  }
};

/**
 * Build dynamic decision content based on approval/rejection
 */
const buildDecisionContent = (application, decision, extra) => {
  if (decision === 'approved') {
    return {
      decision_status: 'APPROVED',
      decision_message: `Congratulations! Your loan application has been approved. Approved amount: ₹${application.loanAmount.toLocaleString()}. Monthly EMI: ₹${application.emi?.toLocaleString() || 'N/A'}. Tenure: ${application.durationMonths} months.`,
    };
  } else if (decision === 'rejected') {
    return {
      decision_status: 'REJECTED',
      decision_message: `We regret to inform you that your loan application has been rejected. Reason: ${extra.rejectionReason || 'Contact support for more information.'}`,
    };
  }

  return {
    decision_status: 'UPDATED',
    decision_message: 'Your loan application status has been updated.',
  };
};
