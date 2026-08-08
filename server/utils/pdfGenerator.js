const PDFDocument = require('pdfkit');

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
      console.log('[pdfGenerator] Starting PDF generation for application:', application.applicationNumber);
      
      const doc = new PDFDocument({ 
        margin: 0, 
        size: 'A4',
        info: {
          Title: 'Loan Agreement',
          Author: 'Digital Loan Approval',
          Subject: `Loan Agreement - ${application.applicationNumber}`
        }
      });
      
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log('[pdfGenerator] PDF generation completed. Size:', buffer.length, 'bytes');
        resolve(buffer);
      });
      
      doc.on('error', (error) => {
        console.error('[pdfGenerator] PDFKit error:', error);
        reject(error);
      });

      // Page dimensions
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 45; // ~16mm (slightly larger than 12mm for safety)
      const contentWidth = pageWidth - (margin * 2);

      console.log('[pdfGenerator] Page dimensions:', { pageWidth, pageHeight, margin, contentWidth });

      // Colors
      const primaryColor = '#123B5D';
      const textColor = '#000000';
      const secondaryColor = '#64748B';

      // Set Times Roman font for entire document
      doc.font('Times-Roman');

      // HEADER
      console.log('[pdfGenerator] Adding header...');
      
      // Draw simple house logo (since no external asset exists)
      const logoX = margin;
      const logoY = margin;
      const logoSize = 30;
      
      doc.rect(logoX, logoY, logoSize, logoSize)
         .lineWidth(1)
         .stroke(primaryColor);
      
      // House roof
      doc.moveTo(logoX + 5, logoY + 20)
         .lineTo(logoX + 15, logoY + 10)
         .lineTo(logoX + 25, logoY + 20)
         .lineWidth(1)
         .stroke(primaryColor);
      
      // House body
      doc.rect(logoX + 8, logoY + 20, 14, 10)
         .lineWidth(1)
         .stroke(primaryColor);

      // Company name and contact info
      doc.fontSize(14)
         .font('Times-Bold')
         .fillColor(primaryColor)
         .text('Digital Loan Approval', logoX + 40, logoY + 5);
      
      doc.fontSize(9)
         .font('Times-Roman')
         .fillColor(secondaryColor)
         .text('support@digitalloanapproval.com', logoX + 40, logoY + 20);
      doc.text('+91 1800-XXX-XXXX', logoX + 40, logoY + 30);

      // Horizontal divider
      doc.moveTo(margin, margin + 45)
         .lineTo(pageWidth - margin, margin + 45)
         .lineWidth(0.5)
         .stroke(primaryColor);

      // DOCUMENT TITLE
      console.log('[pdfGenerator] Adding document title...');
      let yPos = margin + 65;
      const loanTypeName = loanType?.name || 'Personal';
      
      doc.fontSize(22)
         .font('Times-Bold')
         .fillColor(textColor)
         .text(`${loanTypeName} Loan Agreement`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos = doc.y + 25;

      // OPENING PARAGRAPH
      console.log('[pdfGenerator] Adding opening paragraph...');
      const appliedDate = application.createdAt 
        ? new Date(application.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      
      doc.fontSize(11)
         .font('Times-Roman')
         .fillColor(textColor)
         .text(
          `This Agreement is entered into on ${appliedDate} between Digital Loan Approval (hereinafter referred to as "Lender") and ${user.fullName} (hereinafter referred to as "Borrower").`,
          margin,
          yPos,
          { width: contentWidth, align: 'justify' }
        );
      
      yPos = doc.y + 20;

      // NUMBERED SECTIONS
      console.log('[pdfGenerator] Adding numbered sections...');
      const loanAmount = Number(application.loanAmount) || 0;
      const interestRate = Number(loanType?.interestRate) || 0;
      const durationMonths = Number(application.durationMonths) || 0;
      const emi = Number(application.emi) || 0;
      const totalPayable = Number(application.totalPayable) || (emi * durationMonths);
      const disbursedAt = application.disbursedAt 
        ? new Date(application.disbursedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'Pending';

      const sections = [
        {
          number: 1,
          title: 'Loan Details',
          content: `Loan Type: ${loanTypeName}. Principal Amount: Rs. ${loanAmount.toLocaleString('en-IN')}. Interest Rate: ${interestRate}% per annum. Application Number: ${application.applicationNumber}.`
        },
        {
          number: 2,
          title: 'Repayment Terms',
          content: `Tenure: ${durationMonths} months. Monthly EMI: Rs. ${emi.toLocaleString('en-IN')}. Total Payable Amount: Rs. ${totalPayable.toLocaleString('en-IN')}.`
        },
        {
          number: 3,
          title: 'Disbursement',
          content: `The loan amount shall be disbursed to the Borrower's registered bank account on ${disbursedAt}. The Lender confirms that funds have been transferred successfully.`
        },
        {
          number: 4,
          title: 'Borrower Obligations',
          content: 'The Borrower agrees to make timely EMI payments each month as per the repayment schedule. The Borrower shall maintain updated contact information and notify the Lender of any changes.'
        },
        {
          number: 5,
          title: 'Dispute Resolution',
          content: 'Any disputes arising from this Agreement shall be resolved through Digital Loan Approval\'s customer support and grievance redressal process. Both parties agree to attempt amicable resolution before pursuing legal action.'
        },
        {
          number: 6,
          title: 'Signatures',
          content: 'Both parties acknowledge that they have read, understood, and agreed to all terms and conditions outlined in this Agreement.'
        }
      ];

      sections.forEach((section) => {
        // Section number and title
        doc.fontSize(12)
           .font('Times-Bold')
           .fillColor(textColor)
           .text(`${section.number}. ${section.title}`, margin, yPos);
        
        yPos = doc.y + 8;
        
        // Section content
        doc.fontSize(11)
           .font('Times-Roman')
           .fillColor(textColor)
           .text(section.content, margin, yPos, { width: contentWidth, align: 'justify' });
        
        yPos = doc.y + 18;
      });

      // SIGNATURE BLOCK
      console.log('[pdfGenerator] Adding signature block...');
      yPos += 10;
      
      const sigColWidth = contentWidth / 2 - 30;
      
      // Left column - Borrower
      doc.fontSize(11)
         .font('Times-Bold')
         .fillColor(textColor)
         .text(`${user.fullName}, Borrower:`, margin, yPos);
      
      doc.moveTo(margin, yPos + 15)
         .lineTo(margin + sigColWidth, yPos + 15)
         .lineWidth(0.5)
         .stroke(textColor);
      
      doc.fontSize(10)
         .font('Times-Roman')
         .fillColor(secondaryColor)
         .text(`Date: ${appliedDate}`, margin, yPos + 22);
      
      // Right column - Lender
      doc.fontSize(11)
         .font('Times-Bold')
         .fillColor(textColor)
         .text('Digital Loan Approval, Lender:', margin + sigColWidth + 60, yPos);
      
      doc.moveTo(margin + sigColWidth + 60, yPos + 15)
         .lineTo(margin + sigColWidth + 60 + sigColWidth, yPos + 15)
         .lineWidth(0.5)
         .stroke(textColor);
      
      doc.fontSize(10)
         .font('Times-Roman')
         .fillColor(secondaryColor)
         .text(`Date: ${appliedDate}`, margin + sigColWidth + 60, yPos + 22);

      yPos = doc.y + 35;

      // FOOTER
      console.log('[pdfGenerator] Adding footer...');
      const footerY = pageHeight - margin - 30;
      
      doc.fontSize(8)
         .font('Times-Roman')
         .fillColor(secondaryColor)
         .text('Digital Loan Approval | digitalloanapproval.com', pageWidth / 2, footerY, { align: 'center' });
      
      doc.fontSize(7)
         .text('This document is system-generated and constitutes a valid loan agreement.', pageWidth / 2, footerY + 12, { align: 'center' });

      console.log('[pdfGenerator] Finalizing PDF...');
      doc.end();
      
    } catch (error) {
      console.error('[pdfGenerator] Error:', error);
      reject(error);
    }
  });
};

module.exports = { generateLoanAgreement };

