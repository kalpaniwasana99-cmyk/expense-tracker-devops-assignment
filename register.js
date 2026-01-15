import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// HTML Elements නිවැරදිව සම්බන්ධ කිරීම
const registerBtn = document.getElementById('register-btn');
const regName = document.getElementById('reg-name');
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');

if (registerBtn) {
    registerBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // පිටුව Refresh වීම වැළැක්වීමට

        const name = regName.value.trim();
        const email = regEmail.value.trim();
        const password = regPassword.value.trim();

        if (!name || !email || !password) {
            alert("කරුණාකර සියලුම විස්තර ඇතුළත් කරන්න.");
            return;
        }

        try {
            // බොත්තම තාවකාලිකව අක්‍රිය කිරීම
            registerBtn.disabled = true;
            registerBtn.innerText = "Processing...";

            // 1. Firebase ගිණුම සෑදීම
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. පරිශීලකයාගේ නම සේව් කිරීම
            await updateProfile(user, { displayName: name });

            alert("ලියාපදිංචිය සාර්ථකයි!");

            // 3. Dashboard එකට යොමු කිරීම
            window.location.href = "index.html"; 

        } catch (error) {
            registerBtn.disabled = false;
            registerBtn.innerText = "Register Now";
            console.error("Error code:", error.code);
            alert("දෝෂයක් පවතී: " + error.message);
        }
    });
}