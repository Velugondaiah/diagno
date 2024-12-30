const { initializeDb } = require('../models/db');

// Example function to create an appointment
const createAppointment = async (req, res) => {
    const { doctorId, userId, patientName, date, time, specialist, location } = req.body;

    if (!doctorId || !userId || !patientName || !date || !time || !specialist || !location) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await initializeDb();
    const createAppointmentQuery = `
        INSERT INTO appointments (doctor_id, user_id, patient_name, date, time, specialist, location)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const dbResponse = await db.run(createAppointmentQuery, [doctorId, userId, patientName, date, time, specialist, location]);
        res.status(201).json({ message: 'Appointment created successfully', appointmentId: dbResponse.lastID });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create appointment', details: error.message });
    }
};

// Example function to get appointments for a user
const getUserAppointments = async (req, res) => {
    const { userId } = req.params;

    const db = await initializeDb();
    const getAppointmentsQuery = `
        SELECT * FROM appointments WHERE user_id = ? ORDER BY date, time
    `;

    try {
        const appointments = await db.all(getAppointmentsQuery, [userId]);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments', details: error.message });
    }
};

module.exports = { createAppointment, getUserAppointments }; 