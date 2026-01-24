import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById('goals-list-container');
const addGoalBtn = document.getElementById('add-goal-btn');

onAuthStateChanged(auth, (user) => {
    if (user) { listenToGoals(user.uid); } 
    else { window.location.href = "login.html"; }
});

function listenToGoals(uid) {
    const q = query(collection(db, "goals"), where("uid", "==", uid));
    onSnapshot(q, (snapshot) => {
        container.innerHTML = snapshot.empty ? "<p>No goals set yet.</p>" : "";
        snapshot.forEach((docSnap) => {
            const goalData = docSnap.data();
            const progress = (goalData.currentSaved / goalData.targetAmount) * 100;
            const card = document.createElement('div');
            card.className = "goal-item-card";
            card.innerHTML = `<strong>${goalData.goalName}</strong> - ${progress.toFixed(0)}%
                <button onclick="deleteGoal('${docSnap.id}')">Delete</button>`;
            container.appendChild(card);
        });
    });
}
window.deleteGoal = async (id) => { await deleteDoc(doc(db, "goals", id)); };