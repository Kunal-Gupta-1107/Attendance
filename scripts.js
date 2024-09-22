<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendance Form</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="manifest" href="/manifest.json">
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        }, function(error) {
          console.log('Service Worker registration failed:', error);
        });
      });
    }
  </script>
</head>
<body>
  <h1>Attendance Form</h1>
  <form id="attendanceForm">
    <input type="text" id="name" placeholder="Enter your name" required>
    <button type="submit" id="submitButton" disabled>Submit</button>
  </form>

  <div id="attendanceList"></div>
  <button id="installButton" style="display:none;">Install PWA</button> <!-- Install button for PWA -->

  <!-- Firebase SDK -->
  <script type="module">
    // Firebase setup
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
    import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyDVmQEP15M2vSWDzBXc1ySmQHhOtpZyGYw",
      authDomain: "attendanceapp-a03ea.firebaseapp.com",
      projectId: "attendanceapp-a03ea",
      storageBucket: "attendanceapp-a03ea.appspot.com",
      messagingSenderId: "422851265218",
      appId: "1:422851265218:web:4a94c3930e2b43a0b0f15b",
      measurementId: "G-WXLGMV0D6S"
    };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const db = getFirestore(app);
  </script>

  <script src="scripts.js"></script>
</body>
</html>
