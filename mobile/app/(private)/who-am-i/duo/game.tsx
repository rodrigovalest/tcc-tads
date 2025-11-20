import { SafeAreaView, Text, View, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../../../store/auth-store';
import { useRouter } from 'expo-router';
import { RTCView } from 'react-native-webrtc';
import { useEffect, useState, useRef } from 'react';
import useWhoAmIDuo from '../../../../hooks/useWhoAmIDuo';
import useMatchStore from '../../../../store/match-store';
import CorrectAnswerModal from '../../../../components/CorrectAnswer';
import AdversaryCorrectAnswerModal from '../../../../components/AdversaryCorrectAnswer';
import { COLORS } from '../../../../constants/colors';

const TIMER_DURATION = 120; 



export default function WhoAmI() {
  const { user: loggedUser } = useAuthStore();
  const { buddy, resetMatch } = useMatchStore();
  const router = useRouter();
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showAdversaryCorrect, setShowAdversaryCorrect] = useState(false);
  const [correctAnswerImage, setCorrectAnswerImage] = useState<ImageSourcePropType | null>(null);
  const [adversaryCorrectImage, setAdversaryCorrectImage] = useState<ImageSourcePropType | null>(null);
  const [correctAnswerCharacterName, setCorrectAnswerCharacterName] = useState<string | null>(null);
  const [adversaryCorrectCharacterName, setAdversaryCorrectCharacterName] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const characterImageRef = useRef<ImageSourcePropType | null>(null);
  const characterNameRef = useRef<string | null>(null);
  
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
    generateNewCharacter,
    notifyCorrectAnswer,
    usedCharacters,
    myCharacterImage,
    opponentCharacterImage,
    generateNewImages,
    isImageRole,
    switchRoles,
    myCharacterHints,
    opponentCharacterHints,
  } = useWhoAmIDuo(() => {
    router.replace("/(private)/match-rate-duo");
  }, () => {
   
    const imageToShow = characterImageRef.current || myCharacterImage || myCharacter?.image || opponentCharacterImage || opponentCharacter?.image || null;
    const characterNameToShow = characterNameRef.current || myCharacter?.name || opponentCharacter?.name || null;
    console.log("[ADVERSARY_CORRECT] Imagem que será mostrada:", imageToShow);
    console.log("[ADVERSARY_CORRECT] Nome do personagem:", characterNameToShow);
    console.log("[ADVERSARY_CORRECT] characterImageRef.current:", characterImageRef.current);
    console.log("[ADVERSARY_CORRECT] characterNameRef.current:", characterNameRef.current);
    console.log("[ADVERSARY_CORRECT] myCharacter:", myCharacter?.name);
    console.log("[ADVERSARY_CORRECT] myCharacterImage:", myCharacterImage);
    console.log("[ADVERSARY_CORRECT] opponentCharacterImage:", opponentCharacterImage);
  
    setAdversaryCorrectImage(imageToShow);
    setAdversaryCorrectCharacterName(characterNameToShow);
    setShowAdversaryCorrect(true);
    
    setTimeout(() => {
      setShowAdversaryCorrect(false);
      // Não chama generateNewCharacter aqui - o outro jogador que acertou vai fazer isso
    }, 1000);
  });

  const formatTime = (seconds: number): string => {
    const positiveSeconds = Math.max(0, seconds);
    const minutes = Math.floor(positiveSeconds / 60);
    const secs = Math.floor(positiveSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    start();

    // Inicia o timer
    const currentTime = Date.now();
    endTimeRef.current = currentTime + TIMER_DURATION * 1000;
    setTimeLeft(TIMER_DURATION);

    timerRef.current = setInterval(() => {
      const remainingMs = endTimeRef.current - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        handleNailedIt(); // chama ao zerar
        return;
      }
      const timeLeftSeconds = Math.max(0, remainingMs / 1000);
      setTimeLeft(timeLeftSeconds);
    }, 100);

    return () => {
      endCall();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  // Debug: monitora mudanças no personagem e papel
  useEffect(() => {
    console.log("[GAME] myCharacter mudou:", myCharacter?.name);
    console.log("[GAME] myCharacter hints:", myCharacter?.hints?.length || 0);
    console.log("[GAME] isImageRole:", isImageRole);
    console.log("[GAME] should show hints:", !isImageRole && myCharacter && myCharacter.hints?.length > 0);
    
    const currentImage = myCharacterImage || myCharacter?.image || opponentCharacterImage || opponentCharacter?.image || null;
    const currentName = myCharacter?.name || opponentCharacter?.name || null;
    characterImageRef.current = currentImage;
    characterNameRef.current = currentName;
  }, [myCharacter, myCharacterImage, opponentCharacter, opponentCharacterImage, isImageRole]);

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
    console.log("[NAILED_IT] isImageRole:", isImageRole);
    console.log("[NAILED_IT] myCharacter hints:", myCharacter?.hints);

    // Mostra a imagem do personagem atual (que ambos estão tentando adivinhar)
    const imageToShow = myCharacterImage || myCharacter?.image || opponentCharacterImage || opponentCharacter?.image || null;
    const characterNameToShow = myCharacter?.name || opponentCharacter?.name || null;
    console.log("[NAILED_IT] Imagem que será mostrada:", imageToShow);
    console.log("[NAILED_IT] Nome do personagem:", characterNameToShow);

    setCorrectAnswerImage(imageToShow);
    setCorrectAnswerCharacterName(characterNameToShow);
    setShowCorrectAnswer(true);

    notifyCorrectAnswer(); 

    // Reseta o timer (inicia novamente do valor total)
    const currentTime = Date.now();
    endTimeRef.current = currentTime + TIMER_DURATION * 1000;
    setTimeLeft(TIMER_DURATION);

    
    setTimeout(() => {
      setShowCorrectAnswer(false);
      generateNewCharacter();
    }, 1000);
  };


  return (
    <SafeAreaView className='w-full h-full'>
      <LinearGradient
        colors={['#501E3F', '#49AA8F']}
        style={StyleSheet.absoluteFillObject}
      >
      <View className="flex-1">
        {/* View à esquerda - Sua câmera */}
        <View className="absolute top-10 left-6 w-40 h-48 rounded-2xl border-appBlack border-2 flex items-center justify-center" style={{ backgroundColor: '#191919' }}>
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
        <View className="absolute top-10 right-6 w-40 h-48 rounded-2xl border-appBlack border-2 flex items-center justify-center" style={{ backgroundColor: '#191919' }}>
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

        <View className='timer absolute left-0 right-0 flex items-center justify-center z-10'
          style={{ bottom: '65%', top: undefined }}>
          <View className="bg-appLightGrey rounded-xl px-6 py-3 flex-row items-center border-2 border-appDarkGrey">
            <Ionicons
              name="time-outline"
              size={24}
              color={COLORS.appDarkGrey}
              style={{ marginRight: 8 }}
            />
            <Text className="text-xl font-nunito-extrabold text-appDarkGrey">
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <View className="absolute bottom-20 left-4 right-4 bg-appBlack rounded-2xl border-appBlack border-2 p-6"
              style={{ height: '60%' }}>
          <View className="flex items-center justify-center">
            <Text className="text-white text-lg font-nunito-bold mb-4">
              {isImageRole ? "" : "Hints:"}
            </Text>
            
            {(() => {
              // IMPORTANTE: Verifica o papel ANTES de acessar qualquer dado do personagem
              // Isso evita que a imagem seja renderizada quando o jogador deveria ver dicas
              if (isImageRole === true) {
                // Papel: Ver imagem do personagem atual
                // Só acessa myCharacterImage se isImageRole for true
                const imageToShow = myCharacterImage || myCharacter?.image || null;
                return (
                  <View
                    className="w-60 h-60 rounded-xl overflow-hidden mb-4 bg-appLightGrey flex items-center justify-center"
                    style={{
                      position: 'relative',
                      alignSelf: 'center',
                    }}>
                    {imageToShow ? (
                      <Image
                        source={imageToShow}
                        style={{
                          width: '100%'
                        }}
                        resizeMode="contain" 
                      />
                    ) : (
                      <View className="w-full h-full bg-appMediumGrey flex items-center justify-center">
                        <Text className="text-white text-lg font-nunito-bold">Loading...</Text>
                      </View>
                    )}
                  </View>
                );
              } else {
                // Papel: Ver dicas do personagem atual
                // Quando isImageRole é false, NUNCA mostra a imagem, mesmo que exista
                return (
                  <View className="w-80 h-60 bg-black rounded-xl mb-4 bg-appLightGrey p-4 overflow-y-auto">
                    {myCharacter && myCharacter.hints && myCharacter.hints.length > 0 ? (
                      <View className="flex-1 items-center justify-center">
                        {myCharacter.hints.map((hint, index) => (
                          <Text key={index} className="text-white text-xl font-nunito-medium mb-2 text-center">
                            • {hint}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <View className="w-full h-full bg-appMediumGrey flex items-center justify-center">
                        <Text className="text-white text-lg font-nunito-bold">
                          {myCharacter ? "Carregando dicas..." : "Aguardando personagem..."}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }
            })()}
            
            <Text className="text-white mb-2 font-nunito-bold">
              {isImageRole ? "Guess who this is:" : ""}
            </Text>
            {isImageRole && myCharacter && (
              <Text className="text-yellow-300 mb-4 font-nunito-bold text-center px-4">
                {myCharacter.name}
              </Text>
            )}
            {isImageRole && (
              <TouchableOpacity
                className="bg-appMediumGrey rounded-full py-4 px-8 mb-3 w-64"
                onPress={handleNailedIt}
              >
                <Text className="text-white font-nunito-bold text-center text-lg">Nailed it</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="bg-appMediumRed rounded-full py-4 px-8 w-64"
              onPress={handleNailedIt}
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
        characterName={correctAnswerCharacterName || undefined}
      />

      <AdversaryCorrectAnswerModal
        visible={showAdversaryCorrect}
        correctImage={adversaryCorrectImage}
        characterName={adversaryCorrectCharacterName || undefined}
      />
      </LinearGradient>
    </SafeAreaView>
  );
}