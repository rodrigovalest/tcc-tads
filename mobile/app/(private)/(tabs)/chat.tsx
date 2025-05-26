import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

export default function Chat() {
  return (
    <SafeAreaView
      className='w-full h-full bg-appBgWhite'
    >
      <Text>Chat</Text>
    </SafeAreaView>
  );
}
