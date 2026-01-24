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
        container.innerHTML = snapshot.empty ? 
            "<p style='text-align:center; color:#94a3b8; margin-top:30px;'>No goals set yet.</p>" : "";

        snapshot.forEach((docSnap) => {
            const goalId = docSnap.id;
            const goalData = docSnap.data();
            const current = parseFloat(goalData.currentSaved || 0);
            const target = parseFloat(goalData.targetAmount || 1);
            const progress = (current / target) * 100;

            const card = document.createElement('div');
            card.className = "goal-item-card"; 
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                    <div>
                        <strong style="font-size: 15px; color: #ffffff;">${goalData.goalName}</strong>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                            LKR ${current.toLocaleString()} / ${target.toLocaleString()}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 13px; color: #818cf8; font-weight: 800;">${progress.toFixed(0)}%</span>
                        <button class="delete-btn" onclick="deleteGoal('${goalId}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div style="width: 100%; height: 8px; background: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="width: ${progress > 100 ? 100 : progress}%; height: 100%; background: linear-gradient(to right, #6366f1, #a855f7); transition: width 0.5s ease;"></div>
                </div>
                <div class="add-savings-box" style="display: flex; gap: 8px; margin-top: 12px;">
                    <input type="number" id="save-amount-${goalId}" class="small-input" placeholder="LKR" style="flex:1; padding:5px; border-radius:5px; border:1px solid #475569; background:#0f172a; color:white;">
                    <button class="btn-save-small" onclick="addSavings('${goalId}')" style="background:#6366f1; border:none; color:white; border-radius:5px; padding:5px 10px; cursor:pointer;">Add</button>
                </div>`;
            container.appendChild(card);
        });
    });
}

// function of the update data 
window.addSavings = async (id) => {
    const input = document.getElementById(`save-amount-${id}`);
    const amount = parseFloat(input.value);
    if (amount > 0) {
        await updateDoc(doc(db, "goals", id), { currentSaved: increment(amount) });
        input.value = '';
    }
};

window.deleteGoal = async (id) => { 
    if (confirm("Delete this goal?")) await deleteDoc(doc(db, "goals", id)); 
};