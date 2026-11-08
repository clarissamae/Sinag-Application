import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function Home() {
  const router = useRouter();
  const [wledIp, setWledIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("wled_ip").then((ip) => {
      setWledIp(ip);
    });
  }, []);

  const logout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("sinag_current_user");
          router.replace("/login" as any);
        },
      },
    ]);
  };

  const switchDevice = () => {
    router.push("/device-select" as any);
  };

  if (!wledIp) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#7F77DD" size="large" />
        <Text style={styles.loadingText}>Connecting to your parol...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.topBarEmoji}>🪔</Text>
          <Text style={styles.topBarTitle}>Sinag</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity onPress={switchDevice} style={styles.switchBtn}>
            <Text style={styles.switchBtnText}>⇄ Switch</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <WebView
        source={{ uri: `http://${wledIp}` }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webviewLoading}>
            <ActivityIndicator color="#7F77DD" size="large" />
            <Text style={styles.loadingText}>Loading WLED interface...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0912" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0A0912",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: { color: "#888", fontSize: 14 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#17151F",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#242030",
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  topBarEmoji: { fontSize: 20 },
  topBarTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  topBarRight: { flexDirection: "row", gap: 8 },
  switchBtn: {
    backgroundColor: "#242030",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  switchBtnText: { color: "#A29CF0", fontSize: 13 },
  logoutBtn: {
    backgroundColor: "#242030",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutBtnText: { color: "#FF6666", fontSize: 13 },
  webview: { flex: 1 },
  webviewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0912",
    gap: 16,
  },
});
