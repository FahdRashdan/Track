import express from "express";// remember to add in the package.json "type": "module" to use this syntax
import { initDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";

const app = express();

//Middleware
app.use(rateLimiter); // Apply rate limiter middleware to all routes

app.use(express.json());

const PORT = process.env.PORT || 5001;



app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/api/transactions", transactionsRoutes);

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
