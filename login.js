import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log("Connecting to Firebase...");

        try {
            // 1. Firebase Login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Firebase Login Success!");

            // 2. Node.js Backend Notification (ngrok URL එක මෙතනට දමා ඇත)
            try {
                // මෙතන තමයි ඔයා දුන්නු අලුත් ලින්ක් එක තියෙන්නේ
                const response = await fetch('https://nonfeasibly-nonfavorable-dakota.ngrok-free.dev/login-notify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        loginTime: new Date().toISOString()
                    }),
                });

                const data = await response.json();
                console.log('Success: Message from Node.js Backend:', data);

            } catch (backendError) {
                console.error("Backend Error: Cannot connect to Node.js server.", backendError);
            }

            alert("Login Successful! Check your Backend Terminal.");
            
            // පරීක්ෂාව සාර්ථක වූ පසු මෙය ඉවත් කර Dashboard එකට යා හැක
             window.location.href = "index.html";

        } catch (error) {
            console.error("Firebase Login Error:", error);
            alert("Login Failed: " + error.code);
        }
    });
}