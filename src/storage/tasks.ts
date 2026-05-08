import AsyncStorage from "@react-native-async-storage/async-storage";

export type SubSubTask = {
  id: string;
  label: string;
  done: boolean;
};

export type SubTask = {
  id: string;
  label: string;
  done: boolean;
  subTasks: SubSubTask[];
};

export type Task = {
  id: string;
  label: string;
  done: boolean;
  dateKey: string;
  subTasks: SubTask[];
};

export const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const getStorageKey = (dateKey: string) => `tasks-${dateKey}`;

export async function getTasks(dateKey?: string): Promise<Task[]> {
  const key = getStorageKey(dateKey ?? getTodayKey());
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export async function saveTasks(
  tasks: Task[],
  dateKey?: string,
): Promise<void> {
  const key = getStorageKey(dateKey ?? getTodayKey());
  await AsyncStorage.setItem(key, JSON.stringify(tasks));
}
