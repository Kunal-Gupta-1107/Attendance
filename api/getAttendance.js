import firebaseAdmin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Make sure newlines in private key are handled correctly
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export default async function handler(req, res) {
  try {
    // Example of accessing Firestore or another Firebase service
    const db = firebaseAdmin.firestore();
    const attendanceRef = db.collection('attendance');
    const snapshot = await attendanceRef.get();

    if (snapshot.empty) {
      res.status(404).json({ message: 'No attendance records found.' });
      return;
    }

    const attendanceData = snapshot.docs.map(doc => doc.data());
    res.status(200).json({ message: 'Successfully retrieved attendance data.', data: attendanceData });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'An error occurred while fetching data.' });
  }
}
