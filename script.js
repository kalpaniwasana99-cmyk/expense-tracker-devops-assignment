import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');
const budgetInput = document.getElementById('monthly-budget');
const saveBudgetBtn = document.getElementById('save-budget-btn');
const budgetCard = document.getElementById('budget-card');
const budgetStatus = document.getElementById('budget-status');

let currentBudget = 0;

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-display-name').innerText = `Hi, ${user.displayName || 'User'}!`;
        loadBudget(user.uid);
        listenToExpenses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

async function loadBudget(uid) {
    const budgetDoc = await getDoc(doc(db, "budgets", uid));
    if (budgetDoc.exists()) {
        currentBudget = parseFloat(budgetDoc.data().limit);
        budgetInput.value = currentBudget;
    }
}

if (saveBudgetBtn) {
    saveBudgetBtn.onclick = async () => {
        const user = auth.currentUser;
        const limit = parseFloat(budgetInput.value);
        if (user && !isNaN(limit)) {
            await setDoc(doc(db, "budgets", user.uid), { limit: limit });
            currentBudget = limit;
            alert("Budget saved!");
            location.reload(); 
        }
    };
}

function listenToExpenses(uid) {
    const q = query(collection(db, "expenses"), where("uid", "==", uid), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        list.innerHTML = snapshot.empty ? "<p style='text-align:center; color:#94a3b8; font-size:13px;'>No transactions yet.</p>" : "";
        let total = 0;

        snapshot.forEach((docSnap) => {
            const item = docSnap.data();
            total += parseFloat(item.price || 0);
            const li = document.createElement('li');
            li.setAttribute('style', 'display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-bottom: 1px solid rgba(0,0,0,0.05);');
            li.innerHTML = `
                <div>
                    <span style="font-weight: 600; color: #1e293b; display: block;">${item.itemName}</span>
                    <small style="color: #64748b;">LKR ${parseFloat(item.price).toLocaleString()}</small>
                </div>
                <button class="delete-btn" onclick="deleteExpense('${docSnap.id}')"><i class="fas fa-trash"></i></button>`;
            list.appendChild(li);
        });

        totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        checkBudgetLimit(total);
    });
}

function checkBudgetLimit(total) {
    if (currentBudget > 0 && total > currentBudget) {
        budgetCard.classList.add('budget-over');
        totalAmountDisplay.classList.add('text-danger');
        budgetStatus.innerText = "⚠️ Alert: Monthly Budget Exceeded!";
        budgetStatus.style.color = "#ef4444";
    } else {
        budgetCard.classList.remove('budget-over');
        totalAmountDisplay.classList.remove('text-danger');
        budgetStatus.innerText = currentBudget > 0 ? "Spending is within limit." : "";
        budgetStatus.style.color = "#10b981";
    }
}

// Global delete function
window.deleteExpense = async (id) => {
    if (confirm("Delete this?")) await deleteDoc(doc(db, "expenses", id));
};