import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');
const budgetInput = document.getElementById('monthly-budget');
const saveBudgetBtn = document.getElementById('save-budget-btn');
const budgetCard = document.getElementById('budget-card');
const budgetStatus = document.getElementById('budget-status');
const transactionForm = document.getElementById('transaction-form');
const logoutBtn = document.getElementById('logout-btn');

let currentBudget = 0;

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-display-name').innerText = `Hi, ${user.displayName || user.email.split('@')[0]}!`;
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
            alert("Monthly budget limit saved!");
            location.reload(); 
        }
    };
}

function listenToExpenses(uid) {
    const q = query(collection(db, "expenses"), where("uid", "==", uid), orderBy("timestamp", "desc"));
    
    onSnapshot(q, (snapshot) => {
        if (!list) return;
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

        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }
        
        // Corrected comparison logic
        checkBudgetLimit(total);
    });
}

// Logic to show notifications based on budget limit
function checkBudgetLimit(total) {
    const budgetValue = parseFloat(currentBudget);
    const totalValue = parseFloat(total);

    if (budgetValue > 0 && totalValue > budgetValue) {
        // Red alert state
        budgetCard.classList.add('budget-over');
        totalAmountDisplay.classList.add('text-danger');
        budgetStatus.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 8px; border-left: 4px solid #ef4444; margin-top: 10px;">
                <span style="color: #ef4444; font-size: 12px; font-weight: 800;">
                    <i class="fas fa-exclamation-triangle"></i> ALERT: Monthly Budget Exceeded!
                </span>
            </div>
        `;
    } else {
        // Safe state
        budgetCard.classList.remove('budget-over');
        totalAmountDisplay.classList.remove('text-danger');
        if (budgetValue > 0) {
            budgetStatus.innerHTML = `
                <div style="margin-top: 10px;">
                    <span style="color: #10b981; font-size: 11px; font-weight: 600;">
                        <i class="fas fa-check-circle"></i> Spending is within your safe limit.
                    </span>
                </div>
            `;
        } else {
            budgetStatus.innerText = "";
        }
    }
}

if (transactionForm) {
    transactionForm.onsubmit = async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('text');
        const amountInput = document.getElementById('amount');
        const user = auth.currentUser;

        if (textInput.value && amountInput.value && user) {
            try {
                await addDoc(collection(db, "expenses"), {
                    itemName: textInput.value,
                    price: parseFloat(amountInput.value),
                    uid: user.uid,
                    timestamp: new Date()
                });
                textInput.value = '';
                amountInput.value = '';
            } catch (error) {
                console.error("Add Error:", error);
            }
        }
    };
}

window.deleteExpense = async (id) => {
    if (confirm("Delete this transaction?")) {
        await deleteDoc(doc(db, "expenses", id));
    }
};

if (logoutBtn) {
    logoutBtn.onclick = async () => {
        if (confirm("Logout?")) {
            await signOut(auth);
            window.location.href = "login.html";
        }
    };
}