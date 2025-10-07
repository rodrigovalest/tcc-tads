import translationService from "../../services/translation-service";
import { MatchLanguage } from "../../models/types/match-language.type";

describe("TranslationService", () => {
  describe("getRandomWord", () => {
    it("should return a string word for English", () => {
      const word = translationService.getRandomWord("en");
      expect(typeof word).toBe("string");
      expect(word.length).toBeGreaterThan(0);
    });

    it("should return a string word for Portuguese", () => {
      const word = translationService.getRandomWord("pt");
      expect(typeof word).toBe("string");
      expect(word.length).toBeGreaterThan(0);
    });

    it("should return a string word for Spanish", () => {
      const word = translationService.getRandomWord("es");
      expect(typeof word).toBe("string");
      expect(word.length).toBeGreaterThan(0);
    });

    it("should return different words on multiple calls", () => {
      const words = new Set();

      // Generate multiple words and ensure we get variety
      for (let i = 0; i < 20; i++) {
        const word = translationService.getRandomWord("en");
        words.add(word);
      }

      // Should have multiple unique words (allowing for some randomness)
      expect(words.size).toBeGreaterThan(5);
    });
  });

  describe("getTranslation", () => {
    it("should translate English to Portuguese", () => {
      const translation = translationService.getTranslation(
        "hello",
        "en",
        "pt"
      );
      expect(translation).toBe("olá");
    });

    it("should translate English to Spanish", () => {
      const translation = translationService.getTranslation(
        "hello",
        "en",
        "es"
      );
      expect(translation).toBe("hola");
    });

    it("should translate Portuguese to English", () => {
      const translation = translationService.getTranslation("olá", "pt", "en");
      expect(translation).toBe("hello");
    });

    it("should translate Portuguese to Spanish", () => {
      const translation = translationService.getTranslation("olá", "pt", "es");
      expect(translation).toBe("hola");
    });

    it("should translate Spanish to English", () => {
      const translation = translationService.getTranslation("hola", "es", "en");
      expect(translation).toBe("hello");
    });

    it("should translate Spanish to Portuguese", () => {
      const translation = translationService.getTranslation("hola", "es", "pt");
      expect(translation).toBe("olá");
    });

    it("should return null for unknown words", () => {
      const translation = translationService.getTranslation(
        "unknownword123",
        "en",
        "pt"
      );
      expect(translation).toBeNull();
    });

    it("should return null for same language translation", () => {
      const translation = translationService.getTranslation(
        "hello",
        "en",
        "en"
      );
      expect(translation).toBeNull();
    });

    it("should handle case insensitive words", () => {
      const translation1 = translationService.getTranslation(
        "HELLO",
        "en",
        "pt"
      );
      const translation2 = translationService.getTranslation(
        "hello",
        "en",
        "pt"
      );
      expect(translation1).toBe(translation2);
    });
  });

  describe("validateTranslation", () => {
    it("should validate correct translations", () => {
      const isValid = translationService.validateTranslation(
        "hello",
        "olá",
        "en",
        "pt"
      );
      expect(isValid).toBe(true);
    });

    it("should reject incorrect translations", () => {
      const isValid = translationService.validateTranslation(
        "hello",
        "wronganswer",
        "en",
        "pt"
      );
      expect(isValid).toBe(false);
    });

    it("should be case insensitive for validation", () => {
      const isValid1 = translationService.validateTranslation(
        "hello",
        "OLÁ",
        "en",
        "pt"
      );
      const isValid2 = translationService.validateTranslation(
        "hello",
        "olá",
        "en",
        "pt"
      );
      const isValid3 = translationService.validateTranslation(
        "hello",
        "Olá",
        "en",
        "pt"
      );

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
      expect(isValid3).toBe(true);
    });

    it("should handle whitespace in validation", () => {
      const isValid1 = translationService.validateTranslation(
        "hello",
        " olá ",
        "en",
        "pt"
      );
      const isValid2 = translationService.validateTranslation(
        "hello",
        "olá",
        "en",
        "pt"
      );

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });

    it("should validate multiple possible translations if available", () => {
      // Test if service supports multiple valid translations for same word
      const word = "good";
      const translation1 = translationService.getTranslation(word, "en", "pt");

      if (translation1) {
        const isValid = translationService.validateTranslation(
          word,
          translation1,
          "en",
          "pt"
        );
        expect(isValid).toBe(true);
      }
    });

    it("should validate all supported language pairs", () => {
      const languages: MatchLanguage[] = ["en", "pt", "es"];

      languages.forEach((fromLang) => {
        languages.forEach((toLang) => {
          if (fromLang !== toLang) {
            const word = translationService.getRandomWord(fromLang);
            const translation = translationService.getTranslation(
              word,
              fromLang,
              toLang
            );

            if (translation) {
              const isValid = translationService.validateTranslation(
                word,
                translation,
                fromLang,
                toLang
              );
              expect(isValid).toBe(true);
            }
          }
        });
      });
    });
  });

  describe("Dictionary consistency", () => {
    it("should have consistent translations between languages", () => {
      // Test round-trip translations when possible
      const word = "hello";
      const ptTranslation = translationService.getTranslation(word, "en", "pt");
      const esTranslation = translationService.getTranslation(word, "en", "es");

      if (ptTranslation && esTranslation) {
        // Check if we can translate back
        const backToEnglish1 = translationService.getTranslation(
          ptTranslation,
          "pt",
          "en"
        );
        const backToEnglish2 = translationService.getTranslation(
          esTranslation,
          "es",
          "en"
        );

        // If round-trip is available, should be consistent
        if (backToEnglish1) {
          expect(backToEnglish1.toLowerCase()).toBe(word.toLowerCase());
        }
        if (backToEnglish2) {
          expect(backToEnglish2.toLowerCase()).toBe(word.toLowerCase());
        }
      }
    });

    it("should have words available in all supported languages", () => {
      const languages: MatchLanguage[] = ["en", "pt", "es"];

      languages.forEach((lang) => {
        const word = translationService.getRandomWord(lang);
        expect(word).toBeTruthy();
        expect(typeof word).toBe("string");
        expect(word.length).toBeGreaterThan(0);
      });
    });

    it("should maintain dictionary size consistency", () => {
      const enWords = new Set();
      const ptWords = new Set();
      const esWords = new Set();

      // Sample multiple words from each language
      for (let i = 0; i < 50; i++) {
        enWords.add(translationService.getRandomWord("en"));
        ptWords.add(translationService.getRandomWord("pt"));
        esWords.add(translationService.getRandomWord("es"));
      }

      // Each language should have reasonable word variety
      expect(enWords.size).toBeGreaterThan(10);
      expect(ptWords.size).toBeGreaterThan(10);
      expect(esWords.size).toBeGreaterThan(10);
    });
  });
});
