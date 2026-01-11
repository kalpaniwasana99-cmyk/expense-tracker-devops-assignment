import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// HTML මූලද්‍රව්‍ය ලබා ගැනීම
const logoutBtn = document.getElementById('logout-btn');
const transactionForm = document.getElementById('transaction-form');
const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');
const saveBtn = document.getElementById('save-to-history-btn');

// ඔබගේ Ngrok URL එක
const API_URL = "https://nonfeasibly-nonfavorable-dakota.ngrok-free.dev";

// --- 1. පරිශීලකයා ලොග් වී ඇත්දැයි පරීක්ෂා කිරීම ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Welcome:", user.email);
        loadOldExpenses(); 
    } else {
        window.location.href = "login.html";
    }
});

// --- 2. නව වියදමක් Backend එකට යැවීම ---
async function sendToBackend(text, amount) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        await fetch(`${API_URL}/add-expense`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({
                text: text,
                amount: amount,
                uid: user.uid,
                email: user.email
            })
        });
        console.log("Saved to database!");
        loadOldExpenses(); // දත්ත යැවූ පසු ලැයිස්තුව නැවත ලෝඩ් කරන්න
    } catch (error) {
        console.log("Error sending data:", error);
    }
}

// --- 3. දත්ත ලබා ගැනීම, Total එක බැලීම සහ Delete බොත්තම පෙන්වීම ---
async function loadOldExpenses() {
    try {
        const response = await fetch(`${API_URL}/get-expenses`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        const data = await response.json(); 
        console.log("Data received:", data);

        list.innerHTML = "";
        let total = 0;

        data.forEach(item => {
            // මුළු මුදල ගණනය කිරීම
            total += parseFloat(item.price);

            const row = document.createElement('li');
            row.style = "display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px; margin-bottom: 8px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); list-style: none; border-right: 5px solid #673ab7;";
            
            // Delete බොත්තම සමඟ පේළිය සෑදීම
            row.innerHTML = `
                <div>
                    <strong>${item.itemName}</strong> <br>
                    <span style="color: #666; font-size: 0.9rem;">Rs. ${item.price}</span>
                </div>
                <button onclick="deleteExpense('${item.id}')" 
                    style="background: #ff4d4d; color: white; border: none; padding: 5px 12px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    Delete
                </button>
            `;
            list.appendChild(row);
        });

        // Dashboard එකේ Total Expense එක පෙන්වීම
        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }

    } catch (error) {
        console.log("Error getting data:", error);
    }
}

// --- 4. දත්ත මකා දැමීමේ Function එක ---
window.deleteExpense = async (id) => {
    if (!confirm("මෙම වියදම මකා දැමීමට ඔබට විශ්වාසද?")) return;

    try {
        await fetch(`${API_URL}/delete-expense/${id}`, {
            method: 'DELETE',
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        loadOldExpenses(); // ලැයිස්තුව යාවත්කාලීන කිරීම
    } catch (error) {
        console.log("Error deleting:", error);
    }
};

// --- 5. Save to History බොත්තම සඳහා ක්‍රියාව ---
if (saveBtn) {
    saveBtn.onclick = () => {
        alert("ඔබේ දත්ත සාර්ථකව History පටිගත කිරීමට සූදානම් කර ඇත!");
        // මෙහිදී දත්ත history collection එකකට සේව් කිරීමේ අමතර logic එකක් එක් කළ හැක.
    };
}

// --- 6. ගනුදෙනුව ඇතුළත් කිරීමේ Event Listener ---
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

// --- 7. Logout වීම ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        });
    });
}