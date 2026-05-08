import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
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
  saved?: boolean;
};

const getDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const formatHeader = () => {
  const d = new Date();
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
};

export default function LogScreen() {
  const dateKey = useMemo(() => getDateKey(), []);
  const storageKey = `log-${dateKey}`;

  const [text, setText] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadLog();
  }, []);

  const loadLog = async () => {
    try {
      const raw = await AsyncStorage.getItem(storageKey);

      if (!raw) {
        setText("");
        setMedia([]);
        setSaved(false);
        return;
      }

      const parsed: LogItem = JSON.parse(raw);

      setText(parsed.text ?? "");
      setMedia(parsed.media ?? []);
      setSaved(parsed.saved ?? false);
    } catch (error) {
      console.log("Load log error:", error);
    }
  };

  const saveLog = async () => {
    try {
      const payload: LogItem = {
        dateKey,
        text,
        media,
        saved: true,
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
      setSaved(true);
    } catch (error) {
      console.log("Save log error:", error);
    }
  };

  const handleEdit = () => {
    setSaved(false);
  };

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setMedia((prev) => [...prev, ...uris]);
    }
  };

  if (saved) {
    return (
      <View style={styles.root}>
        <View style={styles.headerWrap}>
          <View style={styles.headerPill}>
            <Text style={styles.headerText}>{formatHeader()}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editFab} onPress={handleEdit}>
          <Text style={styles.editFabIcon}>✎</Text>
        </TouchableOpacity>

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
                  key={`${uri}-${i}`}
                  source={{ uri }}
                  style={[
                    styles.mediaImage,
                    {
                      transform: [
                        {
                          rotate: `${i % 2 === 0 ? -6 : 4}deg`,
                        },
                      ],
                    },
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

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={20}
    >
      <View style={styles.root}>
        <View style={styles.headerWrap}>
          <View style={styles.headerPill}>
            <Text style={styles.headerText}>{formatHeader()}</Text>
          </View>
        </View>

        <View style={styles.fab}>
          <TouchableOpacity style={styles.fabBtn} onPress={pickMedia}>
            <Text style={styles.fabIcon}>🖼</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {media.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.mediaStrip}
            >
              {media.map((uri, i) => (
                <Image
                  key={`${uri}-${i}`}
                  source={{ uri }}
                  style={[
                    styles.mediaImage,
                    {
                      transform: [
                        {
                          rotate: `${i % 2 === 0 ? -6 : 4}deg`,
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </ScrollView>
          )}

          <TextInput
            multiline
            scrollEnabled
            value={text}
            onChangeText={setText}
            placeholder="Write your thoughts..."
            placeholderTextColor="#aaa"
            style={styles.textInput}
          />
        </ScrollView>

        <TouchableOpacity style={styles.saveBtn} onPress={saveLog}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },

  root: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  headerWrap: {
    alignItems: "center",
    marginBottom: 24,
  },

  headerPill: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },

  headerText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
  },

  fab: {
    position: "absolute",
    right: 16,
    top: 90,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 10,
    zIndex: 20,
    elevation: 4,
  },

  fabBtn: {
    alignItems: "center",
    justifyContent: "center",
  },

  fabIcon: {
    fontSize: 22,
  },

  editFab: {
    position: "absolute",
    right: 16,
    top: 90,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 14,
    zIndex: 20,
    elevation: 4,
  },

  editFabIcon: {
    fontSize: 20,
    color: PRIMARY,
  },

  scrollContent: {
    paddingBottom: 140,
  },

  mediaStrip: {
    marginBottom: 32,
  },

  mediaImage: {
    width: 160,
    height: 224,
    borderRadius: 16,
    marginRight: -20,
  },

  textInput: {
    color: PRIMARY,
    fontSize: 22,
    lineHeight: 36,
    minHeight: 500,
    textAlignVertical: "top",
    paddingBottom: 200,
    fontFamily: "Poppins_400Regular",
  },

  readOnlyText: {
    color: PRIMARY,
    fontSize: 22,
    lineHeight: 36,
    paddingBottom: 100,
    fontFamily: "Poppins_400Regular",
  },

  saveBtn: {
    position: "absolute",
    bottom: 24,
    left: 24,
    backgroundColor: PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },

  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
});
