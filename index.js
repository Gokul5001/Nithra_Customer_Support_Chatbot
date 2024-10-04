const express = require("express");
const { NlpManager } = require("node-nlp");
const path = require("path");
const mysql = require('mysql');
const dotenv=require('dotenv');
const moment = require('moment-timezone');

const app = express();
const port = process.env.PORT || 3000;

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

app.get("/chat", async (req, res) => {
    const { message } = req.query;
    const deviceId = req.query.deviceid;
    console.log('Device ID from query:', deviceId); // Log device ID for debugging
    if (message === "Account Action") {
        if (deviceId) {
            const query = "SELECT COUNT(*) AS count FROM registration WHERE deviceid = ?";
            db.query(query, [deviceId], (err, results) => {
                if (err) {
                    console.error('Error querying database:', err);
                    return res.status(500).json({ reply: "An error occurred. Please try again later." });
                }

                if (results && results[0].count !== undefined) {
                    const isRegistered = results[0].count > 0;
                    let reply;

                    if (isRegistered) {
                        reply = "உங்கள் கணக்கு ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. எங்கள் பயன்பாட்டைப் பயன்படுத்தியதற்கு நன்றி";
                    } else {
                        reply = "உங்கள் கணக்கு பதிவு செய்யப்படவில்லை. பின்வரும் இணைப்பைப் பயன்படுத்தி பதிவு செய்யவும் <a href='https://nithramatrimony.net/register' target='_blank' class='text-red-500 underline'>Register</a>";
                    }

                    return res.json({ reply });
                } else {
                    return res.status(500).json({ reply: "An error occurred while checking registration." });
                }
            });
        } else {
            return res.status(400).json({ reply: "Device ID is missing." });
        }
    } else {
        return res.status(400).json({ reply: "Invalid request. Use 'Account Action' as the message." });
    }
});

// Handle name, mobile, and other NLP messages via POST request
app.post("/chat", async (req, res) => {
    const { message } = req.body;
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
});

app.listen(port, '192.168.58.91', () => {
    console.log(`Chatbot running at http://192.168.58.91:${port}`);
});


