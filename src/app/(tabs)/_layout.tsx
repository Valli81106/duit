import { Tabs } from "expo-router";
import React from "react";

import HomeIcon from "../../../assets/icons/homeiconsvg.svg";
import LogIcon from "../../../assets/icons/log.svg";
import TodoIcon from "../../../assets/icons/plus_duit_svg.svg";
import ProfileIcon from "../../../assets/icons/profileiconsvg.svg";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          height: 70,
          paddingTop: 10,
          paddingBottom: 10,
        },

        tabBarActiveTintColor: "#1A00CC",
        tabBarInactiveTintColor: "#999",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon width={size} height={size} fill={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarIcon: ({ color, size }) => (
            <LogIcon width={size} height={size} fill={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="todo"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <TodoIcon width={size} height={size} fill={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon width={size} height={size} fill={color} />
          ),
        }}
      />
    </Tabs>
  );
}
