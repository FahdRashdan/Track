import { useCallback, useState } from "react";
import { Alert, Platform } from "react-native";

// On Android Emulator, use 10.0.2.2 to connect to local host machine. Otherwise, use localhost.
const API_URL = Platform.OS === "android" ? "http://10.0.2.2:5001/api" : "http://localhost:5001/api";
//const API_URL = render link

export const useTransactions = (userId) => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        balance: 0,
        income: 0,
        expense: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await fetch(`${API_URL}/transactions/${userId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setTransactions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.warn("Could not fetch transactions (backend may be offline):", error.message || error);
        }
    }, [userId]);

    const fetchSummary = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await fetch(`${API_URL}/summary/${userId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setSummary(data || { balance: 0, income: 0, expense: 0 });
        } catch (error) {
            console.warn("Could not fetch summary (backend may be offline):", error.message || error);
        }
    }, [userId]);

    const loadData = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            await Promise.all([fetchTransactions(), fetchSummary()]);
        } catch (error) {
            console.warn("Error loading transaction data:", error.message || error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchTransactions, fetchSummary, userId]);

    const deleteTransaction = async (id) => {
        try {
            const response = await fetch(`${API_URL}/transactions/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete transaction");

            loadData();
            Alert.alert("Success", "Transaction deleted successfully");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            Alert.alert("Error", error.message || "Failed to delete transaction");
        }
    };

    return {
        transactions,
        summary,
        isLoading,
        loadData,
        deleteTransaction,
    };
};