import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// correct HTML Elements 
const registerBtn = document.getElementById('register-btn');
const regName = document.getElementById('reg-name');
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');

if (registerBtn) {
    registerBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // stop refresh pages

        const name = regName.value.trim();
        const email = regEmail.value.trim();
        const password = regPassword.value.trim();

        if (!name || !email || !password) {
            alert("please enter all correct information.");
            return;
        }

        try {
            // button disable
            registerBtn.disabled = true;
            registerBtn.innerText = "Processing...";

            // 1. create Firebase account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. save username
            await updateProfile(user, { displayName: name });

            alert("Register Successfully..!");

            // 3. go to Dashboard 
            window.location.href = "index.html"; 

        } catch (error) {
            registerBtn.disabled = false;
            registerBtn.innerText = "Register Now";
            console.error("Error code:", error.code);
            alert("has an error: " + error.message);
        }
    });
}