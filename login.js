import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
 
const loginBtn = document.getElementById('login-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // stop Refresh page again

        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            alert("please enter email and password..!");
            return;
        }

        try {
            loginBtn.disabled = true;
            loginBtn.innerText = "Logging in...";

            // 1. Firebase Login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login Success:", userCredential.user.email);

            // 2. go to Dashboard 
            window.location.href = "index.html"; 

        } catch (error) {
            loginBtn.disabled = false;
            loginBtn.innerText = "Login Now";
            console.error("Login Error:", error.code);
            
            // error handling
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                alert("Incorrect email or password.");
            } else {
                alert("have a error: " + error.message);
            }
        }
    });
}