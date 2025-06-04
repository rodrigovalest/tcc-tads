import { renderHook } from "@testing-library/react-native";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(),
}));

const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;

describe("useTabBarHeight", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return correct tab bar calculations with default insets", () => {
    const mockInsets = {
      top: 44,
      bottom: 34,
      left: 0,
      right: 0,
    };
    mockedUseSafeAreaInsets.mockReturnValue(mockInsets);

    const { result } = renderHook(() => useTabBarHeight());

    expect(result.current.tabBarHeight).toBe(135);
    expect(result.current.scrollViewPaddingBottom).toBe(270); // 135 * 2
    expect(result.current.totalTabBarHeight).toBe(169); // 135 + 34
    expect(result.current.safeAreaInsets).toEqual(mockInsets);
  });

  it("should calculate correct values with different bottom inset", () => {
    const mockInsets = {
      top: 50,
      bottom: 20,
      left: 0,
      right: 0,
    };
    mockedUseSafeAreaInsets.mockReturnValue(mockInsets);

    const { result } = renderHook(() => useTabBarHeight());

    expect(result.current.tabBarHeight).toBe(135);
    expect(result.current.scrollViewPaddingBottom).toBe(270);
    expect(result.current.totalTabBarHeight).toBe(155); // 135 + 20
    expect(result.current.safeAreaInsets).toEqual(mockInsets);
  });

  it("should handle zero bottom inset", () => {
    const mockInsets = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
    mockedUseSafeAreaInsets.mockReturnValue(mockInsets);

    const { result } = renderHook(() => useTabBarHeight());

    expect(result.current.tabBarHeight).toBe(135);
    expect(result.current.scrollViewPaddingBottom).toBe(270);
    expect(result.current.totalTabBarHeight).toBe(135); // 135 + 0
    expect(result.current.safeAreaInsets).toEqual(mockInsets);
  });

  it("should maintain consistent tab bar height regardless of insets", () => {
    const insetVariations = [
      { top: 44, bottom: 34, left: 0, right: 0 },
      { top: 50, bottom: 20, left: 0, right: 0 },
      { top: 0, bottom: 50, left: 0, right: 0 },
    ];

    insetVariations.forEach((insets) => {
      mockedUseSafeAreaInsets.mockReturnValue(insets);
      const { result } = renderHook(() => useTabBarHeight());

      expect(result.current.tabBarHeight).toBe(135);
      expect(result.current.scrollViewPaddingBottom).toBe(270);
    });
  });

  it("should return safe area insets object", () => {
    const mockInsets = {
      top: 25,
      bottom: 15,
      left: 5,
      right: 10,
    };
    mockedUseSafeAreaInsets.mockReturnValue(mockInsets);

    const { result } = renderHook(() => useTabBarHeight());

    expect(result.current.safeAreaInsets).toBe(mockInsets);
    expect(result.current.safeAreaInsets.top).toBe(25);
    expect(result.current.safeAreaInsets.bottom).toBe(15);
    expect(result.current.safeAreaInsets.left).toBe(5);
    expect(result.current.safeAreaInsets.right).toBe(10);
  });
});
