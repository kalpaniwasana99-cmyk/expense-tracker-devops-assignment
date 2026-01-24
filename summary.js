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
            updateChartUI(dynamicData);
        });
    } else { 
        window.location.href = "login.html"; 
    }
});

function updateChartUI(data) {
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    
    let highest = { name: 'None', val: 0 };
    labels.forEach(l => { 
        if(data[l] > highest.val) { 
            highest = { name: l, val: data[l] }; 
        } 
    });
    
    const insightEl = document.getElementById('highest-category');
    if (insightEl) {
        insightEl.innerText = highest.val > 0 
            ? `${highest.name} (LKR ${highest.val.toLocaleString()})` 
            : "No Data Available";
    }

    
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    if (chartInstance) chartInstance.destroy(); 
    
    chartInstance = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: labels.map((_, i) => `hsl(${i * (360/labels.length)}, 70%, 60%)`),
                borderWidth: 0
            }]
        },
        options: {
            plugins: { 
                legend: { 
                    position: 'bottom', 
                    labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' } } 
                } 
            },
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false
        }
    });
}