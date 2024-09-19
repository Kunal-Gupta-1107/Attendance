document.getElementById('name').addEventListener('input', function() {
  const nameInput = document.getElementById('name').value;
  const submitButton = document.getElementById('submitButton');
  submitButton.disabled = nameInput.trim() === '';
});

document.getElementById('attendanceForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  if (name.trim() === '') return;

  const attendanceList = document.getElementById('attendanceList');
  const listItem = document.createElement('div');
  listItem.textContent = `${new Date().toLocaleDateString()}: ${name}`;
  attendanceList.appendChild(listItem);

  document.getElementById('name').value = '';
  document.getElementById('submitButton').disabled = true;
});
