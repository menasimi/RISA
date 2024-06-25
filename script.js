document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const form = event.target;
    const name = form.name.value;
    const surname = form.surname.value;
    const college = form.college.value;
    const country = form.country.value;

    // Create a JSON object with the required form data
    const formData = {
        fullName: `${name} ${surname}`,
        college: college,
        country: country
    };

    // Convert JSON object to string
    const formDataString = JSON.stringify(formData);

    // Generate QR code
    const qrCodeDiv = document.getElementById('qrcode');
    qrCodeDiv.innerHTML = ""; // Clear previous QR code if any
    new QRCode(qrCodeDiv, formDataString);

    // Optionally, send the form data to a server
    // fetch('your-server-endpoint', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: formDataString
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Success:', data);
    // })
    // .catch((error) => {
    //     console.error('Error:', error);
    // });
});
