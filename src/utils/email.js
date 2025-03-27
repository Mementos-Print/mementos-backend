import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

export const sendOtp = async(email, otp) =>  {

    const mailOptions = {
        from: 'youremail@gmail.com',
        to: email,
        subject: 'Otp verification',
        text: `Your one time password is:${otp}`
      };

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email.user,
          pass: config.email.pass
        }
      });

      transporter.sendMail(mailOptions), (error, info) => {
        
          if(error) {
            console.log("Error sending email", error);
          };
      
          console.log("Email sent: "+ info.response);
        
      };

};