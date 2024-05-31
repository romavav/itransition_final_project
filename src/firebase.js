// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCjiP2I8ng24R44PflKZtsFZwuLc8gYyy0",
    authDomain: "itransition-project-firebase.firebaseapp.com",
    projectId: "itransition-project-firebase",
    storageBucket: "itransition-project-firebase.appspot.com",
    messagingSenderId: "528993207512",
    appId: "1:528993207512:web:41a01ac9175db4d0e203ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const auth = getAuth(app);
export { db };