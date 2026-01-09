import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('login-form');


if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log("Trying to login...");

        try {
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            
            console.log("Login Successful!");
            alert("Login Successful! Redirecting...");
            window.location.href = "index.html";

        } catch (error) {
            
            console.error("Login Error:", error);
            
            
            alert("Login Failed: " + error.code);
        }
    });
}