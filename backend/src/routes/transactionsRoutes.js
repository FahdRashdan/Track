import express from "express";
import {
    getTransactionByUserId,
    CreateTransaction,
    deleteTransaction,
    GetSummaryTransactions
} from "../controllers/transactionsControllers.js";

const router = express.Router();

router.get("/:user_id", getTransactionByUserId);



router.post("/", CreateTransaction);


router.delete("/:id",deleteTransaction);

router.get("/summary/:user_id", GetSummaryTransactions); 

export default router;