import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { getEvents } from "../../storage/events";
import { Goal, getGoals, saveGoals } from "../../storage/goals";
import { getName } from "../../storage/onboarding";
import { getTasks } from "../../storage/tasks";

const PRIMARY = "#1A00CC";
const SCREEN_W = Dimensions.get("window").width;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOffset(month: number, year: number) {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${month}-${day}`;
}

function isFuture(year: number, month: number, day: number) {
  const today = new Date();
  const target = new Date(year, month - 1, day);

  today.setHours(0, 0, 0, 0);

  return target > today;
}

function isToday(year: number, month: number, day: number) {
  const today = new Date();

  return (
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day
  );
}

function ProgressRing({ percent }: { percent: number }) {
  return (
    <View style={styles.ringWrapper}>
      <View style={styles.ring} />
      <Text style={styles.ringText}>{Math.round(percent)}</Text>
    </View>
  );
}

const CELL_SIZE = Math.floor((SCREEN_W - 80) / 7);

export default function ProfileScreen() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [userName, setUserName] = useState("there");

  const [dayLog, setDayLog] = useState<any>(null);
  const [dayTasks, setDayTasks] = useState<any[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});

  const completedGoals = goals.filter((g) => g.completed).length;

  const goalProgress =
    goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  useFocusEffect(
    useCallback(() => {
      loadEverything();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      loadDayData(year, month, selectedDay);
    }, [selectedDay, month, year]),
  );

  const loadEverything = async () => {
    const g = await getGoals();
    const e = await getEvents();
    const n = await getName();

    setGoals(g);
    setEvents(e);
    setUserName(n);

    await loadMediaMap();
  };

  const loadMediaMap = async () => {
    const map: Record<string, string> = {};

    for (let d = 1; d <= getDaysInMonth(month, year); d++) {
      const raw = await AsyncStorage.getItem(`log-${year}-${month}-${d}`);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (parsed.media?.length > 0) {
          map[`${year}-${month}-${d}`] = parsed.media[0];
        }
      }
    }

    setMediaMap(map);
  };

  const loadDayData = async (y: number, m: number, d: number) => {
    const dateKey = toDateKey(y, m, d);

    const logRaw = await AsyncStorage.getItem(`log-${dateKey}`);
    setDayLog(logRaw ? JSON.parse(logRaw) : null);

    const tasks = await getTasks(dateKey);
    setDayTasks(tasks);
  };

  const toggleGoal = async (id: string) => {
    const updated = goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal,
    );

    setGoals(updated);
    await saveGoals(updated);
  };

  const changeMonth = (dir: number) => {
    let m = month + dir;
    let y = year;

    if (m > 12) {
      m = 1;
      y++;
    }

    if (m < 1) {
      m = 12;
      y--;
    }

    setMonth(m);
    setYear(y);
    setSelectedDay(1);
  };

  const renderCells = () => {
    const offset = getFirstDayOffset(month, year);
    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(<View key={i} style={styles.cellWrapper} />);
    }

    for (let d = 1; d <= getDaysInMonth(month, year); d++) {
      const dateKey = toDateKey(year, month, d);
      const imageUri = mediaMap[dateKey];

      cells.push(
        <TouchableOpacity
          key={d}
          style={styles.cellWrapper}
          onPress={() => setSelectedDay(d)}
        >
          <View
            style={[
              styles.cellCircle,
              selectedDay === d && styles.selectedCell,
            ]}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.cellImage} />
            ) : (
              <Text style={styles.cellText}>{d}</Text>
            )}
          </View>
        </TouchableOpacity>,
      );
    }

    return cells;
  };

  const selectedIsFuture = isFuture(year, month, selectedDay);

  return (
    <ScrollView style={styles.root}>
      {/* Goals */}
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Goals</Text>

          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalRow}
              onPress={() => toggleGoal(goal.id)}
            >
              <View
                style={[styles.goalBox, goal.completed && styles.goalBoxDone]}
              />
              <Text style={styles.goalText}>{goal.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ProgressRing percent={goalProgress} />
      </View>

      {goals.length > 0 && completedGoals === goals.length && (
        <Text style={styles.congrats}>
          Wohoo 🎉 congratulations on completing your goals
        </Text>
      )}

      {/* Calendar */}
      <View style={styles.card}>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Text style={styles.arrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.monthText}>
            {MONTHS[month - 1].toLowerCase()}
          </Text>

          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.daysRow}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.dayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>{renderCells()}</View>
      </View>

      {/* Daily preview */}
      <View style={styles.card}>
        <Text style={styles.heading}>
          {selectedDay} {MONTHS[month - 1]}
        </Text>

        <Text style={styles.section}>Logs</Text>

        {selectedIsFuture ? (
          <Text style={styles.empty}>The day has yet to come</Text>
        ) : dayLog?.text ? (
          <>
            <Text numberOfLines={2} style={styles.logText}>
              {dayLog.text}
            </Text>

            <TouchableOpacity
              style={styles.readBtn}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/log",
                  params: {
                    date: toDateKey(year, month, selectedDay),
                  },
                })
              }
            >
              <Text style={styles.readText}>Read</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.empty}>Nothing logged for the day</Text>
        )}

        <Text style={[styles.section, { marginTop: 20 }]}>Todo</Text>

        {selectedIsFuture ? (
          <Text style={styles.empty}>The day has yet to come</Text>
        ) : dayTasks.length > 0 ? (
          dayTasks.map((task) => (
            <Text key={task.id} style={styles.todoText}>
              • {task.label}
            </Text>
          ))
        ) : (
          <Text style={styles.empty}>Nothing logged for the day</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PRIMARY,
    padding: 16,
  },

  card: {
    backgroundColor: PRIMARY,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  heading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },

  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  goalBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginRight: 10,
  },

  goalBoxDone: {
    backgroundColor: "#fff",
  },

  goalText: {
    color: "#fff",
    flex: 1,
  },

  ringWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  ring: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 7,
    borderColor: "#fff",
  },

  ringText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  congrats: {
    color: "#fff",
    marginBottom: 20,
    fontWeight: "600",
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 14,
  },

  arrow: {
    color: "#fff",
    fontSize: 18,
  },

  monthText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  daysRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  dayText: {
    flex: 1,
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  cellWrapper: {
    width: "14.28%",
    alignItems: "center",
    marginBottom: 6,
  },

  cellCircle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  selectedCell: {
    borderWidth: 2,
    borderColor: "#fff",
  },

  cellImage: {
    width: "100%",
    height: "100%",
  },

  cellText: {
    color: "#555",
    fontSize: 11,
  },

  section: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  logText: {
    color: "rgba(255,255,255,0.8)",
  },

  readBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
  },

  readText: {
    color: "#fff",
  },

  todoText: {
    color: "#fff",
    marginBottom: 6,
  },

  empty: {
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
  },
});
