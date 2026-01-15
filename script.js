import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const logoutBtn = document.getElementById('logout-btn');
const transactionForm = document.getElementById('transaction-form');
const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-display-name').innerText = `Hi, ${user.displayName || user.email.split('@')[0]}!`;
        listenToExpenses(user.uid); // රියල් ටයිම් දත්ත ලබා ගැනීම
    } else {
        window.location.href = "login.html";
    }
});

// දත්ත පෙන්වීම සහ වෙනස්වීම් හඳුනාගැනීම (Real-time Listening)
function listenToExpenses(uid) {
    const q = query(collection(db, "expenses"), where("uid", "==", uid), orderBy("timestamp", "desc"));

    // onSnapshot භාවිතා කිරීමෙන් දත්ත ඇතුළත් කළ සැණින් (Offline වුවත්) UI එක Update වේ
    onSnapshot(q, (snapshot) => {
        list.innerHTML = "";
        let total = 0;

        snapshot.forEach((doc) => {
            const item = doc.data();
            total += parseFloat(item.price);
            
            const li = document.createElement('li');
            li.setAttribute('style', 'display: flex !important; justify-content: space-between !important; align-items: center !important; background: transparent !important; padding: 12px 0 !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important;');
            
            li.innerHTML = `
                <div style="flex: 1;">
                    <span style="font-weight: 600; color: #ffffff; display: block;">${item.itemName}</span>
                    <small style="color: #94a3b8;">LKR ${parseFloat(item.price).toLocaleString()}</small>
                </div>
                <button class="delete-btn" onclick="deleteExpense('${doc.id}')" style="background: #fee2e2; color: #ef4444; border: none; padding: 8px 12px; border-radius: 10px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            list.appendChild(li);
        });

        totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
    }, (error) => {
        console.error("Firestore Listen Error:", error);
    });
}

// වියදමක් එක් කිරීම (Offline වුවද ක්ෂණිකව වැඩ කරයි)
if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
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
            }
        }
    });
}

// මකා දැමීම
window.deleteExpense = async function(id) {
    if (!confirm("Delete this transaction?")) return;
    try {
        await deleteDoc(doc(db, "expenses", id));
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => { window.location.href = "login.html"; });
    });
}