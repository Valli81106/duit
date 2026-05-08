import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import {
    getTasks,
    saveTasks,
    SubSubTask,
    SubTask,
    Task,
} from "../../storage/tasks";

const PRIMARY = "#1A00CC";

const formatHeader = () => {
  const d = new Date();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
};

export default function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState("");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const saved = await getTasks();
        setTasks(saved);
      })();
    }, []),
  );

  const persist = async (updated: Task[]) => {
    setTasks(updated);
    await saveTasks(updated);
  };

  // ── Task actions ──────────────────────────────────────────────

  const addTask = async () => {
    if (!newTaskLabel.trim()) return;
    const d = new Date();
    const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const newTask: Task = {
      id: Date.now().toString(),
      label: newTaskLabel.trim(),
      done: false,
      dateKey,
      subTasks: [],
    };
    await persist([...tasks, newTask]);
    setNewTaskLabel("");
    setModalVisible(false);
  };

  const toggleTask = async (taskId: string) => {
    await persist(
      tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    );
  };

  const addSubTask = async (taskId: string) => {
    const sub: SubTask = {
      id: Date.now().toString(),
      label: "subtask",
      done: false,
      subTasks: [],
    };
    await persist(
      tasks.map((t) =>
        t.id === taskId ? { ...t, subTasks: [...t.subTasks, sub] } : t,
      ),
    );
  };

  const toggleSubTask = async (taskId: string, subId: string) => {
    await persist(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subTasks: t.subTasks.map((s) =>
                s.id === subId ? { ...s, done: !s.done } : s,
              ),
            }
          : t,
      ),
    );
  };

  const updateSubTaskLabel = async (
    taskId: string,
    subId: string,
    label: string,
  ) => {
    await persist(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subTasks: t.subTasks.map((s) =>
                s.id === subId ? { ...s, label } : s,
              ),
            }
          : t,
      ),
    );
  };

  const addSubSubTask = async (taskId: string, subId: string) => {
    const sub: SubSubTask = {
      id: Date.now().toString(),
      label: "sub-subtask",
      done: false,
    };
    await persist(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subTasks: t.subTasks.map((s) =>
                s.id === subId ? { ...s, subTasks: [...s.subTasks, sub] } : s,
              ),
            }
          : t,
      ),
    );
  };

  const toggleSubSubTask = async (
    taskId: string,
    subId: string,
    ssId: string,
  ) => {
    await persist(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subTasks: t.subTasks.map((s) =>
                s.id === subId
                  ? {
                      ...s,
                      subTasks: s.subTasks.map((ss) =>
                        ss.id === ssId ? { ...ss, done: !ss.done } : ss,
                      ),
                    }
                  : s,
              ),
            }
          : t,
      ),
    );
  };

  const updateSubSubTaskLabel = async (
    taskId: string,
    subId: string,
    ssId: string,
    label: string,
  ) => {
    await persist(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subTasks: t.subTasks.map((s) =>
                s.id === subId
                  ? {
                      ...s,
                      subTasks: s.subTasks.map((ss) =>
                        ss.id === ssId ? { ...ss, label } : ss,
                      ),
                    }
                  : s,
              ),
            }
          : t,
      ),
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerPill}>
          <Text style={styles.headerText}>{formatHeader()}</Text>
        </View>
      </View>

      {/* Floating add button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskBlock}>
            {/* Main task row */}
            <View style={styles.taskRow}>
              <TouchableOpacity
                style={[styles.circle, task.done && styles.circleDone]}
                onPress={() => toggleTask(task.id)}
              >
                {task.done && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <Text
                style={[styles.taskLabel, task.done && styles.taskLabelDone]}
              >
                {task.label}
              </Text>

              <TouchableOpacity
                style={styles.plusBtn}
                onPress={() => addSubTask(task.id)}
              >
                <Text style={styles.plusText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Subtasks */}
            {task.subTasks.map((sub) => (
              <View key={sub.id} style={styles.subBlock}>
                <View style={styles.subTaskRow}>
                  <TouchableOpacity
                    style={[styles.subSquare, sub.done && styles.subSquareDone]}
                    onPress={() => toggleSubTask(task.id, sub.id)}
                  >
                    {sub.done && <Text style={styles.subCheckmark}>✓</Text>}
                  </TouchableOpacity>

                  <TextInput
                    style={[styles.subLabel, sub.done && styles.subLabelDone]}
                    value={sub.label}
                    onChangeText={(val) =>
                      updateSubTaskLabel(task.id, sub.id, val)
                    }
                  />

                  <TouchableOpacity
                    style={styles.plusBtn}
                    onPress={() => addSubSubTask(task.id, sub.id)}
                  >
                    <Text style={styles.plusText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Sub-subtasks */}
                {sub.subTasks.map((ss) => (
                  <View key={ss.id} style={styles.subSubRow}>
                    <TouchableOpacity
                      style={[
                        styles.subSubSquare,
                        ss.done && styles.subSquareDone,
                      ]}
                      onPress={() => toggleSubSubTask(task.id, sub.id, ss.id)}
                    >
                      {ss.done && <Text style={styles.subCheckmark}>✓</Text>}
                    </TouchableOpacity>

                    <TextInput
                      style={[
                        styles.subSubLabel,
                        ss.done && styles.subLabelDone,
                      ]}
                      value={ss.label}
                      onChangeText={(val) =>
                        updateSubSubTaskLabel(task.id, sub.id, ss.id, val)
                      }
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        {/* Placeholder if no tasks */}
        {tasks.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              No tasks yet.{"\n"}Tap + to add your first task.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalBg}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Task name"
              placeholderTextColor="#bbb"
              value={newTaskLabel}
              onChangeText={setNewTaskLabel}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={addTask}>
                <Text style={styles.btnSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  headerWrap: { alignItems: "center", paddingTop: 56, paddingBottom: 20 },
  headerPill: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 30,
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  fab: {
    position: "absolute",
    right: 16,
    top: 48,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  fabText: { fontSize: 24, color: "#222", lineHeight: 28 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 80 },

  // Main task
  taskBlock: { marginBottom: 20 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  circleDone: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  checkmark: { color: "#fff", fontSize: 11, fontWeight: "700" },
  taskLabel: { flex: 1, fontSize: 15, color: "#111", fontWeight: "500" },
  taskLabelDone: { color: "#aaa", textDecorationLine: "line-through" },
  plusBtn: { paddingHorizontal: 6 },
  plusText: { fontSize: 18, color: "#aaa", fontWeight: "300" },

  // Subtask
  subBlock: { marginLeft: 32, marginTop: 8 },
  subTaskRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  subSquare: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#bbb",
    alignItems: "center",
    justifyContent: "center",
  },
  subSquareDone: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  subCheckmark: { color: "#fff", fontSize: 8, fontWeight: "700" },
  subLabel: { flex: 1, fontSize: 13, color: "#555", paddingVertical: 2 },
  subLabelDone: { color: "#bbb", textDecorationLine: "line-through" },

  // Sub-subtask
  subSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 22,
    marginTop: 6,
  },
  subSubSquare: {
    width: 11,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  subSubLabel: { flex: 1, fontSize: 12, color: "#777", paddingVertical: 2 },

  // Empty
  emptyWrap: { flex: 1, alignItems: "center", paddingTop: 80 },
  emptyText: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // Modal
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: { backgroundColor: "#fff", borderRadius: 22, padding: 22 },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 14,
    color: "#111",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    color: "#111",
  },
  modalActions: { flexDirection: "row", gap: 10 },
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
