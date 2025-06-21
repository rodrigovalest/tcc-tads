import { SafeAreaView, Text, View, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import useAuthStore from '../../../store/auth-store';
import { useRouter } from 'expo-router';

export default function JustChillingGame() {
  const { user: loggedUser } = useAuthStore();
  const router = useRouter();
  
  const username = 'username';

  const onMute = () => {}

  const onVideoOff = () => {}

  const onEndCall = () => {
    router.replace('/(private)/(tabs)/matches');
  }

  return (
    <SafeAreaView className='w-full h-full bg-appBgWhite'>
      <View className='h-full bg-appMediumGrey'></View>

      <Text 
        className="absolute top-14 right-6 bg-appBgWhite rounded-3xl py-1 px-4 border-appBlack border-2 flex items-center justify-center text-lg font-nunito-semibold text-appBlack"
      >
        { username }
      </Text>
      
      <View className="absolute bottom-40 right-6 bg-appBgWhite w-40 h-48 rounded-2xl border-appBlack border-2 flex items-center justify-center">
        <View className='h-32 w-32 bg-appMediumGrey rounded-2xl border-appBlack border-2 mb-2'></View>

        <Text className='text-lg font-nunito-semibold text-appBlack'>
          { loggedUser!.username }
        </Text>
      </View>

      <View className="absolute bottom-0 left-0 right-0 bg-appBlack px-10 pt-8 pb-10 flex-row justify-between items-center rounded-t-3xl">
        <TouchableOpacity className="bg-[#4F4F47] rounded-full p-4">
          <Feather name="mic-off" size={26} color="#FEFBF4" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-[#4F4F47] rounded-full p-4">
          <Feather name="video-off" size={26} color="#FEFBF4" />
        </TouchableOpacity>
      
        <TouchableOpacity className="bg-appMediumRed rounded-full p-4" onPress={onEndCall}>
          <MaterialIcons name="call-end" size={26} color="#FEFBF4" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
