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
  passwordHash: string;
};

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !password.trim()) {
      Alert.alert("Error", "Please enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const usersJson = await AsyncStorage.getItem("sinag_users");
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      const matchedUser = users.find((u) => u.username === cleanUsername);
      if (!matchedUser) {
        Alert.alert("Login Failed", "No account found with that username.");
        setLoading(false);
        return;
      }

      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password,
      );

      if (passwordHash !== matchedUser.passwordHash) {
        Alert.alert("Login Failed", "Incorrect username or password.");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("sinag_current_user", cleanUsername);
      router.replace("/device-select" as any);
    } catch (e: any) {
      Alert.alert("Login Failed", "Something went wrong. Please try again.");
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

          <Text style={styles.title}>Login to your Account</Text>

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

          {/* Sign in */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.6 }]}
            onPress={login}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign up link */}
          <TouchableOpacity
            onPress={() => router.push("/signup" as any)}
            style={styles.signupLink}
          >
            <Text style={styles.signupLinkText}>
              Don't have an account?{" "}
              <Text style={styles.signupLinkBold}>Sign up</Text>
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
    paddingTop: 90,
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
    marginTop: 36,
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

  signupLink: { alignItems: "center", marginTop: 32 },
  signupLinkText: { color: "#75718A", fontSize: 13 },
  signupLinkBold: { color: "#A29CF0", fontWeight: "600" },
  footer: {
    color: "#38364A",
    fontSize: 11,
    textAlign: "center",
    marginTop: "auto",
    paddingTop: 24,
    letterSpacing: 0.3,
  },
});
