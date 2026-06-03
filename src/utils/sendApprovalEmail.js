// utils/sendApprovalEmail.js
import transporter from "../config/nodemailer.js";
import approvalEmailTemplate from "../template/approvalEmail.template.js";

const sendApprovalEmail = async ({
  email,
  name,
  role,
  status, // 'approved' or 'rejected'
  message,
  actionUrl
}) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Account ${status === 'approved' ? 'Approved' : 'Status Update'} - Sports Training Management`,
      html: approvalEmailTemplate({
        name,
        role: role.toLowerCase(),
        status,
        message,
        actionUrl: actionUrl || `${process.env.CLIENT_URL}/login`
      })
    });
    
    console.log(`Approval email sent to ${email} with status: ${status}`);
  } catch (error) {
    console.error("Error sending approval email:", error);
    throw new Error("Failed to send approval email");
  }
};

export default sendApprovalEmail;