import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalendarEvent } from "../types";

const KEY = "doit_calendar_events";

export async function getEvents(): Promise<CalendarEvent[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveEvent(event: CalendarEvent): Promise<void> {
  const existing = await getEvents();
  const filtered = existing.filter((e) => e.id !== event.id);
  await AsyncStorage.setItem(KEY, JSON.stringify([...filtered, event]));
}

export async function deleteEvent(id: string): Promise<void> {
  const existing = await getEvents();
  const updated = existing.filter((e) => e.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}
