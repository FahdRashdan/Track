import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTransactions } from "@/hooks/useTransactions";

const EXPENSE_CATEGORIES = [
  { id: "Food & Beverage", label: "Food & Beverage", icon: "restaurant-outline" },
  { id: "Transportation", label: "Transportation", icon: "car-outline" },
  { id: "Shopping", label: "Shopping", icon: "bag-handle-outline" },
  { id: "Bills", label: "Bills", icon: "document-text-outline" },
  { id: "Entertainment", label: "Entertainment", icon: "film-outline" },
  { id: "Health", label: "Health", icon: "pulse-outline" },
  { id: "Personal", label: "Personal", icon: "home-outline" },
  { id: "Other", label: "Other", icon: "trash-outline" },
];

const INCOME_CATEGORIES = [
  { id: "Salary", label: "Salary", icon: "business-outline" },
  { id: "Freelance", label: "Freelance", icon: "briefcase-outline" },
  { id: "Gift", label: "Gift", icon: "gift-outline" },
  { id: "Refund", label: "Refund", icon: "refresh-outline" },
  { id: "Investment", label: "Investment", icon: "trending-up-outline" },
  { id: "Other", label: "Other", icon: "ellipse-outline" },
];

export default function AddTransactionScreen() {
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const { createTransaction } = useTransactions(userId);

  const [type, setType] = useState("Expense"); // "Expense" | "Income"
  const [amountStr, setAmountStr] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Food & Beverage");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Formatted date string (e.g. "Today, 12 Sep 2026")
  const formattedDate = `Today, ${new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;

  const categories = type === "Expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Handle category selection
  const handleSelectType = (newType) => {
    setType(newType);
    if (newType === "Expense") {
      setSelectedCategory("Food & Beverage");
    } else {
      setSelectedCategory("Salary");
    }
  };

  const handleSave = async () => {
    const rawNum = parseFloat(amountStr.replace(/[^0-9.]/g, ""));

    if (isNaN(rawNum) || rawNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Missing Category", "Please select a category.");
      return;
    }

    setLoading(true);

    try {
      // Expense amounts are saved as negative values in DB, Income as positive
      const finalAmount = type === "Expense" ? -Math.abs(rawNum) : Math.abs(rawNum);
      const title = notes.trim() ? notes.trim() : selectedCategory;

      await createTransaction({
        title,
        amount: finalAmount,
        category: selectedCategory,
      });

      router.back();
    } catch (err) {
      console.error("Failed to save transaction:", err);
      Alert.alert("Error", err.message || "Could not save transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Segmented Switcher (Expense / Income) */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, type === "Expense" && styles.segmentBtnActive]}
              onPress={() => handleSelectType("Expense")}
              activeOpacity={0.85}
            >
              <Text style={[styles.segmentText, type === "Expense" && styles.segmentTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, type === "Income" && styles.segmentBtnActive]}
              onPress={() => handleSelectType("Income")}
              activeOpacity={0.85}
            >
              <Text style={[styles.segmentText, type === "Income" && styles.segmentTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Box */}
          <View style={styles.amountCard}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              value={amountStr}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              onChangeText={setAmountStr}
              maxLength={10}
            />
          </View>

          {/* Category Section */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected && styles.iconCircleSelected,
                    ]}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={22}
                      color={isSelected ? "#FFFFFF" : "#2563EB"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected && styles.categoryLabelSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date Picker Display */}
          <Text style={styles.sectionLabel}>Date</Text>
          <TouchableOpacity style={styles.dateBox} activeOpacity={0.7}>
            <View style={styles.dateLeft}>
              <Ionicons name="calendar-outline" size={20} color="#64748B" />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Notes (Optional) */}
          <Text style={styles.sectionLabel}>Notes (Optional)</Text>
          <View style={styles.notesBox}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              placeholder="Add a note..."
              placeholderTextColor="#94A3B8"
              onChangeText={setNotes}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Transaction</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  /* Segmented Toggle */
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  /* Amount Card */
  amountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 64,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 26,
    fontWeight: "600",
    color: "#0F172A",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "600",
    color: "#0F172A",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  /* Category Grid */
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  categoryItem: {
    width: "31%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  categoryItemSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconCircleSelected: {
    backgroundColor: "#2563EB",
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
  categoryLabelSelected: {
    color: "#1E40AF",
    fontWeight: "700",
  },
  /* Date Box */
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 24,
  },
  dateLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
    marginLeft: 12,
  },
  /* Notes Box */
  notesBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 32,
    justifyContent: "center",
  },
  notesInput: {
    fontSize: 15,
    color: "#0F172A",
  },
  /* Save Button */
  saveButton: {
    height: 56,
    backgroundColor: "#2563EB",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
