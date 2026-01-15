const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(bodyParser.json());

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// 1. දත්ත ලබා ගැනීම
app.get('/get-expenses', async (req, res) => {
    try {
        const snapshot = await db.collection('expenses').orderBy('timestamp', 'desc').get();
        const expenses = [];
        snapshot.forEach(doc => expenses.push({ id: doc.id, ...doc.data() }));
        res.status(200).json(expenses);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. දත්ත ඇතුළත් කිරීම
app.post('/add-expense', async (req, res) => {
    try {
        const { text, amount, uid, email } = req.body;
        await db.collection('expenses').add({
            itemName: text,
            price: parseFloat(amount),
            userId: uid,
            userEmail: email,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).json({ status: "success" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. දත්ත මකා දැමීම
app.delete('/delete-expense/:id', async (req, res) => {
    try {
        await db.collection('expenses').doc(req.params.id).delete();
        res.json({ status: "success" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});