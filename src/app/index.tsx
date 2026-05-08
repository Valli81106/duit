import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../constants/colors";
import { hasOnboarded } from "../storage/user";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const done = await hasOnboarded();
      setOnboarded(done);
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.primary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (onboarded) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/onboarding/welcome" />;
}
