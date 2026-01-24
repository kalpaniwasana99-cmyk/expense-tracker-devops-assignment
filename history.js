import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById('history-container');

onAuthStateChanged(auth, (user) => {
    if (user) { listenToFullHistory(user.uid); } 
    else { window.location.href = "login.html"; }
});

function listenToFullHistory(uid) {
    const q = query(collection(db, "expenses"), where("uid", "==", uid), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        container.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const div = document.createElement('div');
            div.innerHTML = `<span>${item.itemName}</span> - LKR ${item.price} 
                <button onclick="deleteHistoryItem('${docSnap.id}')">Delete</button>`;
            container.appendChild(div);
        });
    });
}
window.deleteHistoryItem = async (id) => { await deleteDoc(doc(db, "expenses", id)); };