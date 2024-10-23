import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBFJrziRByYb0EwC2sYfP_cLtiQJlS02cY",
    authDomain: "attendance-38541.firebaseapp.com",
    projectId: "attendance-38541",
    storageBucket: "attendance-38541.appspot.com",
    messagingSenderId: "439358946279",
    appId: "1:439358946279:web:fe466a68db5e8ad77f1b42"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
// Function to retrieve the attendance code from Firestore
const retrieveAttendanceCode = async () => {
    // Reference the specific document in Firestore
    const codeDoc = doc(db, 'attendanceCodes', 'currentCode');
    try {
        const docSnapshot = await getDoc(codeDoc);
        if (docSnapshot.exists()) {
            const validCode = docSnapshot.data().code;  // Get the stored code
            console.log("Attendance Code: Beta Code to Hidden hai");  // Log the retrieved code
            return validCode;  // Return the code
        } else {
            console.log("No such document found in Firestore.");
            return null;
        }
    } catch (error) {
        console.error("Error retrieving attendance code:", error);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('attendanceForm');
    const nameInput = document.getElementById('name');
    const codeInput = document.getElementById('attendanceCode');
    const submitButton = document.getElementById('submitButton');
    const attendanceList = document.getElementById('attendanceList').getElementsByTagName('tbody')[0];
    const locationModal = document.getElementById('locationModal');
    const closeModal = document.getElementById('closeModal');
    let deferredPrompt;
    console.log("i am called0");
    displayAttendance();

    async function displayAttendance() {
        console.log("i am called");
        attendanceList.innerHTML = ''; // Clear the current attendance list
        const querySnapshot = await getDocs(collection(db, "attendance"));
        const attendanceRecords = [];
    
        const today = new Date();
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let attendanceDate;
            let hiddenCode = "Hidden";
    
            if (data.date && data.date.includes('/')) {
                const dateParts = data.date.split('/');
                if (dateParts.length === 3) {
                    const mmddDate = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`);
                    if (!isNaN(mmddDate) && mmddDate.toLocaleDateString() === today.toLocaleDateString()) {
                        attendanceDate = mmddDate;
                    }
    
                    const ddmmDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                    if (!attendanceDate && !isNaN(ddmmDate) && ddmmDate.toLocaleDateString() === today.toLocaleDateString()) {
                        attendanceDate = ddmmDate;
                    }
                }
            }
    
            if (attendanceDate) {
                attendanceRecords.push({
                    name: data.name,
                    code: hiddenCode,
                    date: attendanceDate,
                    timestamp: data.timestamp
                });
            }
        });
    
        attendanceRecords.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
    
        if (attendanceRecords.length > 0) {
            attendanceRecords.forEach((record) => {
                const row = attendanceList.insertRow();
                row.insertCell(0).textContent = record.name;
                row.insertCell(1).textContent = record.code;
                row.insertCell(2).textContent = record.date.toLocaleDateString();
            });
        } else {
            const row = attendanceList.insertRow();
            row.insertCell(0).textContent = "No Record For Today";
            row.insertCell(1).textContent = "No Code For Attendance";
            row.insertCell(2).textContent = today.toLocaleDateString();
        }
        
    }
    

    const targetLocation = { lat: 27.1862, lon: 78.0031 }; // Change to your target latitude and longitude
    const radius = 100; // Distance in meters

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
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        const distance = getDistance(latitude, longitude, targetLocation.lat, targetLocation.lon);
                        resolve(distance <= radius);
                    },
                    (error) => {
                        locationModal.style.display = 'flex';
                        reject(false);
                    }
                );
            } else {
                locationModal.style.display = 'flex';
                reject(false);
            }
        });
    }

    

    async function checkDuplicate(name, date) {
        const attendanceQuery = query(collection(db, "attendance"), where("name", "==", name), where("date", "==", date));
        const querySnapshot = await getDocs(attendanceQuery);
        return !querySnapshot.empty;
    }

    async function addAttendance(name, attendanceCode) {
        await addDoc(collection(db, "attendance"), {
            name: name,
            attendanceCode: attendanceCode,
            timestamp: serverTimestamp(),
            date: new Date().toLocaleDateString() // Store date as a string
        });
    }


    nameInput.addEventListener('input', () => {
        submitButton.disabled = !(nameInput.value.trim() && codeInput.value.trim());

    });

    codeInput.addEventListener('input', () => {
        submitButton.disabled = !(nameInput.value.trim() && codeInput.value.trim());  
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        // Show the spinner when form submission starts
        document.getElementById('loading-spinner-container').style.display = 'flex';
    
        try {
            const name = nameInput.value.trim();
            const attendanceCode = codeInput.value.trim();
            const isWithinLocation = await checkLocation();
            const currentCode = await retrieveAttendanceCode();
    
            if (isWithinLocation) {
                const currentDate = new Date().toLocaleDateString();
                const isDuplicate = await checkDuplicate(name, currentDate);
    
                if (!isDuplicate && attendanceCode === currentCode) {
                    await addAttendance(name, attendanceCode);
                    alert('Attendance marked successfully!');
                    nameInput.value = '';
                    codeInput.value = '';
                    submitButton.disabled = true;
                } else {
                    alert(isDuplicate ? 'Attendance already marked for today.' : 'Incorrect attendance code.');
                }
            } else {
                alert('Location access denied or outside the required location.');
            }
        } catch (error) {
            console.error('Error during attendance submission:', error);
            alert('An error occurred. Please try again.');
        } finally {
            // Hide the spinner after all operations are complete
            document.getElementById('loading-spinner-container').style.display = 'none';
        }
    });
    closeModal.addEventListener('click', () => {
        locationModal.style.display = 'none';
    });
});
