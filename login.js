import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginBtn = document.getElementById('login-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // පිටුව Refresh වීම වළක්වයි

        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            alert("කරුණාකර ඊමේල් සහ මුරපදය ඇතුළත් කරන්න.");
            return;
        }

        try {
            loginBtn.disabled = true;
            loginBtn.innerText = "Logging in...";

            // 1. Firebase හරහා Login වීම
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login Success:", userCredential.user.email);

            // 2. Dashboard එකට යොමු කිරීම (මෙම පේළිය අනිවාර්යයි)
            window.location.href = "index.html"; 

        } catch (error) {
            loginBtn.disabled = false;
            loginBtn.innerText = "Login Now";
            console.error("Login Error:", error.code);
            
            // වැරදි හඳුනාගැනීම
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                alert("ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි.");
            } else {
                alert("දෝෂයක් පවතී: " + error.message);
            }
        }
    });
}