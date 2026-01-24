import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
        onSnapshot(q, (snapshot) => {
            const data = {};
            snapshot.forEach(doc => {
                const item = doc.data();
                data[item.itemName] = (data[item.itemName] || 0) + parseFloat(item.price);
            });
            // Chart logic insert
        });
    } else { window.location.href = "login.html"; }
});