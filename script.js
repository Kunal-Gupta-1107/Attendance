if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);

        // Listen for updates to the service worker
        registration.onupdatefound = () => {
            const newWorker = registration.installing;

            newWorker.onstatechange = () => {
                if (newWorker.state === 'installed') {
                    // If there's a new service worker and the page is still using the old one
                    if (navigator.serviceWorker.controller) {
                        // Notify user about the new version
                        showUpdateNotification();
                    }
                }
            };
        };
    }).catch((error) => {
        console.error('Service Worker registration failed:', error);
    });
}



import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


let db;

// // Function to initialize Firebase securely
// const initializeFirebase = async () => {
//     try {
//         const response = await fetch("/api/getAttendance"); // Fetch Firebase config
//         if (!response.ok) throw new Error("Failed to fetch Firebase config");

//         const config = await response.json();
//         // Ensure the config is valid before using it
//         if (!config.apiKey || !config.projectId) {
//             throw new Error("Invalid Firebase Config Received");
//         }
//         const app = initializeApp(config);
//         db = getFirestore(app); // Assign db after successful initialization

//         console.log("🔥 Firebase Initialized Securely");

//         // Now call functions that require `db`
//        // fetchMessages(); // Ensure this runs only after Firebase is ready
//     } catch (error) {
//         console.error("❌ Firebase Initialization Error:", error);
//     }
// };

// Call initialization function
//initializeFirebase();



// const app = initializeFirebase();
//const db = getFirestore(app);


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
    const seeFriendsButton = document.getElementById('seeFriendsButton');
    const timeButton = document.getElementById('time-btn');

    if (seeFriendsButton) {
        seeFriendsButton.addEventListener('click', async () => {
            window.location.href = 'index2.html';
        });
    }

    // Check if the 'refreshResult' button exists before adding an event listener
    const refreshResultButton = document.getElementById('refreshResult');
    if (refreshResultButton) {
        refreshResultButton.addEventListener('click', async () => {
            document.getElementById('loading-spinner-container').style.display = 'flex';
            await displayAttendance();
            document.getElementById('loading-spinner-container').style.display = 'none';
        });
    }
   

    const targetLocation = { lat: 27.1862, lon: 78.0031 }; 
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
        try {
            const attendanceData = {
                name: name,
                attendanceCode: attendanceCode,
                timestamp: new Date().toISOString(), // Store timestamp as a string
                date: new Date().toLocaleDateString() // Store date as a string
            };
    
            const response = await fetch('/api/addAttendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attendanceData) // Send the attendance data
            });
    
            const result = await response.json();
            if (response.ok) {
                console.log('✅ Attendance added successfully:', result);
            } else {
                console.error('❌ Error adding attendance:', result.error);
            }
    
        } catch (error) {
            console.error('❌ Request Failed:', error);
        }
    }


    if (nameInput) { // coz isn't in 2
        nameInput.addEventListener('input', () => {
            submitButton.disabled = !(nameInput.value.trim() && codeInput.value.trim());

        });
    }
    if (codeInput) { // coz isn't in 2
        codeInput.addEventListener('input', () => {
            submitButton.disabled = !(nameInput.value.trim() && codeInput.value.trim());  
        });
    }

    if(form) { // coz isn't in 2
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
    }

        const installButton = document.getElementById("installButton");
        
        if (installButton) {
            window.addEventListener("beforeinstallprompt", (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                installButton.style.display = "block";
            });
            installButton.addEventListener("click", async () => {
                const deferredPrompt = window.deferredPrompt;
        
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    window.deferredPrompt = null;
                    installButton.style.display = "none";
                }
            });
        } //else {
        //     console.warn("Install button not found in this HTML file.");
        // }

    if(closeModal) { // coz isn't in 2
        closeModal.addEventListener('click', () => {
            locationModal.style.display = 'none';
        });
    }

    const closeChatButton = document.getElementById('close-chat-button');
    if (closeChatButton) {
        closeChatButton.addEventListener('click', () => {
            const chatSection = document.getElementById('chat-section');
            if (chatSection) {
                chatSection.style.display = 'none';
            }
        });
    } 
    const chatButton = document.getElementById('open-chat-button');
    if (chatButton) {
        chatButton.addEventListener('click', () => {
            const chatSection = document.getElementById('chat-section');
            if (chatSection) {
                chatSection.style.display = 'block';
            }
        });
    }
    const chatInput = document.getElementById("chat-input");

    if (chatInput) {
        let notificationSent = false; //flaging for once

        chatInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && chatInput.value.trim() !== "") {
                if (!notificationSent) {
                    Notification.requestPermission().then(perm => {
                        if (perm === "granted") {
                            navigator.serviceWorker.ready.then(registration => {
                                registration.showNotification("I Welcome you!", {
                                    body: "Thanks for enabling me.😊",
                                    icon: "https://kunal-gupta-1107.github.io/Attendance/icon.png",
                                    badge: "/Attendance/badge.png",
                                    vibrate: [200, 100, 200] 
                                });
                            });
                            // console.log("msg sd ent");
                            notificationSent = true;
                        } else {
                            alert("Notification permission denied!");
                        }
                    });
                }   
                sendMessage();
                event.target.value = ""; //CLEAR KAREGA INPUT
            }
        });
    }

    
    const sendButton = document.getElementById("send-button");
    if (sendButton) {
        let notificationSent = false;
        sendButton.addEventListener("click", () => {
            //Noti...
            if (!notificationSent) {
                Notification.requestPermission().then(perm => {
                    if (perm === "granted") {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.showNotification("I Welcome you!", {
                                body: "Thanks for enabling me.😊",
                                icon: "https://kunal-gupta-1107.github.io/Attendance/icon.png",
                                badge: "/Attendance/badge.png",
                                vibrate: [200, 100, 200]     
                            });
                            // console.log("msg sd by bt");
                        });

                        notificationSent = true;
                    } else {
                        alert("Notification permission denied!");
                    }
                });
            }
            if (chatInput && chatInput.value.trim() !== "") {
                sendMessage();
                chatInput.value = ""; //CLEAR KAREGA INPUT
            }
        })
    }

    const getTodayCollectionId = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };



});
async function displayAttendance() {
    const attendanceList = document.getElementById('attendanceList').getElementsByTagName('tbody')[0];
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
function getTodayCollectionId() {
    let now = new Date();
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Add leading zero if month is single-digit
    let day = String(now.getDate()).padStart(2, '0'); // Add leading zero if day is single-digit

    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
}


async function sendMessageToFirebase(message, sender) {
    const collectionId = getTodayCollectionId(); // Get today's date as collection ID
    const messageRef = collection(db, `group_chats/${collectionId}/messages`);
    await addDoc(messageRef, {
        message: message,
        sender: sender,
        time: serverTimestamp()
    });
}

async function sendMessage() {
    let inputField = document.getElementById('chat-input');
    let message = inputField.value.trim();
    const sender = "Tester";
  
    if (message) {
        let now = new Date();
        let currentDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });  
        let time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false        });

        let lastMessageDate = sessionStorage.getItem('lastMessageDate'); //stores the last msg data

        // If the message date has changed, insertING a date separator
        if (lastMessageDate !== currentDate) {
            let dateSeparator = document.createElement('div');
            dateSeparator.classList.add('date-separator');
            dateSeparator.innerHTML = `<p>${currentDate}</p>`;
            document.querySelector('.chat-body').appendChild(dateSeparator);

            // Update the session storage with the current date
            sessionStorage.setItem('lastMessageDate', currentDate);
        }

      // User message
      let messageContainer = document.createElement('div');
      messageContainer.classList.add('message');
      messageContainer.classList.add('user-msg');
      messageContainer.innerHTML = `
      <p>${message}</p>
      <span class="message-time">${time}</span>`;

      document.querySelector('.chat-body').appendChild(messageContainer);
      await sendMessageToFirebase(message, sender); //Send msg to server  
      inputField.value = ''; // Clear input field
  
      // Scroll to the bottom
      scrollToBottom();
  
      // Simulate bot response
      setTimeout(() => {
        let botMessage = document.createElement('div');
        botMessage.classList.add('message');
        botMessage.classList.add('bot-msg');
        botMessage.innerHTML = `<p>You are in Testing Phase, Everything is <strong> recorded </strong>.</p>`;
        
        document.querySelector('.chat-body').appendChild(botMessage);
  
        // Scroll to the bottom
        scrollToBottom();
      }, 1000); // Bot replies after 1 second
    }
  }
  

  
  // Function to scroll to the bottom of the chat body
  function scrollToBottom() {
    const chatBody = document.querySelector('.chat-body');
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  
  document.addEventListener('copy',function (event){
    event.preventDefault();
  
    const textToCopy  =  'Try to Write, Not to Copy Buddy!';
    event.clipboardData.setData('text/plain',textToCopy);
  });




  

// func to fectch display messages from Firebase
async function fetchMessages() {
    if (!db) {
        console.error("❌ Firestore is not initialized yet!");
        return;
    }
    const collectionId = getTodayCollectionId(); // Get today's collection ID
    const messagesRef = collection(db, `group_chats/${collectionId}/messages`); // Reference to the collection
    console.log("📂 Firestore Collection Reference Created:", messagesRef);

    // Fetching data from Firestore
    const querySnapshot = await getDocs(messagesRef);
    const messagesContainer = document.querySelector('.chat-body'); // The div where you want to display the messages

    if (!messagesContainer) {
        // console.log('Not is Index-2');
        return; // Exit the function if .chat-body is not found
    }

    // Clear current messages before displaying new ones
    messagesContainer.innerHTML = '';


    const welcomeMessage = document.createElement('div');
    welcomeMessage.classList.add('message', 'default-msg');
    welcomeMessage.innerHTML = `
        <p>Welcome to <strong>MarkMates Group</strong> chat!</p>
        <span class="message-time">00:00</span>
        <p> Must Read our <a href="https://kunal-gupta-1107.github.io/Attendance/T&C.html">T&C.</a></p>
        <span class="message-time">00:00</span>
        <p> Be part of our survey: <a href="https://forms.gle/2N1T2HvWHU9J9fW96">Let's go</a>.</p>
    `;
    messagesContainer.appendChild(welcomeMessage);


    let messagesArray = [];
    
    querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        messagesArray.push({
            message: messageData.message,
            sender: messageData.sender,
            time: new Date(messageData.time.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        });
    });

    // Reverse the array so latest messages come last
    messagesArray.reverse();

    // Loop through the reversed messages array and append them to the chat
    messagesArray.forEach((messageData) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(messageData.sender === "Tester" ? 'user-msg' : 'bot-msg');
        
        // Create HTML structure for the message
        messageElement.innerHTML = `
            <p>${messageData.message}</p>
            <span class="message-time">${messageData.time}</span>
        `;
        
        messagesContainer.appendChild(messageElement);
    });

    // Scroll to the bottom after loading all messages (including the welcome message and all Firestore messages)
    scrollToBottom();
}

// Call the fetchMessages function when the page loads
window.addEventListener('load', async () => {
    console.log("🔥 Page loaded. Fetching messages...");
    fetchMessages(); // Call your Firestore function safely
});



function showUpdateNotification() {
    const updateDiv = document.createElement('div');
    updateDiv.innerText = 'A new version is available. Click to update!';
    updateDiv.style.position = 'fixed';
    updateDiv.style.bottom = '20px';
    updateDiv.style.left = '50%';
    updateDiv.style.transform = 'translateX(-50%)';
    updateDiv.style.background = '#007bff';
    updateDiv.style.color = 'white';
    updateDiv.style.padding = '10px 20px';
    updateDiv.style.borderRadius = '5px';
    updateDiv.style.cursor = 'pointer';
    updateDiv.style.zIndex = '9999';
    document.body.appendChild(updateDiv);

    // On click, reload the page to activate the new service worker
    updateDiv.addEventListener('click', () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
        }
        window.location.reload();
    });
}
