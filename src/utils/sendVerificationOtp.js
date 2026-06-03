import transporter
from "../config/nodemailer.js";

import verificationOtpTemplate
from "../template/verificationOtp.template.js";



const sendVerificationOtp =
async ({

    email,

    name,

    otp

}) => {

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
};



export default sendVerificationOtp;