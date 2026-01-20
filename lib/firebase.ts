// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRHHuNeR3qrc8rNfb6kPxo0ZVUN_KPqXw",
  authDomain: "car-maintenance-app-6dda8.firebaseapp.com",
  projectId: "car-maintenance-app-6dda8",
  storageBucket: "car-maintenance-app-6dda8.firebasestorage.app",
  messagingSenderId: "953261336876",
  appId: "1:953261336876:web:bab031a8caf18df6ffe489",
  measurementId: "G-Z74DWKY2JJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
