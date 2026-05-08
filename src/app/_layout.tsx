import { Stack } from "expo-router";
import "../../global.css"; // ← two levels up: src/app → src → root

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
