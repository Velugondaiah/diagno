const nodemailer = require('nodemailer');

// Create transporter for email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Add this function to send appointment confirmation email
const sendAppointmentConfirmation = async (userEmail, appointmentDetails) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'Appointment Confirmation',
      html: `
        <h2>Your Appointment is Confirmed!</h2>
        <p>Dear ${appointmentDetails.patientName},</p>
        <p>Your appointment has been successfully booked with the following details:</p>
        <ul>
          <li><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</li>
          <li><strong>Date:</strong> ${appointmentDetails.date}</li>
          <li><strong>Time:</strong> ${appointmentDetails.time}</li>
          <li><strong>Location:</strong> ${appointmentDetails.location}</li>
          <li><strong>Specialist:</strong> ${appointmentDetails.specialist}</li>
        </ul>
        <p>Please arrive 10 minutes before your scheduled appointment time.</p>
        <p>If you need to reschedule or cancel your appointment, please contact us.</p>
        <br>
        <p>Best regards,</p>
        <p>Your Healthcare Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

app.post('/api/appointments', async (req, res) => {
  try {
    // ... existing appointment creation code ...

    // After successful appointment creation, send email
    const userQuery = 'SELECT email FROM users WHERE id = ?';
    const userResult = await db.get(userQuery, [req.body.user_id]);

    if (userResult && userResult.email) {
      await sendAppointmentConfirmation(userResult.email, {
        patientName: req.body.patient_name,
        doctorName: req.body.doctor_name,
        date: req.body.date,
        time: req.body.time,
        location: req.body.location,
        specialist: req.body.specialist
      });
    }

    res.status(201).json({
      message: 'Appointment created successfully and confirmation email sent',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error in appointment booking:', error);
    res.status(500).json({
      message: 'Failed to create appointment',
      error: error.message
    });
  }
}); 