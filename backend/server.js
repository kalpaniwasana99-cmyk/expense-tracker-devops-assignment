const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); 
app.use(bodyParser.json());

// Firebase Admin Setup
// වැදගත්: serviceAccountKey.json ෆයිල් එක මේ ෆෝල්ඩරයේම තිබිය යුතුයි
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 1. සර්වර් එක පරීක්ෂා කිරීමට (Root route)
app.get('/', (req, res) => {
    res.send("Expense Tracker Backend is Running with Firebase!");
});

// 2. Dashboard එකේ දත්ත ලබා ගැනීම (GET Expenses)
app.get('/get-expenses', async (req, res) => {
    try {
        const snapshot = await db.collection('expenses').orderBy('timestamp', 'desc').get();
        const expenses = [];
        snapshot.forEach(doc => {
            expenses.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. නව Expense එකක් සේව් කිරීම (POST Expense)
app.post('/add-expense', async (req, res) => {
    try {
        const { text, amount, uid, email } = req.body;
        const newExpense = {
            itemName: text,
            price: parseFloat(amount),
            userId: uid,
            userEmail: email,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('expenses').add(newExpense);
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Goals පේජ් එකේ දත්ත ලබා ගැනීම (GET Goals)
// ඔබගේ goals.html එකෙන් ඉල්ලන්නේ මේ route එකයි
app.get('/get-goals/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const snapshot = await db.collection('goals').where('userId', '==', userId).get();
        const goals = [];
        snapshot.forEach(doc => {
            goals.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({ status: "success", data: goals });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 5. නව Goal එකක් සේව් කිරීම (POST Goal)
app.post('/add-goal', async (req, res) => {
    try {
        const { userId, goalName, targetAmount } = req.body;
        const newGoal = {
            userId: userId,
            goalName: goalName,
            targetAmount: parseFloat(targetAmount),
            savedAmount: 0, // ආරම්භයේදී ඉතුරු කළ මුදල 0 කි
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('goals').add(newGoal);
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Server Start
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});