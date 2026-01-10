const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware - Frontend connect to Server 
app.use(cors());
app.use(bodyParser.json());

// server Testing Route
app.get('/', (req, res) => {
    res.send("Expense Tracker Backend is Running!");
});

app.post('/login-notify', (req, res) => {
    const userData = req.body;
    
    console.log("=====================================");
    console.log("New User Login Detected!");
    console.log("Email:", userData.email);
    console.log("UID:", userData.uid);
    console.log("Time:", userData.loginTime);
    console.log("=====================================");

    // success masg send to Frontend 
    res.json({ 
        status: "success", 
        message: "Backend recorded login for " + userData.email 
    });
});

// server start
app.listen(PORT, () => {
    console.log(`Server is flying on http://localhost:${PORT}`);
});