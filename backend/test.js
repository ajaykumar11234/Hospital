import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

const app = express();
app.use(bodyParser.json());

// Store reminders (for demo; replace with DB in production)
const reminders = [];

// Configure email transporter (use environment variables for credentials in production)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ajaykumarmekala42@gmail.com',    // your Gmail address
        pass: 'kxghficoeylwsnnh',            // your Gmail password or app-specific password
    },
});

// Endpoint to add a medicine reminder
app.post('/add-reminder', (req, res) => {
    const { medicineName, time, toEmail } = req.body;
    if (!medicineName || !time || !toEmail) {
        return res.status(400).json({ message: 'medicineName, time, and toEmail are required' });
    }

    // Time format: "HH:MM" (24-hour)
    const [hour, minute] = time.split(':');

    if (!hour || !minute || isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM in 24-hour format.' });
    }

    // Cron expression for daily schedule at specified time
    const cronExpr = `${minute} ${hour} * * *`;

    // Schedule the email reminder
    cron.schedule(cronExpr, () => {
        console.log(`Running email job for medicine ${medicineName} at ${time}`);

        transporter.sendMail({
            from: 'youremail@gmail.com',
            to: toEmail,
            subject: `Medicine Reminder: ${medicineName}`,
            text: `This is your reminder to take your medicine: ${medicineName} at ${time}`,
        }, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    });

    reminders.push({ medicineName, time, toEmail });
    res.json({ message: 'Reminder scheduled successfully' });
});

// Start Express server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
