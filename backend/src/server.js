import express from "express";// remember to add in the package.json "type": "module" to use this syntax
import { initDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";
import job from "./config/cron.js";


const app = express();

if (process.env.NODE_ENV === "production") job.start();

//Middleware
app.use(rateLimiter); // Apply rate limiter middleware to all routes

app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});



app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/api/transactions", transactionsRoutes);

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
