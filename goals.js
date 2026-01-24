import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById('goals-list-container');

onAuthStateChanged(auth, (user) => {
    if (user) { 
        listenToGoals(user.uid); 
    } else { 
        window.location.href = "login.html"; 
    }
});

function listenToGoals(uid) {
    const q = query(collection(db, "goals"), where("uid", "==", uid));
    onSnapshot(q, (snapshot) => {
        container.innerHTML = snapshot.empty ? 
            `<div style="text-align:center; padding:40px; color:#64748b;">
                <i class="fas fa-bullseye" style="font-size:40px; margin-bottom:10px;"></i>
                <p>No goals yet. Start saving today!</p>
            </div>` : "";

        snapshot.forEach((docSnap) => {
            const goalId = docSnap.id;
            const goal = docSnap.data();
            const current = parseFloat(goal.currentSaved || 0);
            const target = parseFloat(goal.targetAmount || 1);
            let progress = (current / target) * 100;
            if (progress > 100) progress = 100; 

            const card = document.createElement('div');
            card.className = "goal-item-card";
            
            card.style = "background:#1e293b; border-radius:15px; padding:20px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.2);";

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                    <div>
                        <h3 style="margin:0; color:#f8fafc; font-size:18px;">${goal.goalName}</h3>
                        <p style="margin:5px 0 0; color:#94a3b8; font-size:13px;">
                            Target: <span style="color:#818cf8; font-weight:bold;">LKR ${target.toLocaleString()}</span>
                        </p>
                    </div>
                    <button class="delete-btn" onclick="deleteGoal('${goalId}')" style="background:rgba(239,68,68,0.1); color:#ef4444; border:none; padding:8px; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

                <div style="background:#0f172a; height:12px; border-radius:10px; position:relative; overflow:hidden; margin-bottom:10px; border:1px solid rgba(255,255,255,0.1);">
                    <div style="width:${progress}%; height:100%; background:linear-gradient(90deg, #6366f1, #a855f7); border-radius:10px; transition:width 0.8s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                </div>
                
                <div style="display:flex; justify-content:space-between; font-size:12px; color:#cbd5e1; margin-bottom:20px;">
                    <span>Saved: LKR ${current.toLocaleString()}</span>
                    <span style="font-weight:bold; color:#818cf8;">${progress.toFixed(1)}%</span>
                </div>

                <div style="display:flex; gap:10px; background:rgba(15,23,42,0.5); padding:10px; border-radius:10px;">
                    <input type="number" id="input-${goalId}" placeholder="Enter amount to save" 
                        style="flex:1; background:transparent; border:1px solid #334155; color:white; padding:8px; border-radius:6px; outline:none; font-size:14px;">
                    <button onclick="addMoney('${goalId}')" 
                        style="background:#6366f1; color:white; border:none; padding:8px 15px; border-radius:6px; font-weight:600; cursor:pointer; transition:0.3s;">
                        Add Money
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

// Add Money Function
window.addMoney = async (id) => {
    const input = document.getElementById(`input-${id}`);
    const amount = parseFloat(input.value);
    
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }

    try {
        const goalRef = doc(db, "goals", id);
        await updateDoc(goalRef, {
            currentSaved: increment(amount)
        });
        input.value = ""; 
    } catch (error) {
        console.error("Error adding money:", error);
    }
};

window.deleteGoal = async (id) => {
    if (confirm("Are you sure you want to delete this goal?")) {
        await deleteDoc(doc(db, "goals", id));
    }
};