import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Config data
const firebaseConfig = {
  apiKey: "AIzaSyDABz3M9xMIBtXtALKC-N31nExCG_PDL3k",
  authDomain: "expense-tracker-team-c6942.firebaseapp.com",
  projectId: "expense-tracker-team-c6942",
  storageBucket: "expense-tracker-team-c6942.firebasestorage.app",
  messagingSenderId: "873596876456",
  appId: "1:873596876456:web:3bafe0dd791165a111749d"
};

// Firebase Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Offline Persistence activate
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        
        console.warn("Persistence failed: multiple tabs open");
    } else if (err.code == 'unimplemented') {
        
        console.warn("Persistence is not available in this browser");
    }
});


export { auth, db };