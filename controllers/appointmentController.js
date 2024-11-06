const nodemailer = require('nodemailer');

// Configure transporter with logging
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Specify 'gmail' instead of host/port
  auth: {
    user: 'diagnoaiteam1@gmail.com',  // Replace with your actual Gmail
    pass: 'cqfqihpyftpisgmi'      // Replace with your actual app password
  }
});

// Test the transporter connection
transporter.verify(function(error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    // ... existing appointment creation code ...

    // Get user email with logging
    const userQuery = 'SELECT email FROM users WHERE id = ?';
    console.log('Fetching email for user ID:', req.body.user_id);
    const userResult = await db.get(userQuery, [req.body.user_id]);
    console.log('User email result:', userResult);

    if (userResult && userResult.email) {
      console.log('Preparing to send email to:', userResult.email);
      
      const mailOptions = {
        from: 'your.email@gmail.com',  // Your Gmail address
        to: userResult.email,
        subject: 'Appointment Confirmation',
        html: `
          <h2>Your Appointment is Confirmed!</h2>
          <p>Dear ${req.body.patient_name},</p>
          <p>Your appointment has been successfully booked with the following details:</p>
          <ul>
            <li><strong>Doctor:</strong> Dr. ${req.body.doctor_name}</li>
            <li><strong>Date:</strong> ${req.body.date}</li>
            <li><strong>Time:</strong> ${req.body.time}</li>
            <li><strong>Location:</strong> ${req.body.location}</li>
            <li><strong>Specialist:</strong> ${req.body.specialist}</li>
          </ul>
          <p>Please arrive 10 minutes before your scheduled appointment time.</p>
          <p>If you need to reschedule or cancel your appointment, please contact us.</p>
          <br>
          <p>Best regards,</p>
          <p>Your Healthcare Team</p>
        `
      };

      try {
        console.log('Attempting to send email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue with appointment creation even if email fails
      }
    } else {
      console.log('No email found for user ID:', req.body.user_id);
    }

    res.status(201).json({
      message: 'Appointment created successfully',
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