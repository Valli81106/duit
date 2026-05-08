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
  const [saved, setSaved] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState("");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const savedTasks = await getTasks();
        setTasks(savedTasks);
      })();
    }, []),
  );

  const persist = async (updated: Task[]) => {
    setTasks(updated);
    await saveTasks(updated);
  };

  const handleSave = async () => {
    await saveTasks(tasks);
    setSaved(true);
  };

  const handleEdit = () => setSaved(false);

  // ── Task mutations ─────────────────────────────────────────

  const addTask = async () => {
    if (!newTaskLabel.trim()) return;
    const d = new Date();
    const newTask: Task = {
      id: Date.now().toString(),
      label: newTaskLabel.trim(),
      done: false,
      dateKey: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      subTasks: [],
    };
    await persist([...tasks, newTask]);
    setNewTaskLabel("");
    setModalVisible(false);
  };

  const toggleTask = async (id: string) =>
    persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

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

  const toggleSubTask = async (taskId: string, subId: string) =>
    persist(
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

  const updateSubTaskLabel = async (
    taskId: string,
    subId: string,
    label: string,
  ) =>
    persist(
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

  const addSubSubTask = async (taskId: string, subId: string) => {
    const ss: SubSubTask = {
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
                s.id === subId ? { ...s, subTasks: [...s.subTasks, ss] } : s,
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
  ) =>
    persist(
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

  const updateSubSubLabel = async (
    taskId: string,
    subId: string,
    ssId: string,
    label: string,
  ) =>
    persist(
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

  // ── READ-ONLY VIEW ──────────────────────────────────────────
  if (saved) {
    return (
      <View style={styles.root}>
        <View style={styles.headerWrap}>
          <View style={styles.headerPill}>
            <Text style={styles.headerText}>{formatHeader()}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskBlock}>
              <TouchableOpacity
                style={styles.taskRow}
                onPress={() => toggleTask(task.id)}
              >
                <View style={[styles.circle, task.done && styles.circleDone]}>
                  {task.done && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text
                  style={[styles.taskLabel, task.done && styles.taskLabelDone]}
                >
                  {task.label}
                </Text>
              </TouchableOpacity>

              {task.subTasks.map((sub) => (
                <View key={sub.id} style={styles.subBlock}>
                  <TouchableOpacity
                    style={styles.subTaskRow}
                    onPress={() => toggleSubTask(task.id, sub.id)}
                  >
                    <View
                      style={[
                        styles.subSquare,
                        sub.done && styles.subSquareDone,
                      ]}
                    >
                      {sub.done && <Text style={styles.subCheckmark}>✓</Text>}
                    </View>
                    <Text
                      style={[styles.subLabel, sub.done && styles.subLabelDone]}
                    >
                      {sub.label}
                    </Text>
                  </TouchableOpacity>

                  {sub.subTasks.map((ss) => (
                    <TouchableOpacity
                      key={ss.id}
                      style={styles.subSubRow}
                      onPress={() => toggleSubSubTask(task.id, sub.id, ss.id)}
                    >
                      <View
                        style={[
                          styles.subSubSquare,
                          ss.done && styles.subSquareDone,
                        ]}
                      >
                        {ss.done && <Text style={styles.subCheckmark}>✓</Text>}
                      </View>
                      <Text
                        style={[
                          styles.subSubLabel,
                          ss.done && styles.subLabelDone,
                        ]}
                      >
                        {ss.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Edit button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleEdit}>
          <Text style={styles.saveBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── EDIT VIEW ───────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <View style={styles.headerWrap}>
        <View style={styles.headerPill}>
          <Text style={styles.headerText}>{formatHeader()}</Text>
        </View>
      </View>

      {/* FAB */}
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
                        updateSubSubLabel(task.id, sub.id, ss.id, val)
                      }
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        {tasks.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              No tasks yet.{"\n"}Tap + to add your first task.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Save button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save</Text>
      </TouchableOpacity>

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
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 100 },

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

  emptyWrap: { flex: 1, alignItems: "center", paddingTop: 80 },
  emptyText: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  saveBtn: {
    position: "absolute",
    bottom: 24,
    left: 24,
    backgroundColor: PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

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
