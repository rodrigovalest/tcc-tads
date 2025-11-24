import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../../../store/auth-store";
import { useRouter } from "expo-router";
import { RTCView } from "react-native-webrtc";
import { useEffect, useState, useRef } from "react";
import useWhoAmIDuo from "../../../../hooks/useWhoAmIDuo";
import useMatchStore from "../../../../store/match-store";
import CorrectAnswerModal from "../../../../components/who-am-i/CorrectAnswer";
import AdversaryCorrectAnswerModal from "../../../../components/who-am-i/AdversaryCorrectAnswer";
import { COLORS } from "../../../../constants/colors";
import VideoCardComponent from "../../../../components/VideoCard";
import { getCountryData } from "../../../../utils/country-language-utils";
import useI18n from "../../../../hooks/useI18n";
import VideoCallControlsComponent from "../../../../components/VideoCallControls";

export default function WhoAmI() {
  const { t } = useI18n();
  const { user: loggedUser } = useAuthStore();
  const { buddy, resetMatch } = useMatchStore();
  const router = useRouter();
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showAdversaryCorrect, setShowAdversaryCorrect] = useState(false);
  const [correctAnswerImage, setCorrectAnswerImage] =
    useState<ImageSourcePropType | null>(null);
  const [adversaryCorrectImage, setAdversaryCorrectImage] =
    useState<ImageSourcePropType | null>(null);
  const [correctAnswerCharacterName, setCorrectAnswerCharacterName] = useState<
    string | null
  >(null);
  const [adversaryCorrectCharacterName, setAdversaryCorrectCharacterName] =
    useState<string | null>(null);
  const [isGiveUp, setIsGiveUp] = useState<boolean>(false);
  const [adversaryIsGiveUp, setAdversaryIsGiveUp] = useState<boolean>(false);
  const [adversaryIsImageRole, setAdversaryIsImageRole] =
    useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState(100); // Valor inicial, será atualizado pelo timer sincronizado
  const [currentRound, setCurrentRound] = useState<number>(1); // Contador de rodadas (começa na 1ª rodada)
  const currentRoundRef = useRef<number>(1); // Ref para ter acesso ao valor mais atualizado do currentRound
  const [shouldEndGame, setShouldEndGame] = useState<boolean>(false); // Flag para encerrar o jogo após modais fecharem
  const MAX_ROUNDS = 6; // Limite máximo de rodadas
  
  // Log para debug do contador de rodadas
  useEffect(() => {
    console.log("[ROUND_COUNTER] Rodada atual:", currentRound, "de", MAX_ROUNDS);
    // Atualiza a ref sempre que o currentRound mudar
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  // Monitora quando os modais fecham para encerrar o jogo se necessário
  useEffect(() => {
    if (shouldEndGame && !showCorrectAnswer && !showAdversaryCorrect) {
      console.log("[GAME_ENDED] Modais fecharam, encerrando jogo agora");
      setShouldEndGame(false);
      endCall();
    }
  }, [shouldEndGame, showCorrectAnswer, showAdversaryCorrect]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    notifyGameEnded,
    usedCharacters,
    myCharacterImage,
    opponentCharacterImage,
    generateNewImages,
    isImageRole,
    switchRoles,
    myCharacterHints,
    opponentCharacterHints,
    timerStartTimestamp,
    timerDurationMs,
    serverOffset,
  } = useWhoAmIDuo(
    () => {
      router.replace("/(private)/match-rate-duo");
    },
    (
      adversaryIsGiveUp: boolean = false,
      adversaryIsImageRole: boolean = false
    ) => {
      const imageToShow =
        characterImageRef.current ||
        myCharacterImage ||
        myCharacter?.image ||
        opponentCharacterImage ||
        opponentCharacter?.image ||
        null;
      const characterNameToShow =
        characterNameRef.current ||
        myCharacter?.name ||
        opponentCharacter?.name ||
        null;
      console.log("[ADVERSARY_CORRECT] Imagem que será mostrada:", imageToShow);
      console.log(
        "[ADVERSARY_CORRECT] Nome do personagem:",
        characterNameToShow
      );
      console.log(
        "[ADVERSARY_CORRECT] characterImageRef.current:",
        characterImageRef.current
      );
      console.log(
        "[ADVERSARY_CORRECT] characterNameRef.current:",
        characterNameRef.current
      );
      console.log("[ADVERSARY_CORRECT] myCharacter:", myCharacter?.name);
      console.log("[ADVERSARY_CORRECT] myCharacterImage:", myCharacterImage);
      console.log(
        "[ADVERSARY_CORRECT] opponentCharacterImage:",
        opponentCharacterImage
      );
      console.log("[ADVERSARY_CORRECT] adversaryIsGiveUp:", adversaryIsGiveUp);
      console.log(
        "[ADVERSARY_CORRECT] adversaryIsImageRole:",
        adversaryIsImageRole
      );
      console.log("[ADVERSARY_CORRECT] my isImageRole:", isImageRole);

      setAdversaryCorrectImage(imageToShow);
      setAdversaryCorrectCharacterName(characterNameToShow);
      // Se o adversário desistiu, precisamos saber qual era o papel dele para mostrar a mensagem correta
      // Se adversaryIsImageRole é true, significa que o adversário tinha a imagem, então eu tinha as dicas
      // Se adversaryIsImageRole é false, significa que o adversário tinha as dicas, então eu tinha a imagem
      setAdversaryIsGiveUp(adversaryIsGiveUp);
      setAdversaryIsImageRole(adversaryIsImageRole);
      setShowAdversaryCorrect(true);

      setTimeout(() => {
        setShowAdversaryCorrect(false);
        // Não chama generateNewCharacter aqui - o outro jogador que acertou vai fazer isso
      }, 1000);
    },
    () => {
      // Callback quando uma nova rodada começa (quando o adversário inicia ou quando eu inicio)
      // Incrementa o contador de rodadas - esta é a ÚNICA forma de incrementar o contador
      setCurrentRound((prev) => {
        const newRound = prev + 1;
        console.log("[GAME] Nova rodada iniciada - rodada", newRound, "de", MAX_ROUNDS, "(anterior era", prev, ")");
        
        // Não encerramos aqui - deixamos a rodada atual terminar
        // O encerramento será verificado quando o jogador tentar acertar/desistir
        // e verificar se currentRound >= MAX_ROUNDS
        
        return newRound;
      });
    },
    () => {
      // Callback quando o oponente notifica que o jogo deve encerrar
      console.log("[GAME_ENDED] Recebido callback de encerramento do oponente");
      // Marca que o jogo deve encerrar após os modais fecharem
      setShouldEndGame(true);
      // Se não houver modais abertos, o useEffect vai encerrar imediatamente
    }
  );

  const formatTime = (seconds: number): string => {
    const positiveSeconds = Math.max(0, seconds);
    const minutes = Math.floor(positiveSeconds / 60);
    const secs = Math.floor(positiveSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    start();
  }, []);

  // Timer sincronizado baseado no timestamp do servidor
  useEffect(() => {
    if (timerStartTimestamp === null || timerDurationMs === 0) {
      console.log("[TIMER] Timer não inicializado ainda - timestamp:", timerStartTimestamp, "duration:", timerDurationMs);
      return;
    }

    console.log("[TIMER] Inicializando timer sincronizado - timestamp:", timerStartTimestamp, "duration:", timerDurationMs);

    // Limpa o timer anterior se existir
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Função para calcular o tempo restante baseado no timestamp do servidor
    // Usa o serverOffset para compensar diferenças de relógio e delay de rede
    const calculateTimeLeft = () => {
      const clientNow = Date.now();
      // Converte o tempo do cliente para o tempo do servidor usando o offset
      // Se o servidor está X ms atrás do cliente, então serverTime = clientTime - offset
      const serverNow = clientNow - serverOffset;
      // Calcula quanto tempo passou desde o início do timer no servidor
      const elapsed = serverNow - timerStartTimestamp;
      const remainingMs = timerDurationMs - elapsed;
      
      // Log para depuração (apenas ocasionalmente)
      if (Math.random() < 0.01) { // Log apenas 1% das vezes para não poluir
        console.log("[TIMER_CALC] timestamp:", timerStartTimestamp, "clientNow:", clientNow, "serverNow:", serverNow, "offset:", serverOffset, "elapsed:", elapsed, "remaining:", remainingMs);
      }
      
      if (remainingMs <= 0) {
        setTimeLeft(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        // Usa a ref para ter o valor mais atualizado do currentRound
        const roundAtTimerEnd = currentRoundRef.current;
        console.log("[TIMER] Timer chegou a zero na rodada", roundAtTimerEnd, "- considerando como rodada completada");
        console.log("[TIMER] Verificando se deve encerrar - currentRound:", roundAtTimerEnd, "MAX_ROUNDS:", MAX_ROUNDS);
        // Chama handleGiveUp que vai verificar o limite usando o estado atualizado
        handleGiveUp(); // chama ao zerar (tempo acabou = give up, conta como rodada completada)
        return;
      }
      
      const timeLeftSeconds = Math.max(0, remainingMs / 1000);
      setTimeLeft(timeLeftSeconds);
    };

    // Calcula imediatamente
    calculateTimeLeft();

    // Atualiza a cada 100ms para garantir precisão
    timerRef.current = setInterval(calculateTimeLeft, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerStartTimestamp, timerDurationMs, serverOffset]);

  // Debug: monitora mudanças no personagem e papel
  useEffect(() => {
    console.log("[GAME] myCharacter mudou:", myCharacter?.name);
    console.log("[GAME] myCharacter hints:", myCharacter?.hints?.length || 0);
    console.log("[GAME] isImageRole:", isImageRole);
    console.log(
      "[GAME] should show hints:",
      !isImageRole && myCharacter && myCharacter.hints?.length > 0
    );

    const currentImage =
      myCharacterImage ||
      myCharacter?.image ||
      opponentCharacterImage ||
      opponentCharacter?.image ||
      null;
    const currentName = myCharacter?.name || opponentCharacter?.name || null;
    characterImageRef.current = currentImage;
    characterNameRef.current = currentName;
  }, [
    myCharacter,
    myCharacterImage,
    opponentCharacter,
    opponentCharacterImage,
    isImageRole,
  ]);

  const handleNailedIt = () => {
    // Debug: verificar os personagens no momento do clique
    console.log("[NAILED_IT] myCharacter:", myCharacter?.name);
    console.log("[NAILED_IT] isImageRole:", isImageRole);
    console.log("[NAILED_IT] myCharacter hints:", myCharacter?.hints);

    // Mostra a imagem do personagem atual (que ambos estão tentando adivinhar)
    const imageToShow =
      myCharacterImage ||
      myCharacter?.image ||
      opponentCharacterImage ||
      opponentCharacter?.image ||
      null;
    const characterNameToShow =
      myCharacter?.name || opponentCharacter?.name || null;
    console.log("[NAILED_IT] Imagem que será mostrada:", imageToShow);
    console.log("[NAILED_IT] Nome do personagem:", characterNameToShow);

    setCorrectAnswerImage(imageToShow);
    setCorrectAnswerCharacterName(characterNameToShow);
    setIsGiveUp(false);
    setShowCorrectAnswer(true);

    notifyCorrectAnswer(false);

    // Verifica se a rodada ATUAL já atingiu ou excedeu o limite
    // Se estamos na 6ª rodada (currentRound === 6), esta é a última rodada
    // Quando ela termina (timer zera ou acerta), não devemos gerar mais rodadas
    // Usa a ref para garantir que temos o valor mais atualizado
    const roundNow = currentRoundRef.current;
    console.log("[NAILED_IT] Verificando limite - rodada atual (estado):", currentRound, "rodada atual (ref):", roundNow, "máximo:", MAX_ROUNDS);
    console.log("[NAILED_IT] Condição de verificação:", roundNow, ">=", MAX_ROUNDS, "=", roundNow >= MAX_ROUNDS);
    if (roundNow >= MAX_ROUNDS) {
      console.log("[GAME] Limite de rodadas atingido na rodada", roundNow, ", encerrando jogo automaticamente");
      // Notifica o servidor que o jogo encerrou para que o outro jogador também seja notificado
      notifyGameEnded();
      // Marca que o jogo deve encerrar após o modal fechar
      setShouldEndGame(true);
      // Fecha o modal após 1 segundo, e o useEffect vai encerrar o jogo quando o modal fechar
      setTimeout(() => {
        setShowCorrectAnswer(false);
      }, 1000);
      return;
    }

    // O timer será resetado automaticamente quando o servidor enviar o novo timestamp
    // via evento who-am-i:duo:new-round
    // O contador será incrementado quando recebermos o evento who-am-i:duo:new-round

    console.log("[NAILED_IT] Gerando nova rodada - próxima será a rodada", currentRound + 1);
    setTimeout(() => {
      setShowCorrectAnswer(false);
      // Gera nova rodada - o contador será incrementado quando recebermos o evento do servidor
      generateNewCharacter();
    }, 1000);
  };

  const handleGiveUp = () => {
    // Debug: verificar os personagens no momento do clique
    console.log("[GIVE_UP] myCharacter:", myCharacter?.name);
    console.log("[GIVE_UP] isImageRole:", isImageRole);
    console.log("[GIVE_UP] myCharacter hints:", myCharacter?.hints);

    // Mostra a imagem do personagem atual (que ambos estão tentando adivinhar)
    const imageToShow =
      myCharacterImage ||
      myCharacter?.image ||
      opponentCharacterImage ||
      opponentCharacter?.image ||
      null;
    const characterNameToShow =
      myCharacter?.name || opponentCharacter?.name || null;
    console.log("[GIVE_UP] Imagem que será mostrada:", imageToShow);
    console.log("[GIVE_UP] Nome do personagem:", characterNameToShow);

    setCorrectAnswerImage(imageToShow);
    setCorrectAnswerCharacterName(characterNameToShow);
    setIsGiveUp(true);
    setShowCorrectAnswer(true);

    notifyCorrectAnswer(true);

    // Verifica se a rodada ATUAL já atingiu ou excedeu o limite
    // Se estamos na 6ª rodada (currentRound === 6), esta é a última rodada
    // Quando ela termina (timer zera ou acerta), não devemos gerar mais rodadas
    // Usa a ref para garantir que temos o valor mais atualizado
    const roundNow = currentRoundRef.current;
    console.log("[GIVE_UP] Verificando limite - rodada atual (estado):", currentRound, "rodada atual (ref):", roundNow, "máximo:", MAX_ROUNDS);
    console.log("[GIVE_UP] Condição de verificação:", roundNow, ">=", MAX_ROUNDS, "=", roundNow >= MAX_ROUNDS);
    
    // IMPORTANTE: Se estamos na 6ª rodada (currentRound === 6), esta é a última
    // Quando ela termina, devemos encerrar o jogo
    // Usa a ref para garantir que temos o valor mais atualizado
    if (roundNow >= MAX_ROUNDS) {
      console.log("[GAME] Limite de rodadas atingido na rodada", roundNow, ", encerrando jogo automaticamente");
      // Notifica o servidor que o jogo encerrou para que o outro jogador também seja notificado
      notifyGameEnded();
      // Marca que o jogo deve encerrar após o modal fechar
      setShouldEndGame(true);
      // Fecha o modal após 1 segundo, e o useEffect vai encerrar o jogo quando o modal fechar
      setTimeout(() => {
        setShowCorrectAnswer(false);
      }, 1000);
      return;
    }

    // O timer será resetado automaticamente quando o servidor enviar o novo timestamp
    // via evento who-am-i:duo:new-round
    // O contador será incrementado quando recebermos o evento who-am-i:duo:new-round

    console.log("[GIVE_UP] Gerando nova rodada - próxima será a rodada", currentRound + 1);
    setTimeout(() => {
      setShowCorrectAnswer(false);
      // Gera nova rodada - o contador será incrementado quando recebermos o evento do servidor
      generateNewCharacter();
    }, 1000);
  };

  return (
    <SafeAreaView className="w-full h-full">
      <LinearGradient
        colors={["#501E3F", "#49AA8F"]}
        style={StyleSheet.absoluteFillObject}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center w-full px-6 pt-8">
          <VideoCardComponent
            stream={localStream}
            name={loggedUser?.username || t("common.you")}
            countryFlagEmoji={getCountryData(loggedUser!.nationality)?.flag || "🏳️"}
          />

          <View className="bg-appLightGrey rounded-xl px-3 py-3 flex-row items-center border-2 border-appDarkGrey">
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

          <VideoCardComponent
            stream={remoteStream}
            name={buddy?.username || t("common.opponent")}
            countryFlagEmoji={getCountryData(buddy!.nationality)?.flag || "🏳️"}
          />
        </View>

        {/* MAIN GAME CONTENT */}
        <View className="bg-appDarkGrey w-[95%] mx-auto mt-6 rounded-2xl p-4 items-center">
          <View className="bg-appBlack rounded-2xl p-6 w-full flex items-center justify-center">
            <Text className="text-white text-lg font-nunito-bold mb-4">
              {isImageRole ? "" : `${t("whoAmI.hints")}:`}
            </Text>

            {isImageRole ? (
              /* === IMAGE ROLE === */
              <View className="w-60 h-60 rounded-xl overflow-hidden mb-4 bg-appLightGrey flex items-center justify-center">
                {myCharacterImage || myCharacter?.image ? (
                  <Image
                    source={myCharacterImage || myCharacter?.image!}
                    style={{ width: "100%" }}
                    resizeMode="contain"
                  />
                ) : (
                  <View className="w-full h-full bg-appMediumGrey flex items-center justify-center">
                    <Text className="text-white text-lg font-nunito-bold">
                      {t("whoAmI.loading")}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              /* === HINT ROLE === */
              <View className="w-80 h-60 bg-appMediumGrey rounded-xl mb-4 p-4">
                {myCharacter?.hints?.length ? (
                  <View className="flex-1 items-center justify-center">
                    {myCharacter.hints.map((hint, index) => (
                      <Text
                        key={index}
                        className="text-white text-xl font-nunito-medium mb-2 text-center"
                      >
                        {hint}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <View className="w-full h-full bg-appMediumGrey flex items-center justify-center">
                    <Text className="text-white text-lg font-nunito-bold">
                      {myCharacter
                        ? t("whoAmI.loadingHints")
                        : t("whoAmI.waitingForCharacter")}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {isImageRole && (
              <>
                <Text className="text-white mb-2 font-nunito-bold">
                  {`${t("whoAmI.guessWhoIs")}:`}
                </Text>

                <Text className="text-yellow-300 mb-4 font-nunito-bold text-center px-4">
                  {myCharacter?.name}
                </Text>

                <TouchableOpacity
                  className="bg-appMediumGrey rounded-full py-4 px-8 mb-3 w-64"
                  onPress={handleNailedIt}
                >
                  <Text className="text-white font-nunito-bold text-center text-lg">
                    {t("whoAmI.nailedIt")}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              className="bg-appMediumRed rounded-full py-4 px-8 w-64"
              onPress={handleGiveUp}
            >
              <Text className="text-white font-nunito-bold text-center text-lg">
                {t("whoAmI.giveUp")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <VideoCallControlsComponent
          onSwitchAudio={switchAudio}
          onSwitchVideo={switchVideo}
          onEndCall={endCall}
          isMicMuted={isMicMuted}
          isVideoMuted={isVideoMuted}
        />

        <CorrectAnswerModal
          visible={showCorrectAnswer}
          correctImage={correctAnswerImage}
          characterName={correctAnswerCharacterName || undefined}
          isGiveUp={isGiveUp}
        />

        <AdversaryCorrectAnswerModal
          visible={showAdversaryCorrect}
          correctImage={adversaryCorrectImage}
          characterName={adversaryCorrectCharacterName || undefined}
          isGiveUp={adversaryIsGiveUp}
          adversaryIsImageRole={adversaryIsImageRole}
          myIsImageRole={isImageRole}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}
