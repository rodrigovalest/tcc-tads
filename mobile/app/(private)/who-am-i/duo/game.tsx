import { SafeAreaView, Text, View, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import useAuthStore from '../../../../store/auth-store';
import { useRouter } from 'expo-router';
import { RTCView } from 'react-native-webrtc';
import { useEffect, useState } from 'react';
import useWhoAmIDuo from '@/hooks/useWhoAmIDuo';
import useMatchStore from '@/store/match-store';
import CorrectAnswerModal from '../../../../components/CorrectAnswer';
import AdversaryCorrectAnswerModal from '../../../../components/AdversaryCorrectAnswer';

export default function WhoAmI() {
  const { user: loggedUser } = useAuthStore();
  const { buddy, resetMatch } = useMatchStore();
  const router = useRouter();
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showAdversaryCorrect, setShowAdversaryCorrect] = useState(false);
  const [correctAnswerImage, setCorrectAnswerImage] = useState<ImageSourcePropType | null>(null);
  
  const { 
    localStream, 
    remoteStream, 
    start,
    switchAudio,
    switchVideo,
    isMicMuted,
    isVideoMuted,
    endCall,
    myCharacter,
    opponentCharacter,
    generateNewCharacters,
    notifyCorrectAnswer,
    usedCharacters,
    // Mantém compatibilidade
    myCharacterImage,
    opponentCharacterImage,
    generateNewImages,
  } = useWhoAmIDuo(() => {
    router.replace('/(private)/(tabs)/matches');
  }, () => {
    // Debug: verificar os personagens quando o adversário acerta
    console.log("[ADVERSARY_CORRECT] myCharacter:", myCharacter?.name);
    console.log("[ADVERSARY_CORRECT] opponentCharacter:", opponentCharacter?.name);
    console.log("[ADVERSARY_CORRECT] myCharacterImage:", myCharacterImage);
    console.log("[ADVERSARY_CORRECT] opponentCharacterImage:", opponentCharacterImage);
    
  
    const imageToShow = myCharacterImage || myCharacter?.image || null;
    console.log("[ADVERSARY_CORRECT] Imagem que será mostrada:", imageToShow);
    
    setCorrectAnswerImage(imageToShow);
    setShowAdversaryCorrect(true);
    
    // Fecha automaticamente após 1 segundo
    setTimeout(() => {
      setShowAdversaryCorrect(false);
      generateNewCharacters();
    }, 1000);
  });

  useEffect(() => {
    start();

    return () => {
      endCall();
    }
  }, []);

  const onMute = () => {
    switchAudio();
  };

  const onVideoOff = () => {
    switchVideo();
  };

  const onEndCall = () => {
    endCall();
  }

  const handleNailedIt = () => {
    // Debug: verificar os personagens no momento do clique
    console.log("[NAILED_IT] myCharacter:", myCharacter?.name);
    console.log("[NAILED_IT] opponentCharacter:", opponentCharacter?.name);
    console.log("[NAILED_IT] opponentCharacterImage:", opponentCharacterImage);
    console.log("[NAILED_IT] myCharacterImage:", myCharacterImage);
    
    // Captura a imagem que estava sendo adivinhada no momento exato
    // Quando EU acerto, eu estava tentando adivinhar quem o adversário é
    // Então devemos mostrar a imagem do personagem do adversário (opponentCharacterImage)
    const imageToShow = opponentCharacterImage || opponentCharacter?.image || null;
    console.log("[NAILED_IT] Imagem que será mostrada:", imageToShow);
    
    setCorrectAnswerImage(imageToShow);
    setShowCorrectAnswer(true);
    
    notifyCorrectAnswer(); // Notifica o adversário que você acertou
    
    // Fecha automaticamente após 1 segundo
    setTimeout(() => {
      setShowCorrectAnswer(false);
      generateNewCharacters();
    }, 1000);
  };


  return (
    <SafeAreaView className='w-full h-full bg-appBgWhite'>
      <View className="flex-1">
        {/* View à esquerda - Sua câmera */}
        <View className="absolute top-10 left-6 bg-appBgWhite w-40 h-48 rounded-2xl border-appBlack border-2 flex items-center justify-center">
          {localStream && !isVideoMuted ? (
            <View className='h-32 w-32 rounded-2xl border-appBlack border-2 overflow-hidden bg-appBlack'>
              <RTCView
                {...({ streamURL: localStream.toURL(), objectFit: "cover", zOrder: 1 } as any)}
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
        <View className="absolute top-10 right-6 bg-appBgWhite w-40 h-48 rounded-2xl border-appBlack border-2 flex items-center justify-center">
          {remoteStream && !isVideoMuted ? (
            <View className='h-32 w-32 rounded-2xl border-appBlack border-2 overflow-hidden bg-appBlack'>
              <RTCView
                {...({ streamURL: remoteStream.toURL(), objectFit: "cover", zOrder: 1 } as any)}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          ) : (
            <View className='h-32 w-32 rounded-2xl border-appBlack border-2 bg-appBlack flex items-center justify-center'>
              <Text className='text-white text-sm font-nunito-medium'>{buddy!.username}</Text>
            </View>
          )}
          
          <Text className='text-lg font-nunito-semibold text-appBlack mt-2'>
            {buddy!.username}
          </Text>
        </View>

        <View className="absolute bottom-20 left-4 right-4 bg-appBlack rounded-2xl border-appBlack border-2 p-6">
          <View className="flex items-center justify-center">
            <Text className="text-white text-lg font-nunito-bold mb-4">Category:</Text>
            <View className="w-64 h-48 rounded-xl overflow-hidden mb-4 bg-appLightGrey">
              {opponentCharacterImage ? (
                <Image 
                  source={opponentCharacterImage} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-appMediumGrey flex items-center justify-center">
                  <Text className="text-white text-lg font-nunito-bold">Loading...</Text>
                </View>
              )}
            </View>
            <Text className="text-white mb-2 font-nunito-bold">{buddy!.username} is:</Text>
            {opponentCharacter && (
              <Text className="text-yellow-300 mb-4 font-nunito-bold text-center px-4">
                {opponentCharacter.name}
              </Text>
            )}
            <TouchableOpacity
              className="bg-appMediumGrey rounded-full py-4 px-8 mb-3 w-64"
              onPress={handleNailedIt}
            >
              <Text className="text-white font-nunito-bold text-center text-lg">Nailed it</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-appMediumRed rounded-full py-4 px-8 w-64"
              onPress={() => {
                console.log('Give up pressionado - gerando novos personagens');
                generateNewCharacters();
              }}
            >
              <Text className="text-white font-nunito-bold text-center text-lg">Give up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 bg-appBlack px-10 pt-8 pb-10 flex-row justify-between items-center rounded-t-3xl">
        <TouchableOpacity
          style={{ backgroundColor: '#4F4F47', borderRadius: 25, padding: 16 }}
          onPress={onMute}
        >
          <Feather
            name={isMicMuted ? "mic" : "mic-off"}
            size={26}
            color="#FEFBF4"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: '#4F4F47', borderRadius: 25, padding: 16 }}
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

      <CorrectAnswerModal
        visible={showCorrectAnswer}
        correctImage={correctAnswerImage}
      />

      <AdversaryCorrectAnswerModal
        visible={showAdversaryCorrect}
        correctImage={correctAnswerImage}
      />
    </SafeAreaView>
  );
}