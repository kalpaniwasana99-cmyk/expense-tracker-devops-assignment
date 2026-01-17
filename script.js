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

// Listen for Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-display-name').innerText = `Hi, ${user.displayName || user.email.split('@')[0]}!`;
        loadBudget(user.uid);
        listenToExpenses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

// Load saved budget limit from Firestore
async function loadBudget(uid) {
    const budgetDoc = await getDoc(doc(db, "budgets", uid));
    if (budgetDoc.exists()) {
        currentBudget = parseFloat(budgetDoc.data().limit);
        budgetInput.value = currentBudget;
    }
}

// Save budget limit to Firestore
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

// Listen to expenses and update UI in real-time
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

        // Update Total Display UI
        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }
        
        // Ensure budget check happens with latest total
        checkBudgetLimit(total);
    });
}

// Add new expense to Firestore
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
                console.error("Error adding expense:", error);
            }
        }
    };
}

// Logic to show alert if budget is exceeded
function checkBudgetLimit(total) {
    if (currentBudget > 0 && total > currentBudget) {
        // Warning: Budget Exceeded
        budgetCard.classList.add('budget-over');
        totalAmountDisplay.classList.add('text-danger');
        budgetStatus.innerText = "⚠️ Alert: Monthly Budget Exceeded!";
        budgetStatus.style.color = "#ef4444";
    } else {
        // Budget is within safe limits
        budgetCard.classList.remove('budget-over');
        totalAmountDisplay.classList.remove('text-danger');
        budgetStatus.innerText = currentBudget > 0 ? "Spending is within limit." : "";
        budgetStatus.style.color = "#10b981";
    }
}

// Global delete function
window.deleteExpense = async (id) => {
    if (confirm("Delete this record permanently?")) {
        await deleteDoc(doc(db, "expenses", id));
    }
};

// Logout function
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        if (confirm("Logout?")) {
            await signOut(auth);
            window.location.href = "login.html";
        }
    };
}import { auth, db } from "./firebase-config.js";
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

// Listen for Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-display-name').innerText = `Hi, ${user.displayName || user.email.split('@')[0]}!`;
        loadBudget(user.uid);
        listenToExpenses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

// Load saved budget limit from Firestore
async function loadBudget(uid) {
    const budgetDoc = await getDoc(doc(db, "budgets", uid));
    if (budgetDoc.exists()) {
        currentBudget = parseFloat(budgetDoc.data().limit);
        budgetInput.value = currentBudget;
    }
}

// Save budget limit to Firestore
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

// Listen to expenses and update UI in real-time
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

        // Update Total Display UI
        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }
        
        // Ensure budget check happens with latest total
        checkBudgetLimit(total);
    });
}

// Add new expense to Firestore
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
                console.error("Error adding expense:", error);
            }
        }
    };
}

// Logic to show alert if budget is exceeded
function checkBudgetLimit(total) {
    if (currentBudget > 0 && total > currentBudget) {
        // Warning: Budget Exceeded
        budgetCard.classList.add('budget-over');
        totalAmountDisplay.classList.add('text-danger');
        budgetStatus.innerText = "⚠️ Alert: Monthly Budget Exceeded!";
        budgetStatus.style.color = "#ef4444";
    } else {
        // Budget is within safe limits
        budgetCard.classList.remove('budget-over');
        totalAmountDisplay.classList.remove('text-danger');
        budgetStatus.innerText = currentBudget > 0 ? "Spending is within limit." : "";
        budgetStatus.style.color = "#10b981";
    }
}

// Global delete function
window.deleteExpense = async (id) => {
    if (confirm("Delete this record permanently?")) {
        await deleteDoc(doc(db, "expenses", id));
    }
};

// Logout function
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        if (confirm("Logout?")) {
            await signOut(auth);
            window.location.href = "login.html";
        }
    };
}