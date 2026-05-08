import { router } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { EVENT_COLORS } from "../../constants/colors";
import { saveEvent } from "../../storage/events";
import { CalendarEvent } from "../../types";

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

const CELL_SIZE = 38;
const PRIMARY = "#1A00CC";

export default function EventsScreen() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventName, setEventName] = useState("");
  const [selectedColor, setSelectedColor] = useState(EVENT_COLORS[0].hex);

  const daysInMonth = getDaysInMonth(month, year);
  const offset = getFirstDayOffset(month, year);
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
    setSelectedDay(null);
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

  const renderCells = () => {
    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.cellWrapper} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ev = getEventForDay(d);
      const isSelected = selectedDay === d;
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() + 1 &&
        year === today.getFullYear();

      cells.push(
        <TouchableOpacity
          key={d}
          style={styles.cellWrapper}
          onPress={() => setSelectedDay(d)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.cellCircle,
              ev
                ? { backgroundColor: ev.color }
                : { backgroundColor: "#E2E0DB" },
              isToday && !ev && styles.cellToday,
              isSelected && !ev && styles.cellSelected,
            ]}
          >
            <Text style={[styles.cellText, ev && styles.cellTextOnEvent]}>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          The first thing for{"\n"}doit is to plan ahead.
        </Text>
        <Text style={styles.subtitle}>
          So plan your month, note down all the important events and
          non-skippable exams.
        </Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Month nav */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={10}>
            <Text style={styles.navBtn}>◀</Text>
          </TouchableOpacity>
          <View style={styles.monthPill}>
            <Text style={styles.monthText}>{MONTHS[month - 1]}</Text>
          </View>
          <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={10}>
            <Text style={styles.navBtn}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeadersRow}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayHeader}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calGrid}>{renderCells()}</View>

        {/* Add event row */}
        <View style={styles.addRow}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.addIcon}>
              <Text style={styles.addIconText}>+</Text>
            </View>
            <Text style={styles.addBtnText}>Add Event</Text>
          </TouchableOpacity>
          <View style={styles.dotRed} />
        </View>

        {/* Events list */}
        <ScrollView
          style={styles.eventsList}
          showsVerticalScrollIndicator={false}
        >
          {monthEvents
            .sort((a, b) => a.day - b.day)
            .map((ev) => (
              <View key={ev.id} style={styles.eventChip}>
                <View
                  style={[styles.eventDot, { backgroundColor: ev.color }]}
                />
                <Text style={styles.eventName}>{ev.name}</Text>
                <Text style={styles.eventDay}>
                  {MONTHS[month - 1].slice(0, 3)} {ev.day}
                </Text>
              </View>
            ))}
        </ScrollView>

        {/* Next button */}
        <View style={styles.nextRow}>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => router.replace("/(tabs)/home" as any)}
          >
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalBg}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>New event</Text>
            <Text style={styles.modalSubtitle}>
              {selectedDay
                ? `Adding to ${MONTHS[month - 1]} ${selectedDay}`
                : "Tap a day on the calendar first"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Event name (e.g. Math exam)"
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  header: {
    paddingHorizontal: 26,
    paddingTop: 56,
    paddingBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 16,
  },
  navBtn: {
    fontSize: 13,
    color: PRIMARY,
    paddingHorizontal: 6,
  },
  monthPill: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  monthText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 14,
  },
  dayHeadersRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    color: "#aaa",
    fontWeight: "500",
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 6,
  },
  cellWrapper: {
    width: "14.2857%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 1,
  },
  cellCircle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#444",
  },
  cellTextOnEvent: {
    color: "#fff",
    fontWeight: "600",
  },
  cellToday: {
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: "#DDE0FF",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  addIconText: {
    fontSize: 16,
    color: "#222",
    lineHeight: 20,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222",
  },
  dotRed: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#E24B4A",
  },
  eventsList: {
    maxHeight: 110,
  },
  eventChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 9,
    marginBottom: 6,
    gap: 8,
  },
  eventDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  eventName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  eventDay: {
    fontSize: 11,
    color: "#aaa",
  },
  nextRow: {
    alignItems: "flex-end",
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 4,
  },
  nextBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#888",
    marginBottom: 14,
  },
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
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: "#111",
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
  },
  btnCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  btnCancelText: {
    fontSize: 13,
    color: "#555",
  },
  btnSave: {
    flex: 1,
    padding: 12,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    alignItems: "center",
  },
  btnSaveText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});
