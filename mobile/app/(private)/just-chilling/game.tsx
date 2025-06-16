import { SafeAreaView, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useWebRTCConnection } from '../../../hooks/useWebRTCConnection';

export default function JustChilling() {
  const { localStream, remoteStream } = useWebRTCConnection();

  return (
    <SafeAreaView className='w-full h-full bg-appBgWhite'>
      <Text className="text-xl font-bold text-center my-4">Just Chilling</Text>

      <View className="flex-1 items-center justify-center gap-4">
        {localStream && (
          <RTCView
            streamURL={(localStream as any).toURL()}
            style={{ width: 150, height: 200 }}
            objectFit="cover"
            mirror
          />
        )}

        {remoteStream && (
          <RTCView
            streamURL={(remoteStream as any).toURL()}
            style={{ width: 300, height: 400 }}
            objectFit="cover"
          />
        )}
        {!remoteStream && <Text>Aguardando conexão do parceiro...</Text>}
      </View>
    </SafeAreaView>
  );
}
