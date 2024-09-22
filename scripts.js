<script type="module">
  // Import Firebase SDKs
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

  // Your web app's Firebase configuration  
  const firebaseConfig = {
    apiKey: "AIzaSyBFJrziRByYb0EwC2sYfP_cLtiQJlS02cY",
    authDomain: "attendance-38541.firebaseapp.com",
    projectId: "attendance-38541",
    storageBucket: "attendance-38541.appspot.com",
    messagingSenderId: "439358946279",
    appId: "1:439358946279:web:fe466a68db5e8ad77f1b42"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('attendanceForm');
    const nameInput = document.getElementById('name');
    const submitButton = document.getElementById('submitButton');
    const attendanceList = document.getElementById('attendanceList');
    const installButton = document.getElementById('installButton');
    let deferredPrompt;

    const targetLocation = { lat: 27.1962, lon: 78.0506 }; // Change to your target latitude and longitude
    const radius = 25; // Distance in meters
    console.log("JavaScript is connected and running!");


    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Radius of Earth in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in meters
    }

    function checkLocation() {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const distance = getDistance(latitude, longitude, targetLocation.lat, targetLocation.lon);
            resolve(distance <= radius);
          }, () => {
            reject(false);
            console.log("JavaScript is connected and running!");
          });
        } else {
          reject(false);
          console.log("JavaScript is connected and running!");
        }
      });
    }

    async function checkDuplicate(name, date) {
      const attendanceQuery = query(collection(db, "attendance"), where("name", "==", name), where("date", "==", date));
      const querySnapshot = await getDocs(attendanceQuery);
      return !querySnapshot.empty; // Returns true if there is a duplicate
    }

    nameInput.addEventListener('input', () => {
      submitButton.disabled = !nameInput.value;
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = nameInput.value;
      const today = new Date().toLocaleDateString();

      const isInArea = await checkLocation();

      if (isInArea) {
        const isDuplicate = await checkDuplicate(name, today);
        
        if (isDuplicate) {
          alert('Attendance for this name has already been recorded today.');
        } else {
          try {
            await addDoc(collection(db, "attendance"), {
              name: name,
              date: today,
              timestamp: serverTimestamp()
            });
            alert('Attendance recorded!');
            form.reset();
            displayAttendance();
          } catch (error) {
            console.error("Error adding document: ", error);
          }
        }
      } else {
        alert('You are not within the required area.');
      }
    });

    async function displayAttendance() {
      attendanceList.innerHTML = '';
      const querySnapshot = await getDocs(collection(db, "attendance"));
      
      let output = '';
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        output += `<li>${data.name} - ${data.timestamp.toDate().toLocaleString()}</li>`;
      });
      
      attendanceList.innerHTML = output;
    }

    displayAttendance();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installButton.style.display = 'block';
      
      installButton.addEventListener('click', () => {
        installButton.style.display = 'none';
        deferredPrompt.prompt();
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
</script>
