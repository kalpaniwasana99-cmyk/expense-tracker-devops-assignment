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
                
                // --- ශක්තිමත් කළ කොටස: !important වැනි බලපෑමක් ඇති කරයි ---
                li.setAttribute('style', 'display: flex !important; justify-content: space-between !important; align-items: center !important; background: transparent !important; background-color: transparent !important; padding: 12px 0 !important; margin-bottom: 0 !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; box-shadow: none !important;');
                
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

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    deleteExpense(id);
                };
            });

        } else {
            list.innerHTML = "<p style='text-align:center; color:#94a3b8; font-size:13px;'>No transactions yet.</p>";
        }

        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }
    } catch (error) { 
        console.error("Load Error:", error);
    }
}

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
    transactionForm.onsubmit = async (e) => {
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
    };
}

if (logoutBtn) {
    logoutBtn.onclick = () => {
        signOut(auth).then(() => { window.location.href = "login.html"; });
    };
}