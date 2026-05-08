import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { saveGoals } from "../../storage/goals";

const PRIMARY = "#1A00CC";

export default function GoalsScreen() {
  const { name } = useLocalSearchParams();
  const [goals, setGoals] = useState(["", "", ""]);

  const updateGoal = (index: number, value: string) =>
    setGoals((prev) => prev.map((g, i) => (i === index ? value : g)));

  const handleNext = async () => {
    await saveGoals(goals);
    router.push("/onboarding/events" as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi {name},</Text>
      <Text style={styles.subtitle}>
        What are 3 main goals you{"\n"}want to focus on this month
      </Text>

      {goals.map((goal, i) => (
        <View key={i} style={styles.inputRow}>
          <Text style={styles.number}>{i + 1}</Text>
          <TextInput
            style={styles.input}
            value={goal}
            onChangeText={(val) => updateGoal(i, val)}
            placeholderTextColor="#aaa"
          />
        </View>
      ))}

      <View style={styles.nextContainer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  title: { color: "#fff", fontSize: 36, fontWeight: "700", marginBottom: 12 },
  subtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 48,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    gap: 12,
  },
  number: { color: "#fff", fontSize: 24, fontWeight: "700", width: 24 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
  },
  nextContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 40,
  },
  nextBtn: {
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  nextText: { color: PRIMARY, fontWeight: "600", fontSize: 15 },
});
