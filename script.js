import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const logoutBtn = document.getElementById('logout-btn');
const transactionForm = document.getElementById('transaction-form');
const list = document.getElementById('list');
const totalAmountDisplay = document.getElementById('total-amount');

// පරිශීලකයා ලොග් වී ඇත්දැයි පරීක්ෂා කිරීම
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userName = user.displayName || user.email.split('@')[0];
        document.getElementById('user-display-name').innerText = `Hi, ${userName}!`;
        listenToExpenses(user.uid); // රියල් ටයිම් දත්ත ලබා ගැනීම ආරම්භ කිරීම
    } else {
        window.location.href = "login.html";
    }
});

// දත්ත පෙන්වීම සහ වෙනස්වීම් හඳුනාගැනීම (Real-time Listening)
function listenToExpenses(uid) {
    // පරිශීලකයාට අදාළ දත්ත පමණක් කාලය අනුව පෙළගස්වා ලබා ගැනීම
    const q = query(
        collection(db, "expenses"), 
        where("uid", "==", uid), 
        orderBy("timestamp", "desc")
    );

    // onSnapshot භාවිතා කිරීමෙන් දත්ත ඇතුළත් කළ සැණින් (Offline වුවත්) UI එක Update වේ
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
                
                // Dark Theme එකට ගැලපෙන සහ අනවශ්‍ය පසුබිම් ඉවත් කළ Style එක
                li.setAttribute('style', 'display: flex !important; justify-content: space-between !important; align-items: center !important; background: transparent !important; padding: 12px 0 !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; margin-bottom: 0 !important; box-shadow: none !important;');
                
                li.innerHTML = `
                    <div style="flex: 1;">
                        <span style="font-weight: 600; color: #ffffff; display: block; font-size: 15px;">${item.itemName}</span>
                        <small style="color: #94a3b8; font-size: 12px;">LKR ${parseFloat(item.price).toLocaleString()}</small>
                    </div>
                    <button class="delete-btn" onclick="deleteExpense('${id}')" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; padding: 8px 12px; border-radius: 10px; cursor: pointer; transition: 0.3s;">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                list.appendChild(li);
            });
        }

        // මුළු මුදල යාවත්කාලීන කිරීම
        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = `Rs. ${total.toLocaleString()}`;
        }
    }, (error) => {
        console.error("Firestore Listen Error:", error);
    });
}

// වියදමක් එක් කිරීම (Offline වුවද ක්ෂණිකව වැඩ කරයි)
if (transactionForm) {
    transactionForm.onsubmit = async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('text');
        const amountInput = document.getElementById('amount');
        const user = auth.currentUser;

        if (textInput.value && amountInput.value && user) {
            try {
                // Firebase Firestore වෙත දත්ත එක් කිරීම
                await addDoc(collection(db, "expenses"), {
                    itemName: textInput.value,
                    price: parseFloat(amountInput.value),
                    uid: user.uid,
                    timestamp: new Date()
                });
                
                // Input fields හිස් කිරීම
                textInput.value = '';
                amountInput.value = '';
            } catch (error) {
                console.error("Add Error:", error);
                alert("Error adding transaction. Please try again.");
            }
        }
    };
}

// මකා දැමීම (Global function එකක් ලෙස)
window.deleteExpense = async function(id) {
    if (!confirm("Delete this transaction?")) return;
    try {
        await deleteDoc(doc(db, "expenses", id));
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Could not delete. Check your connection.");
    }
}

// Logout කිරීම
if (logoutBtn) {
    logoutBtn.onclick = () => {
        if (confirm("Are you sure you want to logout?")) {
            signOut(auth).then(() => { 
                window.location.href = "login.html"; 
            }).catch((error) => {
                console.error("Logout Error:", error);
            });
        }
    };
}