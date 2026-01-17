import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc, setDoc, getDoc, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');
const budgetInput = document.getElementById('monthly-budget');
const saveBudgetBtn = document.getElementById('save-budget-btn');
const budgetCard = document.getElementById('budget-card');
const budgetStatus = document.getElementById('budget-status');
const transactionForm = document.getElementById('transaction-form');
const logoutBtn = document.getElementById('logout-btn');

let currentBudget = 0;

// Authenticate user and start listening immediately
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-display-name').innerText = `Hi, ${user.displayName || user.email.split('@')[0]}!`;
        
        // Start both processes simultaneously for better speed
        loadBudget(user.uid);
        listenToExpenses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

// Load budget from Firestore
async function loadBudget(uid) {
    try {
        const budgetDoc = await getDoc(doc(db, "budgets", uid));
        if (budgetDoc.exists()) {
            currentBudget = parseFloat(budgetDoc.data().limit);
            budgetInput.value = currentBudget;
        }
    } catch (error) {
        console.error("Error loading budget:", error);
    }
}

// Save budget - Optimized to update UI without reload
if (saveBudgetBtn) {
    saveBudgetBtn.onclick = async () => {
        const user = auth.currentUser;
        const limitVal = parseFloat(budgetInput.value);
        if (user && !isNaN(limitVal)) {
            try {
                await setDoc(doc(db, "budgets", user.uid), { limit: limitVal });
                currentBudget = limitVal;
                alert("Monthly budget limit saved!");
                
                // Manually trigger a UI check instead of location.reload()
                const currentTotal = parseFloat(totalAmountDisplay.innerText.replace(/[^\d.-]/g, '')) || 0;
                checkBudgetLimit(currentTotal);
            } catch (error) {
                console.error("Save Budget Error:", error);
            }
        }
    };
}

// Listen to expenses (Speed optimized with limit and better clearing logic)
function listenToExpenses(uid) {
    const q = query(
        collection(db, "expenses"), 
        where("uid", "==", uid), 
        orderBy("timestamp", "desc"),
        limit(10) 
    );
    
    onSnapshot(q, (snapshot) => {
        if (!list) return;
        
        // Clear the list every time data changes to prevent duplication or empty states
        list.innerHTML = "";

        if (snapshot.empty) {
            list.innerHTML = "<p style='text-align:center; color:#94a3b8; font-size:13px;'>No transactions yet.</p>";
            if (totalAmountDisplay) totalAmountDisplay.innerText = "Rs. 0.00";
            checkBudgetLimit(0);
        } else {
            let total = 0;
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                total += parseFloat(item.price || 0);
                
                const li = document.createElement('li');
                li.setAttribute('style', 'display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-bottom: 1px solid rgba(0,0,0,0.05);');
                li.innerHTML = `
                    <div>
                        <span style="font-weight: 600; color: #1e293b; display: block; font-size: 15px;">${item.itemName}</span>
                        <small style="color: #64748b;">LKR ${parseFloat(item.price).toLocaleString()}</small>
                    </div>
                    <button class="delete-btn" onclick="deleteExpense('${docSnap.id}')">
                        <i class="fas fa-trash"></i>
                    </button>`;
                list.appendChild(li);
            });

            if (totalAmountDisplay) {
                totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
            }
            checkBudgetLimit(total);
        }
    }, (error) => {
        console.error("Firestore Listen Error:", error);
    });
}

// Budget limit alerts with visual updates
function checkBudgetLimit(total) {
    if (!budgetCard || !budgetStatus) return;
    const budgetValue = parseFloat(currentBudget) || 0;
    const totalValue = parseFloat(total) || 0;

    if (budgetValue > 0 && totalValue > budgetValue) {
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
        budgetCard.classList.remove('budget-over');
        totalAmountDisplay.classList.remove('text-danger');
        if (budgetValue > 0) {
            budgetStatus.innerHTML = `<div style="margin-top: 10px;"><span style="color: #10b981; font-size: 11px; font-weight: 600;"><i class="fas fa-check-circle"></i> Spending is within safe limit.</span></div>`;
        } else {
            budgetStatus.innerText = "";
        }
    }
}

// Add transaction
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

// Global delete
window.deleteExpense = async (id) => {
    if (confirm("Delete this transaction?")) {
        try {
            await deleteDoc(doc(db, "expenses", id));
        } catch (error) {
            console.error("Delete Error:", error);
        }
    }
};

// Logout
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        if (confirm("Logout?")) {
            await signOut(auth);
            window.location.href = "login.html";
        }
    };
}