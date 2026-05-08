import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getEvents, saveEvent } from "../../storage/events";
import { getGoals } from "../../storage/goals";
import { getName } from "../../storage/onboarding";
import { getTasks, saveTasks, Task } from "../../storage/tasks";
import { CalendarEvent } from "../../types";

const PRIMARY = "#1A00CC";
const BG = "#F5F3EE";
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

const EVENT_COLORS = [
  { hex: "#E24B4A" },
  { hex: "#378ADD" },
  { hex: "#1D9E75" },
  { hex: "#EF9F27" },
  { hex: "#D4537E" },
  { hex: "#7F77DD" },
  { hex: "#639922" },
  { hex: "#D85A30" },
];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}
function getFirstDayOffset(month: number, year: number) {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
function getDayName(date: Date) {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][date.getDay()];
}
function getMonthName(date: Date) {
  return MONTHS[date.getMonth()];
}

function PieChart({ percent }: { percent: number }) {
  const size = 72;
  return (
    <View
      style={[
        pieStyles.outer,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={pieStyles.label}>{Math.round(percent)}%</Text>
    </View>
  );
}

const pieStyles = StyleSheet.create({
  outer: {
    borderWidth: 6,
    borderColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  label: { fontSize: 16, fontWeight: "700", color: PRIMARY },
});

const CELL_SIZE = Math.floor((SCREEN_W - 64) / 7);

export default function HomeScreen() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [userName, setUserName] = useState("there");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventName, setEventName] = useState("");
  const [selectedColor, setSelectedColor] = useState(EVENT_COLORS[0].hex);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const savedGoals = await getGoals();
        const savedEvents = await getEvents();
        const name = await getName();
        const savedTasks = await getTasks();

        setGoals(savedGoals);
        setEvents(savedEvents);
        setUserName(name);
        setTasks(savedTasks);
      })();
    }, []),
  );

  const daysInMonth = getDaysInMonth(month, year);
  const monthEvents = events.filter(
    (e) => e.month === month && e.year === year,
  );
  const getEventForDay = (day: number) =>
    monthEvents.find((e) => e.day === day);

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
  };

  const handleAddEvent = async () => {
    if (!eventName.trim() || selectedDay === null) return;
    const event: CalendarEvent = {
      id: `${year}-${month}-${selectedDay}-${Date.now()}`,
      day: selectedDay,
      month,
      year,
      name: eventName.trim(),
      color: selectedColor,
    };
    await saveEvent(event);
    setEvents((prev) => [...prev.filter((e) => e.id !== event.id), event]);
    setModalVisible(false);
    setEventName("");
  };

  const toggleTask = async (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    );
    setTasks(updated);
    await saveTasks(updated);
  };

  const monthProgress =
    month === today.getMonth() + 1 && year === today.getFullYear()
      ? today.getDate() / daysInMonth
      : 0;

  const doneTasks = tasks.filter((t) => t.done).length;
  const taskPercent = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;

  const renderCalendarCells = () => {
    const offset = getFirstDayOffset(month, year);
    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(<View key={`e-${i}`} style={calStyles.cellWrapper} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ev = getEventForDay(d);
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() + 1 &&
        year === today.getFullYear();
      const isSelected = selectedDay === d;

      cells.push(
        <TouchableOpacity
          key={d}
          style={calStyles.cellWrapper}
          onPress={() => setSelectedDay(d)}
          activeOpacity={0.7}
        >
          <View
            style={[
              calStyles.cellCircle,
              ev
                ? { backgroundColor: ev.color }
                : { backgroundColor: "#E2E0DB" },
              isToday && !ev && calStyles.cellToday,
              isSelected && !ev && calStyles.cellSelected,
            ]}
          >
            <Text style={[calStyles.cellText, ev && calStyles.cellTextOnEvent]}>
              {d}
            </Text>
          </View>
        </TouchableOpacity>,
      );
    }
    return cells;
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.hiText}>Hi {userName}</Text>
              <Text style={styles.dateText}>
                {today.getDate()} {getMonthName(today)}, {getDayName(today)}
              </Text>
            </View>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 22 }}>🙂</Text>
            </View>
          </View>

          {/* Goal */}
          <View style={styles.goalSection}>
            <Text style={styles.goalLabel}>Goal</Text>
            <Text style={styles.goalText}>{goals[0] || "No goal set yet"}</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${monthProgress * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Calendar card */}
        <View style={styles.card}>
          <View style={calStyles.monthRow}>
            <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={10}>
              <Text style={calStyles.navBtn}>◀</Text>
            </TouchableOpacity>
            <View style={calStyles.monthPill}>
              <Text style={calStyles.monthText}>{MONTHS[month - 1]}</Text>
            </View>
            <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={10}>
              <Text style={calStyles.navBtn}>▶</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={calStyles.editBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={calStyles.editIcon}>✎</Text>
            </TouchableOpacity>
          </View>

          <View style={calStyles.dayHeadersRow}>
            {DAYS.map((d) => (
              <Text key={d} style={calStyles.dayHeader}>
                {d}
              </Text>
            ))}
          </View>

          <View style={calStyles.calGrid}>{renderCalendarCells()}</View>
        </View>

        {/* Tasks for the day */}
        <View style={styles.tasksSection}>
          <Text style={styles.tasksSectionTitle}>Tasks for the day</Text>
          <View style={styles.tasksRow}>
            <View style={styles.tasksList}>
              {tasks.length === 0 ? (
                <Text style={styles.noTasksText}>
                  No tasks added yet :/{"  "}
                  {"\n"}Go to the Tasks page to add tasks.
                </Text>
              ) : (
                tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskItem}
                    onPress={() => toggleTask(task.id)}
                  >
                    <View
                      style={[styles.taskDot, task.done && styles.taskDotDone]}
                    />
                    <Text
                      style={[
                        styles.taskLabel,
                        task.done && styles.taskLabelDone,
                      ]}
                    >
                      {task.label}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
            <PieChart percent={taskPercent} />
          </View>
        </View>
      </ScrollView>

      {/* Add Event Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalBg}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add event</Text>
            <Text style={styles.modalSubtitle}>
              {selectedDay
                ? `Adding to ${MONTHS[month - 1]} ${selectedDay}`
                : "Tap a day on the calendar first"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Event name"
              placeholderTextColor="#bbb"
              value={eventName}
              onChangeText={setEventName}
              autoFocus
            />

            <View style={styles.colorRow}>
              {EVENT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.hex}
                  style={[
                    styles.swatch,
                    { backgroundColor: c.hex },
                    selectedColor === c.hex && styles.swatchSelected,
                  ]}
                  onPress={() => setSelectedColor(c.hex)}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleAddEvent}>
                <Text style={styles.btnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const calStyles = StyleSheet.create({
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 14,
  },
  navBtn: { fontSize: 12, color: PRIMARY, paddingHorizontal: 4 },
  monthPill: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 16,
  },
  monthText: { color: PRIMARY, fontWeight: "600", fontSize: 13 },
  editBtn: {
    position: "absolute",
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: { fontSize: 14, color: PRIMARY },
  dayHeadersRow: { flexDirection: "row", marginBottom: 6 },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    color: "#aaa",
    fontWeight: "500",
  },
  calGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 5 },
  cellWrapper: { width: "14.2857%", alignItems: "center", paddingVertical: 1 },
  cellCircle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: { fontSize: 11, fontWeight: "500", color: "#444" },
  cellTextOnEvent: { color: "#fff", fontWeight: "600" },
  cellToday: { borderWidth: 2, borderColor: PRIMARY },
  cellSelected: {
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: "#DDE0FF",
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PRIMARY },
  scrollContent: { paddingBottom: 100 },

  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  hiText: { color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: "500" },
  dateText: { color: "#fff", fontSize: 26, fontWeight: "700", marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  goalSection: { marginTop: 4 },
  goalLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  goalText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
  },
  progressBarFill: { height: 4, backgroundColor: "#fff", borderRadius: 2 },

  card: {
    backgroundColor: BG,
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },

  tasksSection: {
    backgroundColor: BG,
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 18,
  },
  tasksSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 14,
  },
  tasksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tasksList: { flex: 1, marginRight: 12 },
  noTasksText: { fontSize: 13, color: "#888", lineHeight: 20 },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  taskDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ccc" },
  taskDotDone: { backgroundColor: PRIMARY },
  taskLabel: { fontSize: 13, color: "#444" },
  taskLabelDone: { color: "#888", textDecorationLine: "line-through" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: { backgroundColor: "#fff", borderRadius: 22, padding: 22 },
  modalTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111",
  },
  modalSubtitle: { fontSize: 12, color: "#888", marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginBottom: 13,
    color: "#111",
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  swatchSelected: { borderWidth: 3, borderColor: "#111" },
  modalActions: { flexDirection: "row", gap: 8 },
  btnCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  btnCancelText: { fontSize: 13, color: "#555" },
  btnSave: {
    flex: 1,
    padding: 12,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    alignItems: "center",
  },
  btnSaveText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});
