const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendAppointmentEmail = async (appointmentDetails, userEmail) => {
    const emailTemplate = `
        <h2>Appointment Confirmation</h2>
        <p>Dear ${appointmentDetails.patient_name},</p>
        <p>Your appointment has been successfully booked. Here are the details:</p>
        <ul>
            <li>Date: ${appointmentDetails.date}</li>
            <li>Time: ${appointmentDetails.time}</li>
            <li>Location: ${appointmentDetails.location}</li>
            <li>Specialist: ${appointmentDetails.specialist}</li>
        </ul>
        <p>Please arrive 10 minutes before your scheduled appointment time.</p>
        <p>If you need to reschedule or cancel your appointment, please contact us.</p>
        <p>Thank you for choosing our services!</p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Appointment Confirmation',
        html: emailTemplate
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

module.exports = { sendAppointmentEmail };
