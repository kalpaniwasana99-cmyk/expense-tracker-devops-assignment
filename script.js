import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const logoutBtn = document.getElementById('logout-btn');
const transactionForm = document.getElementById('transaction-form');
const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');
const budgetInput = document.getElementById('monthly-budget');
const saveBudgetBtn = document.getElementById('save-budget-btn');
const budgetCard = document.getElementById('budget-card');
const budgetStatus = document.getElementById('budget-status');

let currentBudget = 0;

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userName = user.displayName || user.email.split('@')[0];
        document.getElementById('user-display-name').innerText = `Hi, ${userName}!`;
        
        // Initial setup: Load budget settings and start listening to expense data
        loadBudget(user.uid);
        listenToExpenses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

// Retrieve the saved monthly budget from Firestore
async function loadBudget(uid) {
    try {
        const budgetDoc = await getDoc(doc(db, "budgets", uid));
        if (budgetDoc.exists()) {
            currentBudget = budgetDoc.data().limit;
            budgetInput.value = currentBudget;
        }
    } catch (error) {
        console.error("Error loading budget:", error);
    }
}

// Save or update the monthly budget limit
if (saveBudgetBtn) {
    saveBudgetBtn.onclick = async () => {
        const user = auth.currentUser;
        const limit = parseFloat(budgetInput.value);
        if (user && !isNaN(limit)) {
            try {
                await setDoc(doc(db, "budgets", user.uid), { limit: limit });
                currentBudget = limit;
                alert("Monthly budget limit saved!");
                // Refresh data to apply changes immediately
                location.reload(); 
            } catch (error) {
                console.error("Budget Save Error:", error);
            }
        } else {
            alert("Please enter a valid numeric limit.");
        }
    };
}

// Set up real-time listener for expense records
function listenToExpenses(uid) {
    const q = query(
        collection(db, "expenses"), 
        where("uid", "==", uid), 
        orderBy("timestamp", "desc")
    );

    onSnapshot(q, (snapshot) => {
        if (!list) return;
        list.innerHTML = "";
        let total = 0;

        if (snapshot.empty) {
            list.innerHTML = "<p style='text-align:center; color:#94a3b8; font-size:13px;'>No transactions yet.</p>";
        } else {
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                const id = docSnap.id;
                total += parseFloat(item.price || 0);
                
                const li = document.createElement('li');
                li.setAttribute('style', 'display: flex !important; justify-content: space-between !important; align-items: center !important; background: transparent !important; padding: 12px 0 !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important;');
                
                li.innerHTML = `
                    <div style="flex: 1;">
                        <span style="font-weight: 600; color: #1e293b; display: block; font-size: 15px;">${item.itemName}</span>
                        <small style="color: #64748b; font-size: 12px;">LKR ${parseFloat(item.price).toLocaleString()}</small>
                    </div>
                    <button class="delete-btn" onclick="deleteExpense('${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                list.appendChild(li);
            });
        }

        // Update the total spending display
        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }

        // Evaluate spending against the budget
        checkBudgetLimit(total);

    }, (error) => {
        console.error("Firestore Listener Error:", error);
    });
}

// Function to handle UI updates when budget is exceeded
function checkBudgetLimit(total) {
    if (!budgetCard || !budgetStatus) return;

    if (currentBudget > 0 && total > currentBudget) {
        // Apply warning styles if budget is exceeded
        budgetCard.classList.add('budget-over');
        totalAmountDisplay.classList.add('text-danger');
        budgetStatus.innerText = "⚠️ Alert: Monthly Budget Exceeded!";
        budgetStatus.style.color = "#ef4444";
    } else {
        // Reset to normal styles
        budgetCard.classList.remove('budget-over');
        totalAmountDisplay.classList.remove('text-danger');
        budgetStatus.innerText = currentBudget > 0 ? "Spending is within your limit." : "";
        budgetStatus.style.color = "#10b981";
    }
}

// Handle new transaction form submission
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
                console.error("Error adding transaction:", error);
            }
        }
    };
}

// Global function to delete transactions
window.deleteExpense = async function(id) {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
        await deleteDoc(doc(db, "expenses", id));
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

// User logout functionality
if (logoutBtn) {
    logoutBtn.onclick = () => {
        if (confirm("Logout from Expense Tracker?")) {
            signOut(auth).then(() => { 
                window.location.href = "login.html"; 
            }).catch((error) => console.error("Logout Error:", error));
        }
    };
}