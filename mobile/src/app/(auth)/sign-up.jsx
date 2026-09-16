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
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useSignUp, useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const { isLoaded } = useAuth();
  const { signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle starting sign up
  const onSignUpPress = async () => {
    console.log(">>> onSignUpPress clicked. isLoaded:", isLoaded, "signUp available:", !!signUp, "email:", emailAddress);

    if (isLoaded === false || !signUp) {
      console.warn("Clerk is not loaded yet.");
      setError("Authentication service is initializing. Please wait a moment.");
      return;
    }

    if (!emailAddress || !emailAddress.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password || password.trim().length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Calling signUp.create for:", emailAddress.trim());
      await signUp.create({
        emailAddress: emailAddress.trim(),
        password: password.trim(),
      });
      console.log("signUp.create succeeded with password!");

      console.log("Preparing email address verification code...");
      if (typeof signUp.verifications?.sendEmailCode === "function") {
        await signUp.verifications.sendEmailCode();
      } else if (typeof signUp.prepareEmailAddressVerification === "function") {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else if (typeof signUp.prepareVerification === "function") {
        await signUp.prepareVerification({ strategy: "email_code" });
      }
      console.log("Email code sent successfully!");

      setPendingVerification(true);
    } catch (err) {
      console.error("Clerk Sign Up Error:", err);
      console.error("Clerk Sign Up Error Details:", JSON.stringify(err, null, 2));
      const firstErr = err?.errors?.[0];

      if (firstErr?.code === "form_identifier_exists") {
        setError("An account with this email already exists. Please Sign In instead.");
      } else {
        setError(
          firstErr?.longMessage ||
            firstErr?.message ||
            err?.message ||
            "Failed to start sign up. Please check your details and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle code verification
  const onVerifyPress = async () => {
    console.log(">>> onVerifyPress clicked. code:", code);

    if (!isLoaded || !signUp) return;
    if (!code || !code.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Verifying email code...");
      let status = "";
      let createdSessionId = "";

      if (typeof signUp.verifications?.verifyEmailCode === "function") {
        const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
        if (verifyError) throw verifyError;
        status = signUp.status;
        createdSessionId = signUp.createdSessionId;
      } else if (typeof signUp.attemptEmailAddressVerification === "function") {
        const res = await signUp.attemptEmailAddressVerification({ code: code.trim() });
        status = res.status;
        createdSessionId = res.createdSessionId;
      } else if (typeof signUp.attemptVerification === "function") {
        const res = await signUp.attemptVerification({ code: code.trim(), strategy: "email_code" });
        status = res.status;
        createdSessionId = res.createdSessionId;
      }

      console.log("Sign Up Verification Status:", status || signUp.status);
      console.log("Missing fields:", signUp.missingFields);
      console.log("Unverified fields:", signUp.unverifiedFields);

      if (status === "complete" || signUp.status === "complete") {
        const activeSessionId = createdSessionId || signUp.createdSessionId;
        console.log("Sign up complete! Setting active session:", activeSessionId);
        
        if (typeof signUp.finalize === "function") {
          await signUp.finalize({ navigate: () => router.replace("/") });
        } else if (setActive && activeSessionId) {
          await setActive({ session: activeSessionId });
          router.replace("/");
        } else {
          router.replace("/");
        }
      } else {
        console.warn("Sign Up Verification Incomplete. Missing fields:", signUp.missingFields, "Unverified:", signUp.unverifiedFields);
        const missingStr = signUp.missingFields && signUp.missingFields.length > 0
          ? signUp.missingFields.join(", ")
          : "additional parameters in Clerk Dashboard";
        setError(`Sign up incomplete (${status || signUp.status}). Missing required fields: ${missingStr}`);
      }
    } catch (err) {
      console.error("Clerk Verification Error:", err);
      console.error("Clerk Verification Error Details:", JSON.stringify(err, null, 2));
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          err?.message ||
          "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/Backgrouund1.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
          >
            {/* Clerk Captcha Mount Point */}
            <View nativeID="clerk-captcha" />

            {/* Top Staggered Branding Section */}
            <View style={styles.topBrandingSection}>
              <Text style={styles.earnText}>Earn</Text>
              <Text style={styles.trackText}>Track</Text>
              <Text style={styles.saveText}>Save</Text>
            </View>

            {/* Bottom Actions & Text Container */}
            <View style={styles.bottomSection}>
              {/* Hero Heading Section */}
              <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>
                  Track your{"\n"}money, smarter.
                </Text>
                <Text style={styles.heroSubtitle}>
                  {pendingVerification
                    ? `Enter the 6-digit verification code\nsent to ${emailAddress}`
                    : "Monitor your spending,\nset budgets, and reach your goals."}
                </Text>
              </View>

              {/* Error Banner if any */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Form Section */}
              {!pendingVerification ? (
                <>
                  <TextInput
                    style={styles.pillInput}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={emailAddress}
                    placeholder="Enter email address"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => setEmailAddress(text)}
                  />

                  <TextInput
                    style={styles.pillInput}
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    placeholder="Create a password (min 8 chars)"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => setPassword(text)}
                  />

                  <TouchableOpacity
                    style={[styles.whitePillButton, loading && styles.buttonDisabled]}
                    onPress={onSignUpPress}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#0F172A" />
                    ) : (
                      <Text style={styles.whitePillButtonText}>Create Account</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
                      <Text style={styles.footerLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.pillInput}
                    keyboardType="number-pad"
                    value={code}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => setCode(text)}
                    maxLength={6}
                  />

                  <TouchableOpacity
                    style={[styles.whitePillButton, loading && styles.buttonDisabled]}
                    onPress={onVerifyPress}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#0F172A" />
                    ) : (
                      <Text style={styles.whitePillButtonText}>Verify Email & Sign Up</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.footerRow}
                    onPress={() => {
                      setPendingVerification(false);
                      setCode("");
                      setError("");
                    }}
                  >
                    <Text style={styles.footerLink}>Use a different email</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "android" ? 36 : 16,
    paddingBottom: Platform.OS === "ios" ? 28 : 24,
  },
  /* Top Staggered Branding */
  topBrandingSection: {
    marginTop: 88,
    paddingLeft: 0,
  },
  earnText: {
    fontSize: 44,
    fontWeight: "500",
    color: "rgba(15, 23, 42, 0.11)",
    letterSpacing: -0.6,
    lineHeight: 52,
    marginLeft: 0,
  },
  trackText: {
    fontSize: 58,
    fontWeight: "600",
    color: "#0F172A",
    letterSpacing: -1.5,
    lineHeight: 66,
    marginLeft: 50,
    marginVertical: 4,
  },
  saveText: {
    fontSize: 44,
    fontWeight: "500",
    color: "rgba(15, 23, 42, 0.11)",
    letterSpacing: -0.6,
    lineHeight: 52,
    marginLeft: 0,
  },
  /* Bottom Section */
  bottomSection: {
    width: "100%",
    marginTop: "auto",
    paddingTop: 40,
  },
  /* Hero Text Section */
  heroSection: {
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.88)",
    marginTop: 10,
    lineHeight: 23,
  },
  /* Error Banner */
  errorContainer: {
    backgroundColor: "rgba(225, 29, 72, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.5)",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  /* Pill Input & Primary White Button */
  pillInput: {
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
    marginBottom: 12,
  },
  whitePillButton: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  whitePillButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
  },
  footerLink: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
