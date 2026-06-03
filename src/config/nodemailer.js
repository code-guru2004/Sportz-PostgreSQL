import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});
import nodemailer
from "nodemailer";



/*
|--------------------------------------------------------------------------
| Transporter
|--------------------------------------------------------------------------
*/

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add timeouts (in milliseconds)
    connectionTimeout: 10000,  // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });




/*
|--------------------------------------------------------------------------
| Verify Connection
|--------------------------------------------------------------------------
*/

transporter.verify(

    (error, success) => {

        if (error) {

            console.log(
                "Email Service Error:",
                error.message
            );

        } else {

            console.log(
                "Email Service Connected"
            );
        }
    }
);



export default transporter;