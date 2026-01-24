import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById('goals-list-container');
const addGoalBtn = document.getElementById('add-goal-btn');

onAuthStateChanged(auth, (user) => {
    if (user) { 
        listenToGoals(user.uid); 
    } else { 
        window.location.href = "login.html"; 
    }
});

// add new goal
if (addGoalBtn) {
    addGoalBtn.onclick = async () => {
        const nameInput = document.getElementById('goal-name');
        const targetInput = document.getElementById('target-amount');
        const user = auth.currentUser;

        if (nameInput.value && targetInput.value && user) {
            try {
                await addDoc(collection(db, "goals"), {
                    goalName: nameInput.value,
                    targetAmount: parseFloat(targetInput.value),
                    currentSaved: 0,
                    uid: user.uid,
                    createdAt: new Date()
                });
                nameInput.value = '';
                targetInput.value = '';
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };
}

function listenToGoals(uid) {
    const q = query(collection(db, "goals"), where("uid", "==", uid));
    onSnapshot(q, (snapshot) => {
        container.innerHTML = snapshot.empty ? 
            "<p style='text-align:center; color:#94a3b8;'>No goals set yet.</p>" : "";

        snapshot.forEach((docSnap) => {
            const goalData = docSnap.data();
            const current = parseFloat(goalData.currentSaved || 0);
            const target = parseFloat(goalData.targetAmount || 1);
            const progress = (current / target) * 100;

            const card = document.createElement('div');
            card.className = "goal-item-card"; 
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: white;">${goalData.goalName}</strong>
                        <div style="font-size: 11px; color: #94a3b8;">${progress.toFixed(0)}% Completed</div>
                    </div>
                    <button class="btn-delete" onclick="deleteGoal('${docSnap.id}')">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>`;
            container.appendChild(card);
        });
    });
}

window.deleteGoal = async (id) => { 
    if (confirm("Are you sure?")) {
        await deleteDoc(doc(db, "goals", id)); 
    }
};