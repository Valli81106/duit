import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/colors";

import { getCurrentMonth } from "../../utils/date";

export default function GoalsScreen() {
  const { name } = useLocalSearchParams();

  const month = getCurrentMonth();

  const [goal1, setGoal1] = useState("");
  const [goal2, setGoal2] = useState("");
  const [goal3, setGoal3] = useState("");

  const handleSave = () => {
    console.log({
      name,
      month,
      goals: [goal1, goal2, goal3],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi {name},</Text>

      <Text style={styles.subtitle}>
        Write down the 3 most important goals for {month}
      </Text>

      <TextInput
        style={styles.input}
        value={goal1}
        onChangeText={setGoal1}
        placeholder="Goal 1"
      />

      <TextInput
        style={styles.input}
        value={goal2}
        onChangeText={setGoal2}
        placeholder="Goal 2"
      />

      <TextInput
        style={styles.input}
        value={goal3}
        onChangeText={setGoal3}
        placeholder="Goal 3"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text>Save Goals</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 30,
    paddingTop: 80,
  },
  title: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.white,
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
  },
});
