import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const logoutBtn = document.getElementById('logout-btn');

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in:", user.email);
    } else {
        window.location.href = "login.html";
    }
});

//  Logout Button 
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            alert("Logged out successfully!");
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });
}