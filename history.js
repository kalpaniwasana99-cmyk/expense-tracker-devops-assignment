import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById('history-container');

// check the user is login
onAuthStateChanged(auth, (user) => {
    if (user) { 
        listenToFullHistory(user.uid); 
    } else { 
        window.location.href = "login.html"; 
    }
});

// getting full data set
function listenToFullHistory(uid) {
    const q = query(collection(db, "expenses"), where("uid", "==", uid), orderBy("timestamp", "desc"));
    
    onSnapshot(q, (snapshot) => {
        container.innerHTML = ""; // clear the old data

        if (snapshot.empty) {
            container.innerHTML = "<p style='text-align:center; color:#94a3b8; margin-top:50px;'>No history found.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const card = document.createElement('div');
            
            
            card.setAttribute('style', 'display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1);');
            
            card.innerHTML = `
                <div style="flex: 1;">
                    <span style="font-weight: 600; color: #ffffff; display: block; font-size: 15px;">${item.itemName}</span>
                    <small style="color: #94a3b8; font-size: 11px;">
                        <i class="far fa-calendar-alt"></i> ${item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'Recent'}
                    </small>
                </div>
                <div style="text-align: right; display: flex; align-items: center; gap: 15px;">
                    <span style="font-weight: 800; color: #818cf8;">LKR ${parseFloat(item.price).toLocaleString()}</span>
                    <button class="delete-btn" onclick="deleteHistoryItem('${docSnap.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

// data deletion function
window.deleteHistoryItem = async (id) => { 
    if (confirm("Delete this record permanently?")) {
        try {
            await deleteDoc(doc(db, "expenses", id)); 
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete record.");
        }
    }
};