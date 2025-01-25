# Attendance PWA

## Overview
The *Attendance PWA* is a progressive web application designed to simplify attendance marking for students. The application allows students to mark their attendance only if they are within a **25-meter radius** of the classroom's GPS coordinates. It is built using *HTML, CSS, and JavaScript* and utilizes **Firebase** for secure attendance storage.

## Features
- 📍 **GPS-based Attendance**: Students can only mark attendance when they are near the classroom.
- 🔐 **Unique Code Validation**: Ensures only authorized students can mark attendance.
- 🌐 **Progressive Web App (PWA)**: Works offline with a cached version.
- 🔒 **Right-click Disabled**: Prevents easy access to the source code.
- ⚠️ **Real-time Alerts**:
  - If location services are disabled, an alert prompts the user to enable them.
  - If the code is incorrect, an alert notifies the user.
- ✅ **Successful Confirmation**: Displays a message once attendance is marked.
- 🔧 **Future Enhancements**:
  - 🔹 Secure chat function for selected users.
  - 🔹 Improved Firebase security measures.
  - 🔹 Integration with Salesforce for authentication.

## Deployment
The PWA is hosted on **GitHub Pages** and can be accessed at:
🔗 [Attendance PWA](https://kunal-gupta-1107.github.io/Attendance/)

## Installation
You can install the PWA on your device for a native-like experience:
1. Open the link in **Google Chrome** or any PWA-supported browser.
2. Click on the **Install** or **Add to Home Screen** option.
3. Launch the app from your home screen.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Database & Authentication)
- **Hosting**: GitHub Pages
- **Security**: API key management and restricted access implementation

## Security Considerations
- **API Key Visibility**: Currently, Firebase API keys are exposed in JavaScript. A secure method is being implemented to protect them.
- **Access Control**: Plans to integrate authentication via Vercel to enhance security.
- **Chat Function**: Upcoming chat feature will ensure only selected users can communicate.

## How Attendance Works
1. The student enters their **Name** and **Unique Attendance Code**.
2. The app checks the **GPS location**.
3. If within the allowed range, attendance is recorded.
4. A confirmation message appears upon successful attendance marking.


## Contribution
Feel free to contribute by raising issues or suggesting improvements. Fork the repository and submit a pull request with your changes.

## License
This project is **open-source** and available under the **MIT License**.

---
💡 *Developed by Kunal Gupta with a vision to make attendance marking seamless and secure.*

