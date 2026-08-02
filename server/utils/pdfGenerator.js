const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate loan agreement PDF
 * @param {Object} application - Loan application data
 * @param {Object} user - User data
 * @param {Object} loanType - Loan type data
 * @returns {Buffer} PDF buffer
 */
const generateLoanAgreement = (application, user, loanType) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#0F172A')
         .text('LOAN AGREEMENT', { align: 'center' })
         .moveDown();

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#64748B')
         .text(`Application Number: ${application.applicationNumber}`, { align: 'center' })
         .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' })
         .moveDown(2);

      // Parties Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#0F172A')
         .text('PARTIES TO THE AGREEMENT')
         .moveDown();

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#334155')
         .text(`Borrower: ${user.fullName}`, { continued: true })
         .text(` (${user.email})`)
         .text(`Phone: ${user.phone}`)
         .text(`Address: ${user.address?.street || 'N/A'}, ${user.address?.city || 'N/A'}, ${user.address?.state || 'N/A'} - ${user.address?.pincode || 'N/A'}`)
         .moveDown();

      doc.text(`Lender: LoanApproval Financial Services`)
         .text(`Address: 123 Finance Street, Mumbai, Maharashtra - 400001`)
         .moveDown(2);

      // Loan Details Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#0F172A')
         .text('LOAN DETAILS')
         .moveDown();

      const loanDetails = [
        [`Loan Type:`, loanType.name],
        [`Loan Amount:`, `₹${application.loanAmount.toLocaleString('en-IN')}`],
        [`Interest Rate:`, `${loanType.interestRate}% per annum`],
        [`Loan Duration:`, `${application.durationMonths} months`],
        [`EMI:`, `₹${application.emi.toLocaleString('en-IN')}`],
        [`Total Payable:`, `₹${application.totalPayable.toLocaleString('en-IN')}`],
        [`Interest Amount:`, `₹${application.interestAmount.toLocaleString('en-IN')}`],
        [`Processing Fee:`, `₹${application.processingFee.toLocaleString('en-IN')}`],
      ];

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#334155');

      loanDetails.forEach(([label, value]) => {
        doc.text(label, { continued: true })
           .font('Helvetica-Bold')
           .text(value)
           .font('Helvetica');
      });

      doc.moveDown(2);

      // Terms and Conditions
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#0F172A')
         .text('TERMS AND CONDITIONS')
         .moveDown();

      const terms = [
        '1. The borrower agrees to repay the loan amount in equal monthly installments (EMI) as specified above.',
        '2. The interest rate is fixed for the entire loan duration.',
        '3. Late payment charges will be applicable as per the lender\'s policy.',
        '4. The borrower authorizes the lender to deduct EMI from the registered bank account.',
        '5. Prepayment of the loan is allowed subject to prepayment charges.',
        '6. The borrower agrees to provide all necessary documents for verification.',
        '7. The lender reserves the right to modify terms with prior notice.',
        '8. This agreement is governed by the laws of India.',
      ];

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#475569');

      terms.forEach(term => {
        doc.text(term, { align: 'justify' })
           .moveDown(0.5);
      });

      doc.moveDown(2);

      // Signature Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#0F172A')
         .text('SIGNATURES')
         .moveDown(2);

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#334155');

      doc.text('Borrower Signature:', 50, doc.y)
         .text('_____________________', 50, doc.y + 20)
         .text('Date: _______________', 50, doc.y + 40)
         .moveDown(2);

      doc.text('Lender Signature:', 300, doc.y)
         .text('_____________________', 300, doc.y + 20)
         .text('Date: _______________', 300, doc.y + 40);

      // Footer
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#94A3B8')
         .text('This is a computer-generated document and does not require a physical signature.', 50, doc.page.height - 50, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateLoanAgreement };
