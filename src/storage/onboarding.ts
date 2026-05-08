import AsyncStorage from "@react-native-async-storage/async-storage";

const NAME_KEY = "doit_user_name";

export async function saveName(name: string): Promise<void> {
  await AsyncStorage.setItem(NAME_KEY, name);
}

export async function getName(): Promise<string> {
  return (await AsyncStorage.getItem(NAME_KEY)) ?? "there";
}
