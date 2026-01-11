import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// HTML Elements ලබා ගැනීම
const logoutBtn = document.getElementById('logout-btn');
const transactionForm = document.getElementById('transaction-form');
const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');

// ඔබගේ Ngrok URL එක
const API_URL = "https://nonfeasibly-nonfavorable-dakota.ngrok-free.dev";

// --- 1. User Login පරීක්ෂාව ---
onAuthStateChanged(auth, (user) => {
    if (user) {

// Get HTML elements
const logoutBtn = document.getElementById('logout-btn');
const transactionForm = document.getElementById('transaction-form');
const list = document.getElementById('list');

// --- 1. Check if user is logged in ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Welcome:", user.email);
 main
        loadOldExpenses(); 
    } else {
        window.location.href = "login.html";
    }
});

 develop
// --- 2. දත්ත ලබාගෙන ලැයිස්තුගත කිරීම (මෙය තමයි වැදගත්ම කොටස) ---
async function loadOldExpenses() {
    try {
        const response = await fetch(`${API_URL}/get-expenses`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        const data = await response.json(); 
        list.innerHTML = ""; // කලින් තිබූ ලැයිස්තුව හිස් කිරීම
        let total = 0;

        if (data && data.length > 0) {
            data.forEach(item => {
                total += parseFloat(item.price);
                const row = document.createElement('li');
                
                // ලැයිස්තුවේ පෙනුම සකස් කිරීම
                row.style = "display: flex; justify-content: space-between; padding: 10px; background: #fff; margin-bottom: 8px; border-radius: 8px; border-right: 5px solid #673ab7; box-shadow: 0 2px 4px rgba(0,0,0,0.1); list-style: none;";
                
                row.innerHTML = `
                    <div>
                        <strong>${item.itemName}</strong> <br>
                        <small style="color: #666;">Rs. ${item.price}</small>
                    </div>
                    <button onclick="deleteExpense('${item.id}')" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Delete</button>
                `;
                list.appendChild(row);
            });
        } else {
            list.innerHTML = "<p style='text-align:center; color:#999;'>No expenses added yet.</p>";
        }

        // Total එක අප්ඩේට් කිරීම
        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }
    } catch (error) {
        console.log("Error loading list:", error);
    }
}

// --- 3. නව දත්ත ඇතුළත් කිරීම ---
if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = document.getElementById('text').value;
        const amount = document.getElementById('amount').value;
        const user = auth.currentUser;

        if (text && amount && user) {
            try {
                await fetch(`${API_URL}/add-expense`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                    body: JSON.stringify({ text, amount, uid: user.uid, email: user.email })
                });
                
                // Form එක Clear කර ලැයිස්තුව අලුත් කිරීම
                document.getElementById('text').value = '';
                document.getElementById('amount').value = '';
                loadOldExpenses(); 
            } catch (error) {
                console.log("Error adding expense:", error);
            }
        }
    });
}

// --- 4. දත්ත මකා දැමීම ---
window.deleteExpense = async (id) => {
    if (!confirm("Delete this?")) return;
    try {
        await fetch(`${API_URL}/delete-expense/${id}`, { 
            method: 'DELETE',
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        loadOldExpenses();
    } catch (error) {
        console.log("Error deleting:", error);
    }
};

// --- 5. Logout ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => window.location.href = "login.html");
    });

// --- 2. Send new expense to Backend ---
async function sendToBackend(text, amount) {
    const user = auth.currentUser;
    if (!user) return;

    // YOUR NGROK URL
    const backendUrl = "https://nonfeasibly-nonfavorable-dakota.ngrok-free.dev/add-expense";

    const expenseData = {
        text: text,
        amount: amount,
        uid: user.uid,
        email: user.email
    };

    try {
        await fetch(backendUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' // This stops the Ngrok warning page
            },
            body: JSON.stringify(expenseData)
        });
        console.log("Saved to database!");
        loadOldExpenses(); 
    } catch (error) {
        console.log("Error sending data:", error);
    }
}

// --- 3. Get old expenses and show on Page ---
async function loadOldExpenses() {
    const backendUrl = "https://nonfeasibly-nonfavorable-dakota.ngrok-free.dev/get-expenses";

    try {
        const response = await fetch(backendUrl, {
            headers: {
                'ngrok-skip-browser-warning': 'true' // This stops the Ngrok warning page
            }
        });
        
        const data = await response.json(); 
        console.log("Data received:", data);

        list.innerHTML = "";

        data.forEach(item => {
            const row = document.createElement('li');
            row.innerHTML = `
                ${item.itemName} <span>Rs. ${item.price}</span>
            `;
            list.appendChild(row);
        });

    } catch (error) {
        console.log("Error getting data:", error);
    }
}

// --- 4. Add Transaction ---
if (transactionForm) {
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textInput = document.getElementById('text').value;
        const amountInput = document.getElementById('amount').value;

        if (textInput && amountInput) {
            sendToBackend(textInput, amountInput);
            document.getElementById('text').value = '';
            document.getElementById('amount').value = '';
        }
    });
}

// --- 5. Logout ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        });
    });
}

// --- Goals දත්ත Backend එකෙන් ලබා ගැනීම ---
async function loadGoals() {
    const user = auth.currentUser;
    if (!user) return;

    const goalsListDiv = document.getElementById('goals-list');
    if (!goalsListDiv) return; // Goals පේජ් එකේ නොවේ නම් නවතින්න

    const backendUrl = `https://nonfeasibly-nonfavorable-dakota.ngrok-free.dev/get-goals/${user.uid}`;

    try {
        const response = await fetch(backendUrl, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const result = await response.json();
        
        goalsListDiv.innerHTML = '';

        if (result.status === "success") {
            result.data.forEach(goal => {
                const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                const card = document.createElement('div');
                card.className = 'goal-card';
                card.innerHTML = `
                    <div class="goal-details">
                        <div class="goal-name">${goal.goalName}</div>
                        <div class="amount-info">Rs. ${goal.savedAmount} saved of Rs. ${goal.targetAmount}</div>
                    </div>
                    <div class="progress-box">
                        <div class="percentage">${progress.toFixed(0)}%</div>
                        <div class="outer-bar"><div class="inner-bar" style="width: ${progress}%"></div></div>
                    </div>
                `;
                goalsListDiv.appendChild(card);
            });
        }
    } catch (error) {
        console.log("Goals Error:", error);
    }

}