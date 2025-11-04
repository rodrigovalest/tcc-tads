import React from "react";
import useI18n from "../hooks/useI18n";
import WordInput from "./WordInput";
import VoiceInput from "./VoiceInput";

interface UnifiedWordInputProps {
  onSubmitWord: (word: string) => void;
  isGameActive: boolean;
  inputMode: "voice" | "typing";
  language?: string;
  placeholder?: string;
  title?: string;
}

const UnifiedWordInput: React.FC<UnifiedWordInputProps> = ({
  onSubmitWord,
  isGameActive,
  inputMode,
  language = "pt-BR",
  placeholder,
  title,
}) => {
  const { t } = useI18n();

  if (inputMode === "voice") {
    return (
      <VoiceInput
        onSubmitWord={onSubmitWord}
        isGameActive={isGameActive}
        language={language}
        placeholder={placeholder || t("wordBuilder.tapToSpeak")}
        title={title || t("wordBuilder.speakWord")}
      />
    );
  }

  return (
    <WordInput
      onSubmitWord={onSubmitWord}
      isGameActive={isGameActive}
      placeholder={placeholder}
      title={title}
    />
  );
};

export default UnifiedWordInput;
