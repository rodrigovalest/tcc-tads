jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => mockRouter),
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      data: {
        idToken: "mock-id-token",
        user: {
          id: "mock-user-id",
          email: "test@gmail.com",
          name: "Test User",
          photo: "https://example.com/photo.jpg",
        },
      },
    }),
    signOut: jest.fn().mockResolvedValue(undefined),
    getCurrentUser: jest.fn().mockResolvedValue(null),
    getTokens: jest.fn().mockResolvedValue({
      idToken: "mock-id-token",
      accessToken: "mock-access-token",
    }),
    clearCachedAccessToken: jest.fn().mockResolvedValue(undefined),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: -5,
    IN_PROGRESS: -1,
    PLAY_SERVICES_NOT_AVAILABLE: 2,
    SIGN_IN_REQUIRED: 4,
  },
}));

jest.mock("./services/word-validation", () => ({
  validateWord: jest.fn((word, language) => {
    const validWords = ["cat", "dog", "house", "test", "word"];
    return validWords.includes(word.toLowerCase());
  }),
  generateRandomWord: jest.fn((language) => {
    const words = ["cat", "dog", "house", "test", "word"];
    return words[Math.floor(Math.random() * words.length)];
  }),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  })),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: "SafeAreaView",
}));

jest.mock("react-native-css-interop", () => ({
  cssInterop: (Component) => Component,
}));

jest.mock("react-native-vector-icons/FontAwesome", () => "Icon");
jest.mock("react-native-vector-icons/FontAwesome5", () => "Icon");
jest.mock("react-native-vector-icons/MaterialIcons", () => "Icon");

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

jest.mock("@/assets/images/flags_svg/br.svg", () => ({
  default: () => "BrazilFlag",
}));

jest.mock("@/assets/images/flags_svg/gb.svg", () => ({
  default: () => "UKFlag",
}));

jest.mock("@/assets/images/flags_svg/es.svg", () => ({
  default: () => "SpainFlag",
}));

jest.mock("@/assets/images/calle-dog-icon.png", () => "mock-calle-dog-icon");

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

afterEach(() => {
  jest.clearAllMocks();
  if (global.gc) {
    global.gc();
  }
});
