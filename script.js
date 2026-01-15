import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const logoutBtn = document.getElementById('logout-btn');
const transactionForm = document.getElementById('transaction-form');
const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');

const API_URL = "https://nonfeasibly-nonfavorable-dakota.ngrok-free.dev";

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userDisplay = document.getElementById('user-display-name');
        if (userDisplay) {
            userDisplay.innerText = `Hi, ${user.displayName || user.email.split('@')[0]}!`;
        }
        loadOldExpenses(); 
    } else {
        window.location.href = "login.html";
    }
});

async function loadOldExpenses() {
    try {
        console.log("Fetching data...");
        const response = await fetch(`${API_URL}/get-expenses`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await response.json(); 
        
        if (!list) return;
        list.innerHTML = ""; 
        let total = 0;

        if (data && data.length > 0) {
            data.forEach(item => {
                total += parseFloat(item.price);
                const li = document.createElement('li');
                li.style = "display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px; border-radius: 15px; margin-bottom: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border-left: 5px solid #6366f1;";
                
                li.innerHTML = `
                    <div style="flex: 1;">
                        <span style="font-weight: 600; color: #1e293b; display: block; font-size: 15px;">${item.itemName}</span>
                        <small style="color: #64748b; font-size: 12px;">LKR ${parseFloat(item.price).toLocaleString()}</small>
                    </div>
                    <button class="delete-btn" data-id="${item.id}" style="background: #fee2e2; color: #ef4444; border: none; padding: 8px 12px; border-radius: 10px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                list.appendChild(li);
            });

            // Delete බොත්තම් වලට Event Listeners එකතු කිරීම
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    deleteExpense(id);
                });
            });

        } else {
            list.innerHTML = "<p style='text-align:center; color:#94a3b8; font-size:13px;'>No transactions yet.</p>";
        }

        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }
    } catch (error) { 
        console.error("Load Error:", error);
        list.innerHTML = "<p style='text-align:center; color:red; font-size:12px;'>Error connecting to Server.</p>";
    }
}

// Delete Function එක Global Scope එකෙන් ඉවත් කර ආරක්ෂිතව සැකසීම
async function deleteExpense(id) {
    if (!confirm("Delete this transaction?")) return;
    try {
        await fetch(`${API_URL}/delete-expense/${id}`, { 
            method: 'DELETE',
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        loadOldExpenses();
    } catch (error) { console.log("Delete Error:", error); }
}

if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('text');
        const amountInput = document.getElementById('amount');
        const user = auth.currentUser;

        if (textInput.value && amountInput.value && user) {
            try {
                await fetch(`${API_URL}/add-expense`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                    body: JSON.stringify({ 
                        text: textInput.value, 
                        amount: amountInput.value, 
                        uid: user.uid, 
                        email: user.email 
                    })
                });
                textInput.value = '';
                amountInput.value = '';
                loadOldExpenses(); 
            } catch (error) { console.log("Add Error:", error); }
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => { window.location.href = "login.html"; });
    });
}