import { sql } from "../config/db.js";
export async function getTransactionByUserId(req, res) {
        try {
        
                const {user_id}=req.params
                 const transactions = await sql`
                 SELECT * FROM transactions WHERE user_id=${user_id} ORDER BY create_at DESC`;
        
                res.status(200).json(transactions);
        
            } catch (error) {
                 console.error("Error getting transaction:", error);
                 res.status(500).json({ error: "Internal server error" });
            }
    }



    export async function CreateTransaction(req, res) {
         try {
        
                const { user_id, title, amount, category } = req.body;
                if (!user_id || !title || amount === undefined || !category) {
                    return res.status(400).json({ error: "Missing required fields" });
                }
        
                const transaction = await sql`INSERT INTO transactions (user_id, title, amount, category) VALUES (${user_id}, ${title}, ${amount}, ${category}) RETURNING *`;
        
                console.log(transaction);
                res.status(201).json({ message: "Transaction created successfully", transaction: transaction[0] });
        
        
        
        
            }catch (error) {
                console.error("Error creating transaction:", error);
                res.status(500).json({ error: "Internal server error" });
        
            }
    }





    export async function deleteTransaction(req, res) {
         try {
                const { id } = req.params;
                if (isNaN(parseInt(id))) {
                    return res.status(400).json({ error: "Invalid transaction ID" });
        
                }
                const result = await sql`DELETE FROM transactions WHERE id=${id} RETURNING *`
        
                if (result.length === 0) {
                    return res.status(404).json({ error: "Transaction not found" });
                }
                res.status(200).json({ message: "Transaction deleted successfully", transaction: result[0] });
        
        
            }catch (error) {
                console.error("Error deleting transaction:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        }



         export async function GetSummaryTransactions (req, res) {

             try {
        const { user_id } = req.params;

        const balanceResult = await sql`SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions WHERE user_id=${user_id}`;
        const incomeResult = await sql`SELECT COALESCE(SUM(amount), 0) AS income FROM transactions WHERE user_id=${user_id} AND amount > 0`;
        const expenseResult = await sql`SELECT COALESCE(SUM(amount), 0) AS expense FROM transactions WHERE user_id=${user_id} AND amount < 0`;
        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expense: expenseResult[0].expense
        });


    } catch (error) {
        console.error("Error getting transaction summary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}