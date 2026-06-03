const verificationOtpTemplate = ({
    name,
    otp
}) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - Sportz</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0c0c0e; font-family: 'DM Sans', Arial, sans-serif;">
            <div style="max-width: 600px; margin: auto; background-color: #0c0c0e;">
                <!-- Main Card -->
                <div style="background: #0f0f12; border-radius: 24px; border: 1px solid rgba(212, 175, 100, 0.15); overflow: hidden;">
                    
                    <!-- Header with Logo -->
                    <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid rgba(212, 175, 100, 0.1);">
                        <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                            
                            <span style="font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600; color: #f0e6c8; letter-spacing: 0.04em;">Sportz</span>
                        </div>
                        <div style="width: 60px; height: 2px; background: linear-gradient(90deg, #d4af64, transparent); margin: 0 auto;"></div>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px;">
                        <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: #f0e6c8; margin: 0 0 10px 0; text-align: center;">
                            Verify Your Email
                        </h1>
                        <p style="font-size: 16px; color: rgba(240, 230, 200, 0.6); text-align: center; margin-bottom: 30px; font-weight: 300;">
                            Complete your registration to start your journey
                        </p>
                        
                        <!-- Greeting -->
                        <p style="font-size: 16px; color: rgba(240, 230, 200, 0.8); margin-bottom: 20px; line-height: 1.6;">
                            Hello <strong style="color: #d4af64;">${name}</strong>,
                        </p>
                        
                        <p style="font-size: 15px; color: rgba(240, 230, 200, 0.6); margin-bottom: 25px; line-height: 1.6;">
                            Thank you for joining <strong style="color: #d4af64;">Sportz</strong>! Please use the verification code below to complete your email verification and activate your account.
                        </p>
                        
                        <!-- OTP Box -->
                        <div style="margin: 35px 0; text-align: center;">
                            <div style="display: inline-block; background: rgba(212, 175, 100, 0.05); border: 1px solid rgba(212, 175, 100, 0.2); border-radius: 16px; padding: 5px 7px;">
                                <span style="font-family: monospace; font-size: 42px; letter-spacing: 12px; font-weight: 600; color: #d4af64; background: transparent;">
                                    ${otp}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Instructions -->
                        <div style="background: rgba(212, 175, 100, 0.03); border-left: 3px solid #d4af64; padding: 15px 20px; margin: 25px 0; border-radius: 8px;">
                            <p style="font-size: 13px; color: rgba(240, 230, 200, 0.5); margin: 0; line-height: 1.5;">
                                <strong style="color: #d4af64;">How to verify:</strong><br>
                                1. Enter this 6-digit code on the verification page<br>
                                2. Your email will be verified instantly<br>
                                3. You'll be redirected to complete your profile
                            </p>
                        </div>
                        
                        <!-- Expiry Warning -->
                        <div style="margin: 25px 0 20px 0;">
                            <p style="font-size: 13px; color: rgba(240, 230, 200, 0.4); margin: 0; text-align: center;">
                                ⏰ This verification code will expire in <strong style="color: #d4af64;">10 minutes</strong>
                            </p>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="background: rgba(255, 100, 100, 0.05); border: 1px solid rgba(255, 100, 100, 0.1); border-radius: 8px; padding: 12px 16px; margin-top: 25px;">
                            <p style="font-size: 12px; color: #fc8181; margin: 0; text-align: center;">
                                ⚠️ For security reasons, do not share this OTP with anyone. Our team will never ask for this code.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="padding: 30px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(212, 175, 100, 0.08); text-align: center;">
                        <p style="font-size: 12px; color: rgba(240, 230, 200, 0.3); margin: 0 0 10px 0;">
                            Need help? Contact our support team
                        </p>
                        <p style="font-size: 11px; color: rgba(240, 230, 200, 0.25); margin: 0;">
                            &copy; 2026 Sportz. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

export default verificationOtpTemplate;