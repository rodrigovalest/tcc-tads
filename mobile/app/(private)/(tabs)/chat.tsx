import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Pressable,
  PermissionsAndroid,
  Platform,
} from "react-native";
import useI18n from "../../../hooks/useI18n";
import Voice, { SpeechResultsEvent } from "@react-native-voice/voice";

export default function Chat() {
  const { t } = useI18n();

  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");

  function onSpeechResults(value: SpeechResultsEvent) {
    console.log(value);
    if (value.value && value.value.length > 0) {
      setText(value.value[0]);
    }
  }

  async function startListening() {
    try {
      if (Platform.OS === "android") {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );

        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: "Permissão de Microfone",
              message:
                "Este aplicativo precisa de acesso ao seu microfone para o reconhecimento de voz.",
              buttonNeutral: "Pergunte-me depois",
              buttonNegative: "Cancelar",
              buttonPositive: "OK",
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Permissão de microfone negada");
            return;
          }
        }
      }

      if (isListening) {
        await Voice.stop();
        setIsListening(false);
        return;
      } else {
        setText("");
        setIsListening(true);
        await Voice.start("pt-BR");
      }
    } catch (error) {
      console.error("Erro ao iniciar o reconhecimento de voz:", error);
      setIsListening(false);
    }
  }

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = (e) => console.error("onSpeechError: ", e);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return (
    <SafeAreaView className="w-full h-full bg-appBgWhite">
      <Text>{t("navigation.chat")}</Text>
      <View style={styles.container}>
        <View style={styles.header}>
          <TextInput
            style={styles.input}
            placeholder="Pesquisar..."
            value={text}
            onChangeText={setText}
          />

          <Pressable onPress={startListening} style={styles.button}>
            <Text>P</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 52,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    height: 54,
    padding: 16,
    fontSize: 16,
    borderRadius: 12,
    backgroundColor: "#D9E6EB",
  },
  button: {
    height: 54,
    width: 54,
    borderRadius: 12,
    backgroundColor: "#6F4AE5",
    justifyContent: "center",
    alignItems: "center",
  },
});
