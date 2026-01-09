import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const logoutBtn = document.getElementById('logout-btn');

//  Security Check)

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in as:", user.email);
    } else {
        window.location.href = "login.html"; // එළියට!
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