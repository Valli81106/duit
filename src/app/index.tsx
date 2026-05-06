import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Welcome to duit</Text>
        <Text style={styles.subtitle}>
          The one place to track everything for real this time
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/onboarding/name")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: "space-between",
    padding: 40,
    paddingVertical: 100,
  },
  title: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.white,
    fontSize: 18,
    marginTop: 20,
    lineHeight: 28,
  },
  button: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 40,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "500",
  },
});
