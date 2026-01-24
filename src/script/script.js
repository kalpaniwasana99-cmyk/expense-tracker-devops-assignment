import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc, setDoc, getDoc, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');
const budgetInput = document.getElementById('monthly-budget');
const saveBudgetBtn = document.getElementById('save-budget-btn');
const budgetCard = document.getElementById('budget-card');
const budgetStatus = document.getElementById('budget-status');
const transactionForm = document.getElementById('transaction-form');
const logoutBtn = document.getElementById('logout-btn');

let currentBudget = 0;

// Listen for Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-display-name').innerText = `Hi, ${user.displayName || user.email.split('@')[0]}!`;
        
        // Priority loading
        loadBudget(user.uid);
        listenToExpenses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

// Load budget
async function loadBudget(uid) {
    try {
        const budgetDoc = await getDoc(doc(db, "budgets", uid));
        if (budgetDoc.exists()) {
            currentBudget = parseFloat(budgetDoc.data().limit);
            budgetInput.value = currentBudget;
        }
    } catch (error) {
        console.error("Budget load error:", error);
    }
}

// Save budget
if (saveBudgetBtn) {
    saveBudgetBtn.onclick = async () => {
        const user = auth.currentUser;
        const limitVal = parseFloat(budgetInput.value);
        if (user && !isNaN(limitVal)) {
            await setDoc(doc(db, "budgets", user.uid), { limit: limitVal });
            currentBudget = limitVal;
            alert("Monthly budget limit saved!");
            // Refresh budget check
            const totalText = totalAmountDisplay.innerText.replace(/[^\d.-]/g, '');
            checkBudgetLimit(parseFloat(totalText) || 0);
        }
    };
}

// Fixed Speed Optimized Listener
function listenToExpenses(uid) {
    const q = query(
        collection(db, "expenses"), 
        where("uid", "==", uid), 
        orderBy("timestamp", "desc"),
        limit(10)
    );

    // Using snapshot metadata to detect local vs server changes
    onSnapshot(q, (snapshot) => {
        if (!list) return;
        
        list.innerHTML = ""; // Clear list immediately

        if (snapshot.empty) {
            list.innerHTML = "<p style='text-align:center; color:#94a3b8; font-size:13px;'>No transactions yet.</p>";
            if (totalAmountDisplay) totalAmountDisplay.innerText = "Rs. 0.00";
            checkBudgetLimit(0);
            return;
        }

        let total = 0;
        snapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const price = parseFloat(item.price || 0);
            total += price;

            const li = document.createElement('li');
            li.setAttribute('style', 'display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-bottom: 1px solid rgba(0,0,0,0.05);');
            
            // Format date correctly
            const displayDate = item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'Pending...';

            li.innerHTML = `
                <div>
                    <span style="font-weight: 600; color: #1e293b; display: block; font-size: 15px;">${item.itemName}</span>
                    <small style="color: #64748b;">${displayDate} | LKR ${price.toLocaleString()}</small>
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
    }, (error) => {
        console.error("Firestore Listener Error:", error);
    });
}

// Budget check logic
function checkBudgetLimit(total) {
    if (!budgetCard || !budgetStatus) return;
    const budgetVal = parseFloat(currentBudget) || 0;
    const totalVal = parseFloat(total) || 0;

    if (budgetVal > 0 && totalVal > budgetVal) {
        budgetCard.classList.add('budget-over');
        totalAmountDisplay.classList.add('text-danger');
        budgetStatus.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 8px; border-left: 4px solid #ef4444; margin-top: 10px;">
                <span style="color: #ef4444; font-size: 12px; font-weight: 800;">
                    <i class="fas fa-exclamation-triangle"></i> ALERT: Monthly Budget Exceeded!
                </span>
            </div>`;
    } else {
        budgetCard.classList.remove('budget-over');
        totalAmountDisplay.classList.remove('text-danger');
        budgetStatus.innerHTML = budgetVal > 0 ? 
            `<div style="margin-top: 10px;"><span style="color: #10b981; font-size: 11px; font-weight: 600;"><i class="fas fa-check-circle"></i> Within safe limit</span></div>` : "";
    }
}

// Add transaction with ServerTimestamp
if (transactionForm) {
    transactionForm.onsubmit = async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('text');
        const amountInput = document.getElementById('amount');
        if (textInput.value && amountInput.value && auth.currentUser) {
            try {
                await addDoc(collection(db, "expenses"), {
                    itemName: textInput.value,
                    price: parseFloat(amountInput.value),
                    uid: auth.currentUser.uid,
                    timestamp: serverTimestamp() // Use server time for accurate ordering
                });
                textInput.value = '';
                amountInput.value = '';
            } catch (error) { console.error("Add error:", error); }
        }
    };
}

// Global Delete
window.deleteExpense = async (id) => {
    if (confirm("Delete this?")) await deleteDoc(doc(db, "expenses", id));
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