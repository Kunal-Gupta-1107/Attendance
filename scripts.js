form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = nameInput.value;

  if (name) {
    // Add 'loading' class to change button color to white
    submitButton.classList.add('loading');
    submitButton.disabled = true;  // Disable the button while loading
    showLoading(); // Show the loading spinner when the button is clicked

    const isInArea = await checkLocation();
    
    hideLoading(); // Hide the spinner after location checking is done
    submitButton.classList.remove('loading'); // Remove 'loading' class when done
    submitButton.disabled = false; // Enable button again after processing

    if (isInArea) {
      try {
        // Add attendance record to Firestore
        const docRef = await addDoc(collection(db, 'attendance'), {
          name: name,
          timestamp: serverTimestamp(),
        });

        alert('Attendance recorded in Firestore!');
        form.reset();
        displayAttendance();
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      alert('You are not within the required area.');
    }
  }
});
