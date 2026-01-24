import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const registerBtn = document.getElementById('register-btn');
const regName = document.getElementById('reg-name');
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');

onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "index.html";
});

if (registerBtn) {
    registerBtn.onclick = async (e) => {
        e.preventDefault();
        const name = regName.value.trim();
        const email = regEmail.value.trim();
        const password = regPassword.value.trim();
        try {
            registerBtn.disabled = true;
            registerBtn.innerText = "Registering...";
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            window.location.href = "index.html";
        } catch (error) {
            registerBtn.disabled = false;
            registerBtn.innerText = "Register Now";
            alert("Error: " + error.message);
        }
    };
}