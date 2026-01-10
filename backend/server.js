const express = require('express');
const cors = require('cors'); // 1. මුලින්ම ලයිබ්‍රරි එක ගත්තා
const bodyParser = require('body-parser');

const app = express(); // 2. මෙන්න මෙතනදී තමයි 'app' එක හැදෙන්නේ (Initialization)
const PORT = 3000;

// 3. 'app' එක හැදුවට පස්සේ විතරයි app.use පාවිච්චි කරන්න පුළුවන්
app.use(cors()); 
app.use(bodyParser.json());

// සර්වර් එක වැඩද කියා බැලීමට
app.get('/', (req, res) => {
    res.send("Expense Tracker Backend is Running!");
});

// Frontend එකෙන් එන Login Notification එක බාරගන්නා තැන
app.post('/login-notify', (req, res) => {
    const userData = req.body;
    
    console.log("=====================================");
    console.log("🔔 New User Login Detected!");
    console.log("📧 Email:", userData.email);
    console.log("🆔 UID:", userData.uid);
    console.log("⏰ Time:", userData.loginTime);
    console.log("=====================================");

    res.json({ 
        status: "success", 
        message: "Backend recorded login for " + userData.email 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});