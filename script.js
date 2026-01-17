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

// Check user authentication status
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userName = user.displayName || user.email.split('@')[0];
        document.getElementById('user-display-name').innerText = `Hi, ${userName}!`;
        
        // Load the saved budget and then start listening to expenses
        loadBudget(user.uid);
        listenToExpenses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

// Load the monthly budget limit from Firestore
async function loadBudget(uid) {
    const budgetDoc = await getDoc(doc(db, "budgets", uid));
    if (budgetDoc.exists()) {
        currentBudget = budgetDoc.data().limit;
        budgetInput.value = currentBudget;
    }
}

// Save the monthly budget limit to Firestore
if (saveBudgetBtn) {
    saveBudgetBtn.onclick = async () => {
        const user = auth.currentUser;
        const limit = parseFloat(budgetInput.value);
        if (user && !isNaN(limit)) {
            try {
                await setDoc(doc(db, "budgets", user.uid), { limit: limit });
                currentBudget = limit;
                alert("Budget limit saved successfully!");
                // Re-trigger UI update if listener is active
                location.reload(); 
            } catch (error) {
                console.error("Budget Save Error:", error);
            }
        }
    };
}

// Listen for real-time updates of expenses
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
                li.setAttribute('style', 'display: flex !important; justify-content: space-between !important; align-items: center !important; background: transparent !important; padding: 12px 0 !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; margin-bottom: 0 !important; box-shadow: none !important;');
                
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

        // Update Total Amount UI
        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }

        // Check against the monthly budget limit
        checkBudgetLimit(total);

    }, (error) => {
        console.error("Firestore Listen Error:", error);
    });
}

// Monitor spending against the budget and update UI colors
function checkBudgetLimit(total) {
    if (currentBudget > 0 && total > currentBudget) {
        // Warning: Budget Exceeded
        budgetCard.classList.add('budget-over');
        totalAmountDisplay.classList.add('text-danger');
        budgetStatus.innerText = "⚠️ Budget Exceeded!";
        budgetStatus.style.color = "#ef4444";
    } else {
        // Budget OK
        budgetCard.classList.remove('budget-over');
        totalAmountDisplay.classList.remove('text-danger');
        budgetStatus.innerText = currentBudget > 0 ? "Budget is within safe limits." : "";
        budgetStatus.style.color = "#10b981";
    }
}

// Add a new expense record to Firestore
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
                alert("Error adding transaction.");
            }
        }
    };
}

// Delete an expense record
window.deleteExpense = async function(id) {
    if (!confirm("Delete this transaction?")) return;
    try {
        await deleteDoc(doc(db, "expenses", id));
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.onclick = () => {
        if (confirm("Are you sure you want to logout?")) {
            signOut(auth).then(() => { 
                window.location.href = "login.html"; 
            }).catch((error) => console.error("Logout Error:", error));
        }
    };
}