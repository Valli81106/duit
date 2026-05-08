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
import { getGoals } from "../../storage/goals";

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

const GOAL_PROGRESS_KEY = "goal_progress";

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

const CELL_SIZE = Math.floor((SCREEN_W - 80) / 7);

function ProgressRing({ percent }: { percent: number }) {
  const rounded = Math.round(percent);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressOuter}>
        <View
          style={[
            styles.progressFill,
            {
              height: `${rounded}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.progressText}>{rounded}%</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [goals, setGoals] = useState<string[]>([]);
  const [checkedGoals, setCheckedGoals] = useState<boolean[]>([]);
  const [dayLog, setDayLog] = useState<any>(null);
  const [dayTasks, setDayTasks] = useState<any[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const savedGoals = await getGoals();
        const savedChecked = await AsyncStorage.getItem(GOAL_PROGRESS_KEY);

        setGoals(savedGoals);

        if (savedChecked) {
          setCheckedGoals(JSON.parse(savedChecked));
        } else {
          setCheckedGoals(savedGoals.map(() => false));
        }

        await loadMediaMap(month, year);
        await loadDayData(year, month, selectedDay);
      })();
    }, [month, year, selectedDay]),
  );

  const loadMediaMap = async (m: number, y: number) => {
    const map: Record<string, string> = {};

    for (let d = 1; d <= getDaysInMonth(m, y); d++) {
      const key = `log-${toDateKey(y, m, d)}`;
      const raw = await AsyncStorage.getItem(key);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (parsed.media?.length > 0) {
          map[toDateKey(y, m, d)] = parsed.media[0];
        }
      }
    }

    setMediaMap(map);
  };

  const loadDayData = async (y: number, m: number, d: number) => {
    const key = toDateKey(y, m, d);

    const logRaw = await AsyncStorage.getItem(`log-${key}`);
    const tasksRaw = await AsyncStorage.getItem(`tasks-${key}`);

    if (logRaw) {
      const parsed = JSON.parse(logRaw);
      setDayLog(parsed);
    } else {
      setDayLog(null);
    }

    if (tasksRaw) {
      setDayTasks(JSON.parse(tasksRaw));
    } else {
      setDayTasks([]);
    }
  };

  const toggleGoal = async (index: number) => {
    const updated = [...checkedGoals];
    updated[index] = !updated[index];

    setCheckedGoals(updated);

    await AsyncStorage.setItem(GOAL_PROGRESS_KEY, JSON.stringify(updated));
  };

  const goalProgress =
    goals.length > 0
      ? (checkedGoals.filter(Boolean).length / goals.length) * 100
      : 0;

  const changeMonth = async (dir: number) => {
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

    await loadMediaMap(m, y);
    await loadDayData(y, m, 1);
  };

  const renderCells = () => {
    const offset = getFirstDayOffset(month, year);
    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.cellWrapper} />);
    }

    for (let d = 1; d <= getDaysInMonth(month, year); d++) {
      const dateKey = toDateKey(year, month, d);
      const imgUri = mediaMap[dateKey];

      cells.push(
        <TouchableOpacity
          key={`${month}-${year}-${d}`}
          style={styles.cellWrapper}
          onPress={() => {
            setSelectedDay(d);
            loadDayData(year, month, d);
          }}
        >
          <View
            style={[
              styles.cellCircle,
              selectedDay === d && styles.selectedCell,
            ]}
          >
            {imgUri && (
              <Image source={{ uri: imgUri }} style={styles.cellImage} />
            )}

            <View style={styles.numberOverlay}>
              <Text style={styles.cellText}>{d}</Text>
            </View>
          </View>
        </TouchableOpacity>,
      );
    }

    return cells;
  };

  const selectedFuture = isFuture(year, month, selectedDay);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Goals */}
      <View style={styles.goalsCard}>
        <View style={styles.goalsLeft}>
          <Text style={styles.goalsTitle}>Goals</Text>

          {goals.map((goal, index) => (
            <TouchableOpacity
              key={index}
              style={styles.goalItem}
              onPress={() => toggleGoal(index)}
            >
              <View
                style={[
                  styles.goalCheck,
                  checkedGoals[index] && styles.goalCheckDone,
                ]}
              />

              <Text
                style={[
                  styles.goalText,
                  checkedGoals[index] && styles.goalTextDone,
                ]}
              >
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.progressSide}>
          <ProgressRing percent={goalProgress} />
        </View>
      </View>

      {/* Calendar */}
      <View style={styles.calCard}>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Text style={styles.navBtn}>←</Text>
          </TouchableOpacity>

          <Text style={styles.monthText}>{MONTHS[month - 1]}</Text>

          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Text style={styles.navBtn}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dayHeaders}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.dayHeader}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>{renderCells()}</View>
      </View>

      {/* Logs + Tasks */}
      <View style={styles.dayCard}>
        <Text style={styles.sectionTitle}>Logs</Text>

        {selectedFuture ? (
          <Text style={styles.emptyMsg}>The day has yet to come.</Text>
        ) : dayLog ? (
          <>
            <Text numberOfLines={2} style={styles.logText}>
              {dayLog.text}
            </Text>

            <TouchableOpacity
              style={styles.readBtn}
              onPress={() => router.push("/(tabs)/log")}
            >
              <Text style={styles.readBtnText}>Read</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.emptyMsg}>Nothing logged for the day.</Text>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Todo</Text>

        {selectedFuture ? (
          <Text style={styles.emptyMsg}>The day has yet to come.</Text>
        ) : dayTasks.length > 0 ? (
          dayTasks.map((task) => (
            <Text key={task.id} style={styles.taskText}>
              • {task.label}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyMsg}>Nothing logged for the day.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },

  goalsCard: {
    backgroundColor: PRIMARY,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  goalsLeft: {
    flex: 1,
    marginRight: 20,
  },

  goalsTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    marginBottom: 14,
  },

  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  goalCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#fff",
  },

  goalCheckDone: {
    backgroundColor: "#fff",
  },

  goalText: {
    color: "#fff",
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },

  goalTextDone: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },

  progressSide: {
    justifyContent: "center",
    alignItems: "center",
  },

  progressContainer: {
    alignItems: "center",
  },

  progressOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.25)",
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  progressFill: {
    width: "100%",
    backgroundColor: "#fff",
  },

  progressText: {
    color: "#fff",
    marginTop: 8,
    fontFamily: "Poppins_700Bold",
  },

  calCard: {
    backgroundColor: PRIMARY,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  navBtn: {
    color: "#fff",
    fontSize: 20,
  },

  monthText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
  },

  dayHeaders: {
    flexDirection: "row",
    marginBottom: 10,
  },

  dayHeader: {
    flex: 1,
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  cellWrapper: {
    width: "14.28%",
    alignItems: "center",
    marginBottom: 8,
  },

  cellCircle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  selectedCell: {
    backgroundColor: "#D6D9FF",
    borderWidth: 2,
    borderColor: "#fff",
  },

  cellImage: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    position: "absolute",
  },

  numberOverlay: {
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  cellText: {
    color: "#000000",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
  },

  dayCard: {
    backgroundColor: PRIMARY,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 24,
    padding: 20,
  },

  sectionTitle: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
  },

  logText: {
    color: "#fff",
    marginBottom: 10,
    fontFamily: "Poppins_400Regular",
  },

  readBtn: {
    borderWidth: 1,
    borderColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  readBtnText: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 20,
  },

  taskText: {
    color: "#fff",
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },

  emptyMsg: {
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
    fontFamily: "Poppins_400Regular",
  },
});
