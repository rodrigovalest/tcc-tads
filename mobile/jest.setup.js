// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  })),
  SafeAreaProvider: ({ children }) => children,
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock("react-native-vector-icons/FontAwesome", () => "Icon");
jest.mock("react-native-vector-icons/FontAwesome5", () => "Icon");
jest.mock("react-native-vector-icons/MaterialIcons", () => "Icon");

// Mock SVG components
jest.mock("react-native-svg", () => ({
  SvgProps: {},
  Svg: "Svg",
  Circle: "Circle",
  Ellipse: "Ellipse",
  G: "G",
  Text: "Text",
  TSpan: "TSpan",
  TextPath: "TextPath",
  Path: "Path",
  Polygon: "Polygon",
  Polyline: "Polyline",
  Line: "Line",
  Rect: "Rect",
  Use: "Use",
  Image: "Image",
  Symbol: "Symbol",
  Defs: "Defs",
  LinearGradient: "LinearGradient",
  RadialGradient: "RadialGradient",
  Stop: "Stop",
  ClipPath: "ClipPath",
  Pattern: "Pattern",
  Mask: "Mask",
}));

// Mock flag SVG files
jest.mock("@/assets/images/flags_svg/br.svg", () => ({
  default: () => "BrazilFlag",
}));

jest.mock("@/assets/images/flags_svg/gb.svg", () => ({
  default: () => "UKFlag",
}));

jest.mock("@/assets/images/flags_svg/es.svg", () => ({
  default: () => "SpainFlag",
}));

// Mock image assets
jest.mock("@/assets/images/calle-dog-icon.png", () => "mock-calle-dog-icon");

// Suppress console warnings for tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});
