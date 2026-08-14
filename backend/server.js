const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const connectDB = require("./config/db");
const materialRoutes = require("./routes/materialRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();

app.use(cors({
    origin: [
        "https://studyshare-gkjbk8v04-srirams-projects-932bfdb2.vercel.app",
        "https://studyshare-liart.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
connectDB();

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.get("/test", (req, res) => {
    res.send("Test route works!");
});

app.get("/", (req, res) => {
    res.send("Study Material Portal API is running");
});

// 404 handler - keep this after all routes
app.use((req, res) => {
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Central error handler - catches multer errors (bad file type,
// file too large) and anything else thrown/passed to next(err)
app.use((err, req, res, next) => {
    console.error(err);

    if (err.name === "MulterError" || err.message) {
        return res.status(400).json({
            message: err.message || "Request failed"
        });
    }

    res.status(500).json({
        message: "Something went wrong on the server"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});