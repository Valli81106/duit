import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "doit_goals";

export async function saveGoals(goals: string[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(goals));
}

export async function getGoals(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}
