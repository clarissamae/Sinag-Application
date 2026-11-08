import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type StoredUser = {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanUsername ||
      !cleanEmail ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      Alert.alert(
        "Error",
        "Username must be 3-20 characters, using only letters, numbers, and underscores.",
      );
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const usersJson = await AsyncStorage.getItem("sinag_users");
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      if (users.some((u) => u.username === cleanUsername)) {
        Alert.alert("Error", "This username is already taken.");
        setLoading(false);
        return;
      }

      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password,
      );

      const newUser: StoredUser = {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem("sinag_users", JSON.stringify(users));
      await AsyncStorage.setItem("sinag_current_user", cleanUsername);

      router.replace("/device-select" as any);
    } catch (e: any) {
      Alert.alert("Signup Failed", "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <Image
              source={require("../assets/images/Sinag_logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Sinag</Text>
          </View>

          <Text style={styles.title}>Create your Account</Text>

          {/* Username */}
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#5C596C"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Email */}
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#5C596C"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputBox}>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#5C596C"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#8A87A0"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputBox}>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#5C596C"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                style={styles.eyeButton}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#8A87A0"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign up */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.6 }]}
            onPress={signup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text style={styles.loginLinkBold}>Login</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Powered by WLED</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0912" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 70,
    paddingBottom: 40,
  },

  logoRow: { alignItems: "center" },
  logoImage: { width: 64, height: 64 },
  logoText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
    letterSpacing: 0.4,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 32,
    marginBottom: 20,
  },

  inputBox: {
    backgroundColor: "#17151F",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#242030",
    marginBottom: 14,
  },
  input: {
    color: "#fff",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingRight: 8,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  signInBtn: {
    backgroundColor: "#7F77DD",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  signInBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  loginLink: { alignItems: "center", marginTop: 32 },
  loginLinkText: { color: "#75718A", fontSize: 13 },
  loginLinkBold: { color: "#A29CF0", fontWeight: "600" },
  footer: {
    color: "#38364A",
    fontSize: 11,
    textAlign: "center",
    marginTop: "auto",
    paddingTop: 24,
    letterSpacing: 0.3,
  },
});
