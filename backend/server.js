const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const app = express();

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ======================
// Static Frontend
// ======================
app.use(express.static(path.join(__dirname, "../frontend")));

// ======================
// API Routes
// ======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));

// ======================
// Test Routes
// ======================
app.get("/server-test", (req, res) => {
  res.send("Mini Social Media API is running 🚀");
});

app.get("/test", (req, res) => {
  res.send("Server OK");
});

// ======================
// MongoDB + Server Start
// ======================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
