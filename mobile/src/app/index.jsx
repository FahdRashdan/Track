import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useTransactions } from "@/hooks/useTransactions";

export default function Home() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();

  const userId = user?.id;
  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions(userId);

  useEffect(() => {
    if (userId) {
      loadData?.();
    }
  }, [userId, loadData]);

  console.log(">>> User ID:", userId);
  console.log(">>> Transactions:", transactions);
  console.log(">>> Summary:", summary);

  if (!isLoaded) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress || "User";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userEmail.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.emailText}>{userEmail}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Authenticated with Clerk</Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 28,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  signOutButton: {
    backgroundColor: COLORS.expense,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  signOutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
