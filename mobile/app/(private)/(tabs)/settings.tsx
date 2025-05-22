import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

export default function Settings() {
  return (
    <SafeAreaView
      className='w-full h-full bg-appBgWhite'
    >
      <Text>Settings</Text>
    </SafeAreaView>
  );
}
