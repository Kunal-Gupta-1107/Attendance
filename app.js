function markAttendance() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        document.getElementById('status').innerText = 'Geolocation is not supported by your browser.';
    }
}

function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    document.getElementById('status').innerText = `Attendance marked at (${latitude}, ${longitude})`;

    // Here you can submit the data to Google Sheets or Firebase (covered in Step 4).
}

function error() {
    document.getElementById('status').innerText = 'Unable to retrieve your location.';
}
