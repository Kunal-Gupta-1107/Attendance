document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('attendanceForm');
  const nameInput = document.getElementById('name');
  const submitButton = document.getElementById('submitButton');
  const attendanceList = document.getElementById('attendanceList');

  // Define the target location (latitude and longitude) and radius in meters
  const targetLocation = { lat: 27.1862, lon: 78.0031 };
  const radius = 25; // Radius in meters

  // Function to calculate the distance between two coordinates
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in meters
  }

  // Function to check if the user is within the allowed area
  function checkLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const distance = getDistance(latitude, longitude, targetLocation.lat, targetLocation.lon);
          resolve(distance <= radius);
        }, () => {
          reject(false);
        });
      } else {
        reject(false);
      }
    });
  }

  // Enable the submit button only if there is a value in the input
  nameInput.addEventListener('input', () => {
    submitButton.disabled = !nameInput.value;
  });

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = nameInput.value;

    if (name) {
      const isInArea = await checkLocation();
      
      if (isInArea) {
        let attendance = JSON.parse(localStorage.getItem('attendance')) || {};
        const today = new Date().toLocaleDateString(); // Use local date format for the key

        if (!attendance[today]) {
          attendance[today] = [];
        }
        
        attendance[today].push({ name: name, timestamp: new Date().toLocaleString() });
        localStorage.setItem('attendance', JSON.stringify(attendance));

        alert('Attendance recorded!');
        form.reset();
        displayAttendance();
      } else {
        alert('You are not within the required area.');
      }
    }
  });

  // Function to display attendance list
  function displayAttendance() {
    let attendance = JSON.parse(localStorage.getItem('attendance')) || {};
    let output = '';

    for (let date in attendance) {
      output += <h2>${date}</h2><ul>;
      attendance[date].forEach(entry => {
        output += <li>${entry.name} - ${entry.timestamp}</li>;
      });
      output += '</ul>';
    }
    attendanceList.innerHTML = output;
  }

  // Display attendance on page load
  displayAttendance();
});
