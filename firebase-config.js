import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDABz3M9xMIBtXtALKC-N31nExCG_PDL3k",
  authDomain: "expense-tracker-team-c6942.firebaseapp.com",
  projectId: "expense-tracker-team-c6942",
  storageBucket: "expense-tracker-team-c6942.firebasestorage.app",
  messagingSenderId: "873596876456",
  appId: "1:873596876456:web:3bafe0dd791165a111749d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);      
const db = getFirestore(app);   

export { auth, db };