import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useTabBarHeight = () => {
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = 135;
  const scrollViewPaddingBottom = TAB_BAR_HEIGHT * 2;
  const totalTabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  return {
    tabBarHeight: TAB_BAR_HEIGHT,
    scrollViewPaddingBottom,
    totalTabBarHeight,
    safeAreaInsets: insets,
  };
};
