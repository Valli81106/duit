import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "duit_user";

export type UserProfile = {
  id: string;
  name: string;
  onboarded: boolean;
};

export async function saveUser(user: UserProfile) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function hasOnboarded(): Promise<boolean> {
  const user = await getUser();
  return user?.onboarded ?? false;
}
