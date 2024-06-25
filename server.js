const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// Serve static files (optional)
app.use(express.static('public'));

// Handle form submission
app.post('/submit-form', upload.fields([
    { name: 'passport', maxCount: 1 },
    { name: 'visa', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'collegeId', maxCount: 1 }
]), async (req, res) => {
    try {
        // Extract form data
        const { name, surname, dob, college, course, semester, country, mobile, email } = req.body;

        // Generate QR code data
        const qrData = `${name} ${surname}\n${college}\n${country}`;

        // Create PDF with QR code
        const canvas = createCanvas(600, 600);
        const ctx = canvas.getContext('2d');
        await QRCode.toCanvas(ctx, qrData, { errorCorrectionLevel: 'H' });

        const pdfBuffer = canvas.toBuffer('application/pdf');
        const pdfPath = path.join(__dirname, `tickets/${name}_${surname}_ticket.pdf`);

        fs.writeFileSync(pdfPath, pdfBuffer);

        // Send email with PDF attachment
        await sendEmail(email, pdfPath);

        // Respond with success message
        res.status(200).json({ message: 'Registration successful. Email sent with QR code ticket.', qrData: qrData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing registration.' });
    }
});

// Function to send email with PDF attachment
async function sendEmail(email, pdfPath) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Event Registration Confirmation',
        text: 'Thank you for registering! Please find your QR code ticket attached.',
        attachments: [
            {
                filename: 'ticket.pdf',
                path: pdfPath,
                contentType: 'application/pdf'
            }
        ]
    };

    await transporter.sendMail(mailOptions);
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
