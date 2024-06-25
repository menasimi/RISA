document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    fetch('/submit-form', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        document.getElementById('registrationForm').style.display = 'none';
        document.getElementById('confirmation').style.display = 'block';
        generateQRCode(data.qrData); // Function to generate QR code
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function generateQRCode(qrData) {
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = ''; // Clear previous QR code if any
    new QRCode(qrCodeContainer, qrData);
}
