import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginBtn = document.getElementById('login-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

// Redirect Loop වැළැක්වීමට - දැනටමත් ලොග් වී ඇත්නම් යවන්න
onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "index.html";
});

if (loginBtn) {
    loginBtn.onclick = async (e) => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        try {
            loginBtn.disabled = true;
            loginBtn.innerText = "Logging in...";
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "index.html";
        } catch (error) {
            loginBtn.disabled = false;
            loginBtn.innerText = "Login Now";
            alert("Error: " + error.message);
        }
    };
}