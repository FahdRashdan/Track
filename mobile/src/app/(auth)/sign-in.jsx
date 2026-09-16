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
import { useSignIn, useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";

export default function SignInScreen() {
  const { isLoaded } = useAuth();
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle email + password sign in
  const onSignInPress = async () => {
    console.log(">>> onSignInPress clicked. isLoaded:", isLoaded, "signIn available:", !!signIn, "email:", emailAddress);

    if (isLoaded === false || !signIn) {
      setError("Authentication service is initializing. Please wait a moment.");
      return;
    }

    if (!emailAddress || !emailAddress.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password || !password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let status = "";
      let createdSessionId = "";

      if (typeof signIn.password === "function") {
        const { error: passwordError } = await signIn.password({
          emailAddress: emailAddress.trim(),
          password: password.trim(),
        });
        if (passwordError) throw passwordError;
        status = signIn.status;
        createdSessionId = signIn.createdSessionId;
      } else if (typeof signIn.create === "function") {
        const result = await signIn.create({
          identifier: emailAddress.trim(),
          password: password.trim(),
        });
        status = result.status;
        createdSessionId = result.createdSessionId;
      }

      console.log("Sign In Status:", status || signIn.status);

      const currentStatus = status || signIn.status;

      if (currentStatus === "complete") {
        const activeSessionId = createdSessionId || signIn.createdSessionId;
        console.log("Sign In complete! Setting active session:", activeSessionId);

        if (typeof signIn.finalize === "function") {
          await signIn.finalize({ navigate: () => router.replace("/") });
        } else if (setActive && activeSessionId) {
          await setActive({ session: activeSessionId });
          router.replace("/");
        } else {
          router.replace("/");
        }
      } else if (currentStatus === "needs_client_trust" || currentStatus === "needs_second_factor") {
        console.log("New device verification required (needs_client_trust). Sending verification code...");
        if (typeof signIn.mfa?.sendEmailCode === "function") {
          await signIn.mfa.sendEmailCode();
        } else if (typeof signIn.prepareFirstFactor === "function") {
          await signIn.prepareFirstFactor({ strategy: "email_code" });
        }
        setPendingVerification(true);
      } else {
        setError(`Sign in incomplete (${currentStatus}). Please check your credentials.`);
      }
    } catch (err) {
      console.error("Clerk Sign In Error:", err);
      console.error("Clerk Sign In Error Details:", JSON.stringify(err, null, 2));

      const firstErr = err?.errors?.[0];
      if (firstErr?.code === "form_identifier_not_found") {
        setError("No account found with this email. Please Sign Up first.");
      } else if (firstErr?.code === "form_password_incorrect") {
        setError("Incorrect password. Please try again.");
      } else {
        setError(
          firstErr?.longMessage ||
            firstErr?.message ||
            err?.message ||
            "Failed to sign in. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle new device (needs_client_trust) verification code
  const onVerifyCodePress = async () => {
    if (!isLoaded || !signIn) return;
    if (!code || !code.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Verifying new device code...");
      let status = "";
      let createdSessionId = "";

      if (typeof signIn.mfa?.verifyEmailCode === "function") {
        const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
        if (verifyError) throw verifyError;
        status = signIn.status;
        createdSessionId = signIn.createdSessionId;
      } else if (typeof signIn.attemptFirstFactor === "function") {
        const res = await signIn.attemptFirstFactor({ strategy: "email_code", code: code.trim() });
        status = res.status;
        createdSessionId = res.createdSessionId;
      }

      const currentStatus = status || signIn.status;
      console.log("New Device Verification Status:", currentStatus);

      if (currentStatus === "complete") {
        const activeSessionId = createdSessionId || signIn.createdSessionId;
        console.log("Device trusted & Sign In complete!", activeSessionId);

        if (typeof signIn.finalize === "function") {
          await signIn.finalize({ navigate: () => router.replace("/") });
        } else if (setActive && activeSessionId) {
          await setActive({ session: activeSessionId });
          router.replace("/");
        } else {
          router.replace("/");
        }
      } else {
        setError(`Verification incomplete (${currentStatus}). Please check code.`);
      }
    } catch (err) {
      console.error("Device Verification Error:", err);
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
                    ? `Verify new device. Enter the 6-digit code\nsent to ${emailAddress}`
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
                    placeholder="Enter your password"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => setPassword(text)}
                  />

                  <TouchableOpacity
                    style={[styles.whitePillButton, loading && styles.buttonDisabled]}
                    onPress={onSignInPress}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#0F172A" />
                    ) : (
                      <Text style={styles.whitePillButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
                      <Text style={styles.footerLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.pillInput}
                    keyboardType="number-pad"
                    value={code}
                    placeholder="Enter 6-digit verification code"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => setCode(text)}
                    maxLength={6}
                  />

                  <TouchableOpacity
                    style={[styles.whitePillButton, loading && styles.buttonDisabled]}
                    onPress={onVerifyCodePress}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#0F172A" />
                    ) : (
                      <Text style={styles.whitePillButtonText}>Verify Device & Sign In</Text>
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
                    <Text style={styles.footerLink}>Back to Sign In</Text>
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
  /* Hero Heading Section */
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
