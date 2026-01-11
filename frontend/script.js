import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Get HTML elements
const logoutBtn = document.getElementById('logout-btn');
const transactionForm = document.getElementById('transaction-form');
const list = document.getElementById('list');

// --- 1. Check if user is logged in ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Welcome:", user.email);
        loadOldExpenses(); 
    } else {
        window.location.href = "login.html";
    }
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