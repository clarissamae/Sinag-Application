import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text } from "react-native";

export default function Splash() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(subtitleFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(async () => {
            const currentUser =
              await AsyncStorage.getItem("sinag_current_user");
            if (currentUser) {
              router.replace("/device-select" as any);
            } else {
              router.replace("/login" as any);
            }
          }, 1000);
        });
      });
    });
  }, []);

  return (
    <LinearGradient
      colors={["#15131F", "#0F0E16", "#0A0912"]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require("../assets/images/Sinag_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={{ opacity: textFadeAnim }}>
        <Text style={styles.title}>Sinag</Text>
      </Animated.View>

      <Animated.View style={{ opacity: subtitleFadeAnim }}>
        <Text style={styles.subtitle}>Smart Parol Controller</Text>
      </Animated.View>

      <Animated.View
        style={[styles.bottomContainer, { opacity: subtitleFadeAnim }]}
      >
        <Text style={styles.poweredBy}>Powered by WLED</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoContainer: { marginBottom: 24 },
  logo: { width: 160, height: 160 },
  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1.5,
  },
  subtitle: {
    color: "#8A87A0",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  bottomContainer: { position: "absolute", bottom: 40 },
  poweredBy: {
    color: "#38364A",
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
