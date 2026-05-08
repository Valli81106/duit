import { useRouter } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { saveName } from "../../storage/onboarding";

export default function NameScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleNext = async () => {
    await saveName(name);
    router.push({
      pathname: "/onboarding/goals",
      params: { name },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi there,{"\n"}What do we call you?</Text>
      <Text style={styles.label}>Enter your name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text>Next</Text>
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
    fontWeight: "600",
  },
  label: {
    color: COLORS.white,
    marginTop: 60,
    fontSize: 18,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    marginTop: 20,
    padding: 16,
  },
  button: {
    backgroundColor: COLORS.white,
    marginTop: 40,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
});
