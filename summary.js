import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let chartInstance = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
        onSnapshot(q, (snapshot) => {
            const dynamicData = {};
            snapshot.forEach(doc => {
                const item = doc.data();
                const name = item.itemName.charAt(0).toUpperCase() + item.itemName.slice(1).toLowerCase();
                dynamicData[name] = (dynamicData[name] || 0) + (parseFloat(item.price) || 0);
            });
            renderChart(dynamicData);
        });
    } else { window.location.href = "login.html"; }
});

function renderChart(data) {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: Object.keys(data).map((_, i) => `hsl(${i * (360/Object.keys(data).length)}, 70%, 60%)`),
                borderWidth: 0
            }]
        },
        options: {
            cutout: '75%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } } }
        }
    });
}