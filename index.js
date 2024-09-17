const express = require("express");
const { NlpManager } = require("node-nlp");
const path = require("path");
const mysql = require('mysql');
const dotenv=require('dotenv');
const moment = require('moment-timezone');

const app = express();
const port = process.env.PORT || 5000;

// MySQL connection for the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

const manager = new NlpManager({ languages: ["en"] });
manager.load();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/chat", async (req, res) => {
    const { message } = req.body;

    // Check if the message is "Account Action"
    if (message === "Account Action") {
        // Extract device ID from request headers or parameters
        const deviceId = req.headers['deviceid']; // Assuming device ID is sent in headers
        
        if (deviceId) {
            // Check if the device ID is in the registration table
            const query = "SELECT COUNT(*) AS count FROM registration WHERE device_id = ?";
            db.query(query, [deviceId], (err, results) => {
                if (err) {
                    console.error('Error querying database:', err);
                    return res.status(500).json({ reply: "An error occurred. Please try again later." });
                }

                const isRegistered = results[0].count > 0;
                const reply = isRegistered
                    ? "You are already registered. Thank you for using our app."
                    : "You are not registered. Please register using the following link: <a href='https://nithramatrimony.net/register' target='_blank' class='text-red-500 underline'>Register</a>";

                res.json({ reply });
            });
        } else {
            res.status(400).json({ reply: "Device ID is missing." });
        }
    } else {
        // Check if the message is in the format for name and mobile number
        const nameAndNumberPattern = /^([^,]+),(\d+)$/;
        const match = message.match(nameAndNumberPattern);

        if (match) {
            const userName = match[1].trim();
            const userMobile = match[2].trim();

            // Get the current time in IST (Indian Standard Time)
            const createdAtIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

            // Store the name, mobile number, and timestamp in the database
            const query = "INSERT INTO mobile_numbers (name, mobile, created_at) VALUES (?, ?, ?)";
            db.query(query, [userName, userMobile, createdAtIST], (err) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ reply: "அமைப்புப் பிழை ஏற்பட்டது" });
                }
                res.json({ reply: "பகிர்ந்தமைக்கு நன்றி, எங்கள் வாடிக்கையாளர் விரைவில் உங்களைத் தொடர்புகொள்வார்." });
            });
        } else {
            // Process other messages with NLP
            const response = await manager.process("en", message);
            res.json({ reply: response.answer });
        }
    }
});

app.listen(port, () => {
    console.log(`Chatbot running at http://localhost:${port}`);
});
