import { useCallback, useState } from "react";
import { Alert } from "react-native";

const API_URL = "https://track-9b0s.onrender.com/api/transactions";

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
      const response = await fetch(`${API_URL}/${userId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Could not fetch transactions:", error.message || error);
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
      console.warn("Could not fetch summary:", error.message || error);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.warn("Error loading data:", error.message || error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  const createTransaction = async ({ title, amount, category }) => {
    if (!userId) throw new Error("User not authenticated");
    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title,
          amount,
          category,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to create transaction");
      }

      await loadData();
      return resData;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete transaction");

      await loadData();
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
    createTransaction,
    deleteTransaction,
  };
};