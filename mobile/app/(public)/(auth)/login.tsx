import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import LoginForm from "@/components/LoginForm";

export default function Login() {
  return (
    <SafeAreaView className="w-full h-full bg-appBgWhite">
      <LoginForm />
    </SafeAreaView>
  );
}
