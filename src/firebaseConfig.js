// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";        // Import getAuth
import { getFirestore } from "firebase/firestore"; // Import getFirestore
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDB_hunhi2M8b9UuAiMyxiIJMCac2fHGcY",
  authDomain: "kitsreview-9fdad.firebaseapp.com",
  projectId: "kitsreview-9fdad",
  storageBucket: "kitsreview-9fdad.firebasestorage.app",
  messagingSenderId: "963311946672",
  appId: "1:963311946672:web:28dea06346ecd4bfa7a475",
  measurementId: "G-RGDBPFP61M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
