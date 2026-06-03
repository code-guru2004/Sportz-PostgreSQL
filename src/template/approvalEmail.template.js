// template/approvalEmail.template.js
const approvalEmailTemplate = ({ name, role, status, message, actionUrl }) => {
    const isApproved = status === 'approved';
    
    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const statusText = isApproved ? 'Approved ✅' : 'Status Update';
    const buttonText = isApproved ? 'Login to Dashboard' : 'Contact Support';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Sports Training Management</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937;">Hello ${name},</h2>
          
          <div style="background: ${statusColor}10; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: ${statusColor}; font-weight: bold; font-size: 18px;">
              Account ${statusText}
            </p>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">${message}</p>
          
          ${isApproved ? `
            <div style="margin: 30px 0; text-align: center;">
              <a href="${actionUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                ${buttonText}
              </a>
            </div>
          ` : `
            <div style="margin: 30px 0; padding: 15px; background: #fef2f2; border-radius: 5px;">
              <p style="margin: 0; color: #dc2626; font-size: 14px;">
                If you believe this is an error, please contact the administrator at support@ sportstraining.com
              </p>
            </div>
          `}
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from Sports Training Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
  };
  
  export default approvalEmailTemplate;