import { auth, db } from "./firebase-config.js";
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

// Auth Logic - Redirect Loop එක වැළැක්වීමට
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (document.getElementById('user-display-name')) {
            document.getElementById('user-display-name').innerText = `Hi, ${user.displayName || user.email.split('@')[0]}!`;
        }
        loadBudget(user.uid);
        listenToExpenses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

async function loadBudget(uid) {
    try {
        const budgetDoc = await getDoc(doc(db, "budgets", uid));
        if (budgetDoc.exists()) {
            currentBudget = parseFloat(budgetDoc.data().limit);
            if (budgetInput) budgetInput.value = currentBudget;
        }
    } catch (error) { console.error("Budget Error:", error); }
}

if (saveBudgetBtn) {
    saveBudgetBtn.onclick = async () => {
        const user = auth.currentUser;
        const limitVal = parseFloat(budgetInput.value);
        if (user && !isNaN(limitVal)) {
            await setDoc(doc(db, "budgets", user.uid), { limit: limitVal });
            currentBudget = limitVal;
            alert("Budget Saved!");
        }
    };
}

function listenToExpenses(uid) {
    const q = query(collection(db, "expenses"), where("uid", "==", uid), orderBy("timestamp", "desc"), limit(10));
    onSnapshot(q, (snapshot) => {
        if (!list) return;
        list.innerHTML = "";
        let total = 0;
        snapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const price = parseFloat(item.price || 0);
            total += price;
            const li = document.createElement('li');
            li.setAttribute('style', 'display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-bottom: 1px solid rgba(0,0,0,0.05); color: #1e293b !important;');
            li.innerHTML = `<div><span style="font-weight:600; color:#1e293b; display:block;">${item.itemName}</span><small style="color:#64748b;">LKR ${price.toLocaleString()}</small></div>
            <button class="delete-btn" onclick="deleteExpense('${docSnap.id}')"><i class="fas fa-trash"></i></button>`;
            list.appendChild(li);
        });
        if (totalAmountDisplay) totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        checkBudgetLimit(total);
    });
}

function checkBudgetLimit(total) {
    if (!budgetCard || !budgetStatus) return;
    if (currentBudget > 0 && total > currentBudget) {
        budgetCard.classList.add('budget-over');
        budgetStatus.innerHTML = `<span style="color:#ef4444; font-size:12px; font-weight:800;">Budget Exceeded!</span>`;
    } else {
        budgetCard.classList.remove('budget-over');
        budgetStatus.innerHTML = currentBudget > 0 ? `<span style="color:#10b981; font-size:11px;">Within limit</span>` : "";
    }
}

if (transactionForm) {
    transactionForm.onsubmit = async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('text');
        const amountInput = document.getElementById('amount');
        if (textInput.value && amountInput.value && auth.currentUser) {
            await addDoc(collection(db, "expenses"), { itemName: textInput.value, price: parseFloat(amountInput.value), uid: auth.currentUser.uid, timestamp: serverTimestamp() });
            textInput.value = ''; amountInput.value = '';
        }
    };
}

window.deleteExpense = async (id) => { if (confirm("Delete?")) await deleteDoc(doc(db, "expenses", id)); };

if (logoutBtn) {
    logoutBtn.onclick = async () => { if (confirm("Logout?")) { await signOut(auth); window.location.href = "login.html"; } };
}