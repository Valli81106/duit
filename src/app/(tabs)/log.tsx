import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY = "#1A00CC";

type LogItem = {
  dateKey: string;
  text: string;
  media: string[];
};

const getDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const formatHeader = () => {
  const d = new Date();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
};

export default function LogScreen() {
  const dateKey = useMemo(() => getDateKey(), []);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const storageKey = `log-${dateKey}`;

  useEffect(() => {
    loadLog();
  }, []);

  const loadLog = async () => {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return;
    const parsed: LogItem & { saved?: boolean } = JSON.parse(raw);
    setText(parsed.text);
    setMedia(parsed.media);
    if (parsed.saved) setSaved(true);
  };

  const saveLog = async () => {
    const payload = { dateKey, text, media, saved: true };
    await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
    setSaved(true);
  };

  const handleEdit = () => setSaved(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setMedia((prev) => [...prev, ...uris]);
    }
  };

  // ── READ-ONLY VIEW ──────────────────────────────────────────
  if (saved) {
    return (
      <View style={styles.root}>
        <View style={styles.headerWrap}>
          <View style={styles.headerPill}>
            <Text style={styles.headerText}>{formatHeader()}</Text>
          </View>
          <Text style={styles.headerSub}>1% better every day</Text>
        </View>

        {/* Edit button */}
        <TouchableOpacity style={styles.editFab} onPress={handleEdit}>
          <Text style={styles.editFabIcon}>✎</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {media.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.mediaStrip}
            >
              {media.map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={[
                    styles.mediaImage,
                    { transform: [{ rotate: `${i % 2 === 0 ? -6 : 4}deg` }] },
                  ]}
                />
              ))}
            </ScrollView>
          )}

          <Text style={styles.readOnlyText}>
            {text || "Nothing written yet."}
          </Text>
        </ScrollView>
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
        <Text style={styles.headerSub}>1% better every day</Text>
      </View>

      {/* FAB actions */}
      <View style={styles.fab}>
        <TouchableOpacity style={styles.fabBtn} onPress={handleEdit}>
          <Text style={styles.fabIconPrimary}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabBtn} onPress={pickMedia}>
          <Text style={styles.fabIcon}>⎑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {media.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mediaStrip}
          >
            {media.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={[
                  styles.mediaImage,
                  { transform: [{ rotate: `${i % 2 === 0 ? -6 : 4}deg` }] },
                ]}
              />
            ))}
          </ScrollView>
        )}

        <TextInput
          multiline
          placeholder="Write your thoughts..."
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={setText}
          style={styles.textInput}
        />
      </ScrollView>

      {/* Save button */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveLog}>
        <Text style={styles.saveBtnText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  headerWrap: { alignItems: "center", marginBottom: 24 },
  headerPill: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  headerSub: { color: "#ccc", marginTop: 8, fontSize: 13 },

  fab: {
    position: "absolute",
    right: 16,
    top: 80,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 20,
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  fabBtn: { alignItems: "center", justifyContent: "center" },
  fabIconPrimary: { fontSize: 20, color: PRIMARY },
  fabIcon: { fontSize: 20, color: "#222" },

  editFab: {
    position: "absolute",
    right: 16,
    top: 80,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 10,
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  editFabIcon: { fontSize: 20, color: PRIMARY },

  scrollContent: { paddingBottom: 100 },
  mediaStrip: { marginBottom: 32 },
  mediaImage: { width: 160, height: 224, borderRadius: 16, marginRight: -20 },

  textInput: {
    color: PRIMARY,
    fontSize: 22,
    lineHeight: 36,
    minHeight: 250,
    textAlignVertical: "top",
  },

  readOnlyText: {
    color: PRIMARY,
    fontSize: 22,
    lineHeight: 36,
    paddingBottom: 80,
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
});
