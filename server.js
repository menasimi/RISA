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
app.post('/submit-form', upload.none(), async (req, res) => {
    try {
        // Extract form data
        const { name, college, mobile, country } = req.body;

        // Generate QR code data
        const qrData = `Name: ${name}\nCollege: ${college}\nMobile: ${mobile}\nCountry: ${country}`;
        
        // Generate QR code as image (base64)
        const qrImageBase64 = await QRCode.toDataURL(qrData);

        // Create PDF with QR code and additional details
        const pdfPath = path.join(__dirname, `tickets/${name}_ticket.pdf`);
        await generatePDF(pdfPath, name, college, mobile, country, qrImageBase64);

        // Send confirmation email
        await sendConfirmationEmail(req.body.email, name, college, mobile, country, pdfPath);

        // Respond with success message
        res.status(200).json({ message: 'Registration successful. Email sent with QR code ticket.', qrData: qrData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing registration.' });
    }
});

// Function to generate PDF with QR code and details
async function generatePDF(pdfPath, name, college, mobile, country, qrImageBase64) {
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');
    
    // Draw QR code
    const qrImage = new Image();
    qrImage.src = qrImageBase64;
    ctx.drawImage(qrImage, 50, 50, 200, 200);

    // Draw text
    ctx.font = '20px Arial';
    ctx.fillText(`Name: ${name}`, 300, 100);
    ctx.fillText(`College: ${college}`, 300, 150);
    ctx.fillText(`Mobile: ${mobile}`, 300, 200);
    ctx.fillText(`Country: ${country}`, 300, 250);

    // Convert to PDF buffer and write to file
    const pdfBuffer = canvas.toBuffer('application/pdf');
    fs.writeFileSync(pdfPath, pdfBuffer);
}

// Function to send confirmation email with PDF attachment
async function sendConfirmationEmail(email, name, college, mobile, country, pdfPath) {
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
        text: `Dear ${name},\n\nThank you for registering! Please find your QR code ticket attached.\n\nBest regards,\nEvent Team`,
        attachments: [
            {
                filename: `${name}_ticket.pdf`,
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
