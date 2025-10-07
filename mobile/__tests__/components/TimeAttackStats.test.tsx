import React from "react";
import { render, screen } from "@testing-library/react-native";
import TimeAttackStats from "../../components/TimeAttackStats";

// Mock useI18n hook
const mockT = jest.fn((key: string) => {
  const translations: { [key: string]: string } = {
    "timeAttackVocab.streak": "Streak",
    "timeAttackVocab.bestStreak": "Best Streak",
    "timeAttackVocab.correct": "Correct",
    "timeAttackVocab.incorrect": "Incorrect",
    "timeAttackVocab.accuracy": "Accuracy",
  };
  return translations[key] || key;
});

jest.mock("../../hooks/useI18n", () => ({
  __esModule: true,
  default: () => ({
    t: mockT,
  }),
}));

describe("TimeAttackStats", () => {
  const defaultProps = {
    score: 150,
    streak: 5,
    bestStreak: 8,
    correctAnswers: 12,
    incorrectAnswers: 3,
    totalAnswers: 15,
    timeLeft: 45.5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all stats correctly", () => {
      render(<TimeAttackStats {...defaultProps} />);

      expect(screen.getByText("150")).toBeTruthy(); // Score
      expect(screen.getByText("5")).toBeTruthy(); // Streak
      expect(screen.getByText("8")).toBeTruthy(); // Best Streak
      expect(screen.getByText("12")).toBeTruthy(); // Correct answers
      expect(screen.getByText("00:45:50")).toBeTruthy(); // Time in MM:SS:CS format
      expect(screen.getByText("Streak")).toBeTruthy();
      expect(screen.getByText("Best Streak")).toBeTruthy();
      expect(screen.getByText("Correct")).toBeTruthy();
    });

    it("should format time with centisecond precision", () => {
      render(<TimeAttackStats {...defaultProps} timeLeft={59.123} />);

      expect(screen.getByText("00:59:12")).toBeTruthy(); // 59.123s = 59s and 12cs
    });

    it("should show time correctly for 30 seconds", () => {
      render(<TimeAttackStats {...defaultProps} timeLeft={30.0} />);

      expect(screen.getByText("00:30:00")).toBeTruthy();
    });

    it("should handle zero values", () => {
      render(
        <TimeAttackStats
          {...defaultProps}
          score={0}
          streak={0}
          bestStreak={0}
          correctAnswers={0}
          incorrectAnswers={0}
          totalAnswers={0}
          timeLeft={0}
        />
      );

      expect(screen.getAllByText("0")).toHaveLength(5); // Score, streak, bestStreak, correct, incorrect
      expect(screen.getByText("00:00:00")).toBeTruthy(); // Time
    });

    it("should display negative time as 0", () => {
      render(<TimeAttackStats {...defaultProps} timeLeft={-5} />);

      expect(screen.getByText("00:00:00")).toBeTruthy();
    });
  });

  describe("Time formatting", () => {
    it("should format time above 60 seconds correctly", () => {
      render(<TimeAttackStats {...defaultProps} timeLeft={75.5} />);

      expect(screen.getByText("01:15:50")).toBeTruthy(); // 75.5s = 1m 15s 50cs
    });

    it("should format time with centiseconds", () => {
      render(<TimeAttackStats {...defaultProps} timeLeft={15.678} />);

      expect(screen.getByText("00:15:67")).toBeTruthy(); // 15.678s = 15s 67cs
    });

    it("should format time at exactly 1 second", () => {
      render(<TimeAttackStats {...defaultProps} timeLeft={1.0} />);

      expect(screen.getByText("00:01:00")).toBeTruthy();
    });

    it("should format time below 1 second", () => {
      render(<TimeAttackStats {...defaultProps} timeLeft={0.5} />);

      expect(screen.getByText("00:00:50")).toBeTruthy(); // 0.5s = 50cs
    });

    it("should format very small time values", () => {
      render(<TimeAttackStats {...defaultProps} timeLeft={0.123} />);

      expect(screen.getByText("00:00:12")).toBeTruthy(); // 0.123s = 12cs
    });
  });

  describe("Score display", () => {
    it("should display large scores correctly", () => {
      render(<TimeAttackStats {...defaultProps} score={9999} />);

      expect(screen.getByText("9999")).toBeTruthy();
    });

    it("should display zero score", () => {
      render(<TimeAttackStats {...defaultProps} score={0} />);

      expect(screen.getByText("0")).toBeTruthy();
    });
  });

  describe("Streak display", () => {
    it("should display high streaks correctly", () => {
      render(<TimeAttackStats {...defaultProps} streak={25} />);

      expect(screen.getByText("25")).toBeTruthy();
    });

    it("should display zero streak", () => {
      render(<TimeAttackStats {...defaultProps} streak={0} />);

      expect(screen.getByText("0")).toBeTruthy();
    });
  });

  describe("Correct answers display", () => {
    it("should display high correct answer counts", () => {
      render(<TimeAttackStats {...defaultProps} correctAnswers={100} />);

      expect(screen.getByText("100")).toBeTruthy();
    });

    it("should display zero correct answers", () => {
      render(<TimeAttackStats {...defaultProps} correctAnswers={0} />);

      expect(screen.getByText("0")).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for stats", () => {
      render(<TimeAttackStats {...defaultProps} />);

      // Test that all stat labels are present
      expect(screen.getByText("Streak")).toBeTruthy();
      expect(screen.getByText("Best Streak")).toBeTruthy();
      expect(screen.getByText("Correct")).toBeTruthy();
      expect(screen.getByText("Incorrect")).toBeTruthy();
    });
  });
});
