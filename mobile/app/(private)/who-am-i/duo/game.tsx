import { SafeAreaView, Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import useAuthStore from '../../../../store/auth-store';
import { useRouter } from 'expo-router';
import { RTCView } from 'react-native-webrtc';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import useWhoAmIDuo from '@/hooks/useWhoAmIDuo';
import useMatchStore from '@/store/match-store';

export default function WhoAmI() {
  const { user: loggedUser } = useAuthStore();
  const { buddy, resetMatch } = useMatchStore();
  const router = useRouter();
  const { 
    localStream, 
    remoteStream, 
    start,
    switchAudio,
    switchVideo,
    isMicMuted,
    isVideoMuted,
    endCall,
    myCharacterImage,
    opponentCharacterImage,
    generateNewImages,
    usedImages,
  } = useWhoAmIDuo(() => {
    router.replace('/(private)/(tabs)/matches');
  });

  useEffect(() => {
    start();

    return () => {
      endCall();
    }
  }, []);

  // Debug: log das imagens
  useEffect(() => {
    console.log("[GAME] myCharacterImage:", myCharacterImage);
    console.log("[GAME] opponentCharacterImage:", opponentCharacterImage);
    console.log("[GAME] usedImages:", usedImages);
  }, [myCharacterImage, opponentCharacterImage, usedImages]);

  const onMute = () => {
    switchAudio();
  };

  const onVideoOff = () => {
    switchVideo();
  };

  const onEndCall = () => {
    endCall();
  }

  return (
    <SafeAreaView className='w-full h-full'>
      <LinearGradient
        colors={['#501E3F', '#49AA8F']} // Gradiente com transição na metade
        locations={[0, 0.7, 1]} // Transição suave, só os extremos são das cores sólidas
        style={StyleSheet.absoluteFillObject} // Aplica o gradiente em toda a área
      >
        {remoteStream && (
          <RTCView
            streamURL={remoteStream.toURL()}
            objectFit="cover"
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <View className="flex-1">
          {/* View à esquerda - Sua câmera */}
          <View className="absolute top-10 left-6 bg-appBgWhite w-40 h-48 rounded-2xl border-appBlack border-2 flex items-center justify-center">
            {localStream && !isVideoMuted ? (
              <View className='h-32 w-32 rounded-2xl border-appBlack border-2 overflow-hidden bg-appBlack'>
                <RTCView
                  streamURL={localStream.toURL()}
                  objectFit="cover"
                  zOrder={1}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>
            ) : (
              <View className='h-32 w-32 rounded-2xl border-appBlack border-2 bg-appBlack flex items-center justify-center'>
                <Text className='text-white text-sm font-nunito-medium'>{loggedUser!.username}</Text>
              </View>
            )}
          </View>

          {/* View à direita - Câmera do oponente */}
          <View
            className="absolute top-10 right-6 w-40 h-48 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.35)',
              // Aparência de vidro: sombra + "borda" clara + fundo translúcido
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 6,
              // Não há suporte nativo a blur/backdropFilter no React Native puro,
              // mas se usar expo-blur, pode-se envolver este View com <BlurView intensity={30} tint="light">...</BlurView>
            }}
          
          >
            {remoteStream ? (
              <View className='h-32 w-32 rounded-2xl border-appBlack border-2 overflow-hidden bg-appBlack'>
                <RTCView
                  streamURL={remoteStream.toURL()}
                  objectFit="cover"
                  zOrder={1}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>
            ) : (
              <View className='h-32 w-32 rounded-2xl border-appBlack border-2 bg-appBlack flex items-center justify-center'>
                <Text className='text-white text-sm font-nunito-medium'>{buddy!.username}</Text>
              </View>
            )}
          </View>

          <View className="absolute left-0 right-0 bottom-0 flex justify-center items-center" style={{ top: 140 }}>
            <View className="bg-[#171717] w-[90%] rounded-2xl border-appBlack border-2 flex items-center justify-center">
              <View className="flex flex-col justify-center items-center w-full py-6">
                <Text className='text-white'>Category:</Text>
                <View className='w-[70vw] h-[35vh] flex items-center justify-center rounded-xl mt-2 mb-2 py-2 overflow-hidden'>
                  {opponentCharacterImage ? (
                    <Image 
                      source={opponentCharacterImage} 
                      className="w-full h-full rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className='bg-[#167940] w-full h-full flex items-center justify-center rounded-xl'>
                      <Text className="text-white text-lg font-nunito-bold">Loading...</Text>
                    </View>
                  )}
                </View>
                <Text className='text-white mb-4'>{buddy!.username} is :</Text>
                <TouchableOpacity
                  className="bg-[#167940] p-4 rounded-full w-[70vw] mb-3"
                  onPress={() => {
                    console.log('Nailed it pressionado - gerando novas imagens');
                    generateNewImages();
                  }}
                >
                  <Text className="text-white font-black text-center text-2xl font-nunito">Nailed it</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-[#BC3636] p-4 rounded-full w-[70vw]"
                  onPress={() => {
                    console.log('Give up pressionado - gerando novas imagens');
                    generateNewImages();
                  }}
                >
                  <Text className="text-white font-black text-center text-2xl font-nunito">Give up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="absolute bottom-0 left-0 right-0 bg-appBlack px-10 pt-8 pb-10 flex-row justify-between items-center rounded-t-3xl">
          <TouchableOpacity
            className="bg-[#4F4F47] rounded-full p-4"
            onPress={onMute}
          >
            <Feather
              name={isMicMuted ? "mic" : "mic-off"}
              size={26}
              color="#FEFBF4"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#4F4F47] rounded-full p-4"
            onPress={onVideoOff}
          >
            <Feather
              name={isVideoMuted ? "video" : "video-off"}
              size={26}
              color="#FEFBF4"
            />
          </TouchableOpacity>

          <TouchableOpacity className="bg-appMediumRed rounded-full p-4" onPress={onEndCall}>
            <MaterialIcons name="call-end" size={26} color="#FEFBF4" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}