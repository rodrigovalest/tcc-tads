import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

export default function Waiting() {
  return (
    <SafeAreaView
      className='w-full h-full bg-appBgWhite'
    >
      <Text>Waiting</Text>
    </SafeAreaView>
  );
}
