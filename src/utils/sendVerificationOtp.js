import transporter
from "../config/nodemailer.js";

import verificationOtpTemplate
from "../template/verificationOtp.template.js";



const sendVerificationOtp = async ({

    email,

    name,

    otp

}) => {

    try {
        await transporter.sendMail({

            from:
                process.env.EMAIL_USER,
    
            to: email,
    
            subject:
                "Verify Your Email - Sportz",
    
            html:
                verificationOtpTemplate({
    
                    name,
    
                    otp
                })
        });
    } catch (error) {
        console.error("EMAIL ERROR:", error);
        throw error;
    }
};



export default sendVerificationOtp;