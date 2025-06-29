import { SafeAreaView, Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import useAuthStore from '../../../../store/auth-store';
import { useRouter } from 'expo-router';
import useJustChillingDuo from '../../../../hooks/useJustChillingDuo';
import { RTCView } from 'react-native-webrtc';
import { useEffect } from 'react';

// export default function JustChillingDuoGame() {
//   const { user: loggedUser } = useAuthStore();
//   const router = useRouter();
//   const { localStream, remoteStream, start } = useJustChillingDuo();
//   const username = 'username';

//   useEffect(() => {
//     start();
//   }, []);

//   const onMute = () => {}

//   const onVideoOff = () => {}

//   const onEndCall = () => {
//     router.replace('/(private)/(tabs)/matches');
//   }

//   return (
//     <SafeAreaView className='w-full h-full bg-appBgWhite'>
//       {/* <View className='h-full bg-appMediumGrey'></View> */}


//       {remoteStream && (
//           <RTCView
//             streamURL={remoteStream.toURL()}
//             objectFit="cover"
//             className="absolute top-0 left-0 w-full h-full"
//           />
//         )}

//         {localStream && (
//             <RTCView
//               streamURL={localStream.toURL()}
//               objectFit="cover"
//               className="w-full h-full"
//               zOrder={1}
//             />
//           )}


//       {/* <Text 
//         className="absolute top-14 right-6 bg-appBgWhite rounded-3xl py-1 px-4 border-appBlack border-2 flex items-center justify-center text-lg font-nunito-semibold text-appBlack"
//       >
//         { username }
//       </Text>
      
//       <View className="absolute bottom-40 right-6 bg-appBgWhite w-40 h-48 rounded-2xl border-appBlack border-2 flex items-center justify-center">
//         <View className='h-32 w-32 bg-appMediumGrey rounded-2xl border-appBlack border-2 mb-2 overflow-hidden'></View>

//         <Text className='text-lg font-nunito-semibold text-appBlack'>
//           {loggedUser!.username}
//         </Text>
//       </View>

//       <View className="absolute bottom-0 left-0 right-0 bg-appBlack px-10 pt-8 pb-10 flex-row justify-between items-center rounded-t-3xl">
//         <TouchableOpacity className="bg-[#4F4F47] rounded-full p-4">
//           <Feather name="mic-off" size={26} color="#FEFBF4" />
//         </TouchableOpacity>

//         <TouchableOpacity className="bg-[#4F4F47] rounded-full p-4">
//           <Feather name="video-off" size={26} color="#FEFBF4" />
//         </TouchableOpacity>
      
//         <TouchableOpacity className="bg-appMediumRed rounded-full p-4" onPress={onEndCall}>
//           <MaterialIcons name="call-end" size={26} color="#FEFBF4" />
//         </TouchableOpacity>
//       </View> */}
//     </SafeAreaView>
//   );
// }

export default function JustChillingDuoGame() {
  const { localStream, remoteStream, start } = useJustChillingDuo();

  useEffect(() => {
    start();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Local Stream</Text>
      
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.video}
          objectFit="cover"
        />
      )}

      <Text>Remote Stream</Text>
      
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.video}
          objectFit="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  video: { width: '100%', height: 200, backgroundColor: 'black' },
});
