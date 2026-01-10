import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log("Attempting to login with:", email); 

    try {
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        
        console.log("Login Successful!", userCredential.user);
        alert("Login Successful! Welcome back.");
        window.location.href = "index.html";

    } catch (error) {
        
        console.error("Login failed:", error);
        
       
        let errorMessage = "Login Failed. Please check your credentials.";
        if (error.code === 'auth/invalid-credential') {
            errorMessage = "Invalid Email or Password.";
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = "No user found with this email.";
        }
        
        alert(errorMessage);
    }
});