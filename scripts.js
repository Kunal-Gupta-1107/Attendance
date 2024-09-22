// Handle form submission
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const name = nameInput.value;

  if (name) {
    submitButton.classList.add('clicked'); // Change the button color to white when clicked
    submitButton.disabled = true; // Disable the button while processing
    showLoading(); // Show the loading spinner when the button is clicked

    const isInArea = await checkLocation();
    
    hideLoading(); // Hide the spinner after location checking is done
    submitButton.classList.remove('clicked'); // Remove the clicked class after processing
    submitButton.disabled = false; // Re-enable the button after processing
    
    if (isInArea) {
      try {
        // Add attendance record to Firestore
        const docRef = await addDoc(collection(db, 'attendance'), {
          name: name,
          timestamp: serverTimestamp(),
        });

        alert('Attendance recorded in Firestore!');
        form.reset();
        submitButton.disabled = true; // Disable button again after form reset
        displayAttendance();
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      alert('You are not within the required area.');
    }
  }
});
