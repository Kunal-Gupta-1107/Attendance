document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('attendanceForm');
  const nameInput = document.getElementById('name');
  const submitButton = document.getElementById('submitButton');
  const attendanceList = document.getElementById('attendanceList');
  const installButton = document.getElementById('installButton'); // Install button for PWA
  let deferredPrompt; // Variable to hold the install prompt

  // Define the target location (latitude and longitude) and radius in meters
  //const targetLocation = { lat: 27.1862, lon: 78.0031 };
  const targetLocation = { lat: 27.1962, lon: 78.0506 };

  const radius = 500; // Radius in meters

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
        try {
          // Add attendance record to Firestore
          const docRef = await addDoc(collection(db, 'attendance'), {
            name: name,
            timestamp: serverTimestamp(),
          });

          alert('Attendance recorded in Firestore!');
          form.reset();
          submitButton.disabled = true;
          displayAttendance();
        } catch (error) {
          console.error("Error adding document: ", error);
        }
      } else {
        alert('You are not within the required area.');
      }
    }
  });

  // Function to display attendance list
  async function displayAttendance() {
    try {
      const querySnapshot = await getDocs(collection(db, "attendance"));
      let output = '';

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        output += `<li>${data.name} - ${new Date(data.timestamp.seconds * 1000).toLocaleString()}</li>`;
      });

      attendanceList.innerHTML = output;
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  }

  // Display attendance on page load
  displayAttendance();

  // PWA Install Prompt Section
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Show the install button
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', () => {
      // Hide the install button
      installButton.style.display = 'none';
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    });
  });
});
