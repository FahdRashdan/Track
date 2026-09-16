import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTransactions } from "@/hooks/useTransactions";

// Map categories to specific visual icon & background colors
const getCategoryStyle = (category, amount) => {
  const isIncome = amount > 0;
  if (isIncome || category === "Salary" || category === "Income") {
    return { icon: "arrow-up-outline", bg: "#2DD4BF" }; // Teal circle
  }

  switch (category) {
    case "Food & Beverage":
      return { icon: "cafe-outline", bg: "#524B46" }; // Dark coffee brown
    case "Transportation":
      return { icon: "car-outline", bg: "#1E293B" }; // Dark navy
    case "Entertainment":
      return { icon: "play-outline", bg: "#F43F5E" }; // Red
    case "Shopping":
    case "Grocery Store":
      return { icon: "cart-outline", bg: "#38BDF8" }; // Cyan
    case "Bills":
      return { icon: "document-text-outline", bg: "#8B5CF6" }; // Purple
    case "Health":
      return { icon: "pulse-outline", bg: "#10B981" }; // Green
    default:
      return { icon: "wallet-outline", bg: "#64748B" }; // Slate grey
  }
};

// Format currency
const formatCurrency = (amount) => {
  const num = Math.abs(Number(amount) || 0);
  return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Relative date helper
const getRelativeDate = (dateStr) => {
  if (!dateStr) return "Today";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};

export default function Home() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const userId = user?.id;
  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions(userId);

  const [hideBalance, setHideBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadData?.();
      }
    }, [userId, loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData?.();
    setRefreshing(false);
  };

  if (!isLoaded) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress || "User";

  const handleProfilePress = () => {
    Alert.alert(
      "Profile & Account",
      `Signed in as:\n${userEmail}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: () => signOut() },
      ]
    );
  };

  const handleDeletePress = (item) => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete "${item.title || item.category || "Transaction"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(item.id),
        },
      ]
    );
  };

  const renderTransactionItem = ({ item }) => {
    const isExpense = Number(item.amount) < 0;
    const styleInfo = getCategoryStyle(item.category, item.amount);
    const titleText = item.title || item.category || "Transaction";
    const formattedAmt = `${isExpense ? "- " : "+ "}${formatCurrency(item.amount)}`;
    const dateText = getRelativeDate(item.create_at);

    return (
      <View style={styles.transactionRow}>
        {/* Left Category Icon */}
        <View style={[styles.categoryCircle, { backgroundColor: styleInfo.bg }]}>
          <Ionicons name={styleInfo.icon} size={20} color="#FFFFFF" />
        </View>

        {/* Title & Category */}
        <View style={styles.transactionMain}>
          <Text style={styles.transactionTitle}>{titleText}</Text>
          <Text style={styles.transactionCategory}>{item.category || "General"}</Text>
        </View>

        {/* Amount & Date */}
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, isExpense ? styles.expenseText : styles.incomeText]}>
            {formattedAmt}
          </Text>
          <Text style={styles.transactionDate}>{dateText}</Text>
        </View>

        {/* Trash Bin Delete Icon Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePress(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with Profile Icon on Top Right */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoIcon}>
              <Ionicons name="stats-chart" size={20} color="#2563EB" />
            </View>
            <Text style={styles.headerTitle}>Track</Text>
          </View>

          {/* Profile Icon Button on Top Right */}
          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress} activeOpacity={0.7}>
            <Ionicons name="person-circle-outline" size={32} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Total Balance Card */}
        <View style={styles.totalBalanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {hideBalance ? "••••••••" : formatCurrency(summary.balance || 0)}
            </Text>
            <TouchableOpacity onPress={() => setHideBalance(!hideBalance)} activeOpacity={0.7}>
              <Ionicons
                name={hideBalance ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#64748B"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.growthBadge}>
            <Ionicons name="arrow-up" size={14} color="#10B981" />
            <Text style={styles.growthText}> +12% this month</Text>
          </View>
        </View>

        {/* Income & Expenses Dual Cards */}
        <View style={styles.statsRow}>
          {/* Income Card */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statAmount}>{formatCurrency(summary.income || 0)}</Text>
            <View style={styles.statBadgeGreen}>
              <Ionicons name="arrow-up" size={12} color="#10B981" />
              <Text style={styles.statBadgeGreenText}> 12%</Text>
            </View>
          </View>

          {/* Expenses Card */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statAmount}>{formatCurrency(summary.expense || 0)}</Text>
            <View style={styles.statBadgeRed}>
              <Ionicons name="arrow-up" size={12} color="#EF4444" />
              <Text style={styles.statBadgeRedText}> -8%</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>

        {/* Transactions List */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
        ) : transactions && transactions.length > 0 ? (
          <FlatList
            data={transactions}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderTransactionItem}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet.</Text>
            <Text style={styles.emptySubText}>Tap the + button to add your first transaction!</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Transaction (+) FAB Button */}
      <TouchableOpacity
        style={styles.floatingFab}
        onPress={() => router.push("/add-transaction")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
  },
  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  /* Total Balance Card */
  totalBalanceCard: {
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    opacity: 0.95,
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.8,
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  growthText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
  /* Income & Expenses Dual Cards */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    padding: 18,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 6,
  },
  statAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  statBadgeGreen: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBadgeGreenText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  statBadgeRed: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBadgeRedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  /* Section Header */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  /* Transaction Row */
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  transactionMain: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 13,
    fontWeight: "400",
    color: "#64748B",
  },
  transactionRight: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  expenseText: {
    color: "#0F172A",
  },
  incomeText: {
    color: "#10B981",
  },
  transactionDate: {
    fontSize: 12,
    fontWeight: "400",
    color: "#94A3B8",
  },
  deleteButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
  /* Floating FAB Button */
  floatingFab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
