import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Network from "expo-network";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

type Device = { ip: string; name: string };

export default function DeviceSelect() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [savedDevices, setSavedDevices] = useState<Device[]>([]);
  const [scanDone, setScanDone] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    init();
    scan();
  }, []);

  const init = async () => {
    const username = await AsyncStorage.getItem("sinag_current_user");
    setCurrentUser(username);
    if (username) {
      await loadSavedDevices(username);
    }
  };

  const loadSavedDevices = async (username: string) => {
    try {
      const json = await AsyncStorage.getItem(`sinag_devices_${username}`);
      if (json) {
        setSavedDevices(JSON.parse(json));
      }
    } catch (e) {}
  };

  const scan = async () => {
    setScanning(true);
    setScanDone(false);
    setDevices([]);
    try {
      const ipAddr = await Network.getIpAddressAsync();
      const subnet = ipAddr.split(".").slice(0, 3).join(".");
      const found: Device[] = [];

      const batch = async (start: number, end: number) => {
        const promises = [];
        for (let i = start; i <= end; i++) {
          const target = `${subnet}.${i}`;
          promises.push(
            axios
              .get(`http://${target}/json/info`, { timeout: 800 })
              .then((res: any) => {
                if (res.data && res.data.ver && res.data.name !== undefined) {
                  const device = {
                    ip: target,
                    name: res.data.name || "WLED Device",
                  };
                  found.push(device);
                  setDevices([...found]);
                }
              })
              .catch(() => {}),
          );
        }
        await Promise.all(promises);
      };

      for (let i = 1; i <= 254; i += 50) {
        await batch(i, Math.min(i + 49, 254));
      }
    } catch (e) {}
    setScanning(false);
    setScanDone(true);
  };

  const selectDevice = async (device: Device) => {
    try {
      await AsyncStorage.setItem("wled_ip", device.ip);
      if (currentUser) {
        const exists = savedDevices.find((d) => d.ip === device.ip);
        if (!exists) {
          const updated = [...savedDevices, device];
          setSavedDevices(updated);
          await AsyncStorage.setItem(
            `sinag_devices_${currentUser}`,
            JSON.stringify(updated),
          );
        }
      }
      router.replace("/home" as any);
    } catch (e) {}
  };

  const deleteDevice = async (device: Device) => {
    Alert.alert("Remove Device", `Remove ${device.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const updated = savedDevices.filter((d) => d.ip !== device.ip);
            setSavedDevices(updated);
            if (currentUser) {
              await AsyncStorage.setItem(
                `sinag_devices_${currentUser}`,
                JSON.stringify(updated),
              );
            }
          } catch (e) {}
        },
      },
    ]);
  };

  const logout = async () => {
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

  const renderRightActions = (device: Device) => (
    <TouchableOpacity
      onPress={() => deleteDevice(device)}
      style={styles.deleteAction}
    >
      <Text style={styles.deleteActionText}>🗑</Text>
      <Text style={styles.deleteActionLabel}>Remove</Text>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.emoji}>🪔</Text>
            <Text style={styles.title}>Sinag</Text>
            <Text style={styles.subtitle}>
              Welcome, {currentUser || "User"}!
            </Text>
            <Text style={styles.hint}>
              Select your SmartParol to get started
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Saved Devices */}
          {savedDevices.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>My Parols</Text>
              <Text style={styles.swipeHint}>Swipe left to remove</Text>
              {savedDevices.map((d) => (
                <Swipeable
                  key={d.ip}
                  renderRightActions={() => renderRightActions(d)}
                >
                  <TouchableOpacity
                    onPress={() => selectDevice(d)}
                    style={styles.deviceCard}
                  >
                    <View style={styles.deviceIcon}>
                      <Text style={styles.deviceIconText}>🪔</Text>
                    </View>
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>{d.name}</Text>
                      <Text style={styles.deviceIp}>{d.ip}</Text>
                    </View>
                    <Text style={styles.connectArrow}>→</Text>
                  </TouchableOpacity>
                </Swipeable>
              ))}
            </>
          )}

          {/* Scan results */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Nearby Devices</Text>
            <TouchableOpacity onPress={scan} disabled={scanning}>
              <Text style={styles.rescanBtn}>
                {scanning ? "Scanning..." : "↻ Rescan"}
              </Text>
            </TouchableOpacity>
          </View>

          {scanning && (
            <View style={styles.scanningCard}>
              <ActivityIndicator color="#7F77DD" />
              <Text style={styles.scanningText}>
                Scanning your WiFi network...
              </Text>
            </View>
          )}

          {scanDone && devices.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📡</Text>
              <Text style={styles.emptyTitle}>No devices found</Text>
              <Text style={styles.emptyHint}>
                Make sure your SmartParol is powered on and connected to the
                same WiFi.
              </Text>
            </View>
          )}

          {devices
            .filter((d) => !savedDevices.find((s) => s.ip === d.ip))
            .map((d) => (
              <TouchableOpacity
                key={d.ip}
                onPress={() => selectDevice(d)}
                style={styles.deviceCard}
              >
                <View style={styles.deviceIcon}>
                  <Text style={styles.deviceIconText}>🪔</Text>
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{d.name}</Text>
                  <Text style={styles.deviceIp}>{d.ip}</Text>
                </View>
                <Text style={styles.connectArrow}>→</Text>
              </TouchableOpacity>
            ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0912" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emoji: { fontSize: 36, marginBottom: 4 },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#7F77DD", fontSize: 14, marginTop: 2 },
  hint: { color: "#888", fontSize: 13, marginTop: 4 },
  logoutBtn: {
    backgroundColor: "#17151F",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  logoutBtnText: { color: "#FF6666", fontSize: 13 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    color: "#7F77DD",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 8,
  },
  swipeHint: { color: "#555", fontSize: 11, marginBottom: 8 },
  rescanBtn: { color: "#7F77DD", fontSize: 14 },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#17151F",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#242030",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceIconText: { fontSize: 24 },
  deviceInfo: { flex: 1 },
  deviceName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  deviceIp: { color: "#888", fontSize: 13, marginTop: 2 },
  connectArrow: { color: "#7F77DD", fontSize: 20 },
  deleteAction: {
    backgroundColor: "#FF3B30",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginBottom: 10,
  },
  deleteActionText: { fontSize: 20 },
  deleteActionLabel: { color: "#fff", fontSize: 12, marginTop: 4 },
  scanningCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#17151F",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  scanningText: { color: "#888", fontSize: 14 },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#17151F",
    borderRadius: 14,
    padding: 32,
    marginBottom: 10,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyHint: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
