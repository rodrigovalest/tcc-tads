import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";
import { PermissionsAndroid, Platform } from "react-native";

export interface VoiceRecognitionConfig {
  language?: string;
  onResult?: (text: string) => void;
  onError?: (error: any) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class VoiceRecognitionService {
  private isListening = false;
  private config: VoiceRecognitionConfig = {};
  private isInitialized = false;

  constructor(config: VoiceRecognitionConfig = {}) {
    this.config = config;
    this.initializeVoice();
  }

  private async initializeVoice() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.setupVoiceListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing voice service:", error);
    }
  }

  private setupVoiceListeners() {
    try {
      if (Voice && typeof Voice.onSpeechResults !== "undefined") {
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
        Voice.onSpeechError = this.onSpeechError.bind(this);
        Voice.onSpeechStart = this.onSpeechStart.bind(this);
        Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
      }
    } catch (error) {
      console.error("Error setting up voice listeners:", error);
    }
  }

  private onSpeechResults(event: SpeechResultsEvent) {
    if (event.value && event.value.length > 0) {
      const recognizedText = event.value[0];
      this.config.onResult?.(recognizedText);
    }
  }

  private onSpeechError(event: SpeechErrorEvent) {
    const errorCode = event.error?.code || event.error?.message || "unknown";

    if (errorCode !== "7" && errorCode !== "7/No match") {
      console.error("Voice recognition error:", event);
    }

    this.isListening = false;
    this.config.onError?.(event);
  }

  private onSpeechStart() {
    this.isListening = true;
    this.config.onStart?.();
  }

  private onSpeechEnd() {
    this.isListening = false;
    this.config.onEnd?.();
  }

  async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      if (hasPermission) {
        return true;
      }

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

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      return false;
    }
  }

  async startListening(language: string = "pt-BR"): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.warn("Voice service not initialized yet");
        return false;
      }

      if (this.isListening) {
        await this.stopListening();
        return false;
      }

      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error("Microphone permission denied");
      }

      await Voice.start(language);
      return true;
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      this.config.onError?.(error);
      return false;
    }
  }

  async stopListening(): Promise<void> {
    try {
      if (this.isListening) {
        await Voice.stop();
      }
    } catch (error) {
      console.error("Error stopping voice recognition:", error);
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  updateConfig(newConfig: VoiceRecognitionConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  destroy() {
    return Voice.destroy().then(Voice.removeAllListeners);
  }
}

export default VoiceRecognitionService;
