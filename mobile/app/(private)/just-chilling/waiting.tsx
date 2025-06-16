// screens/TestVideoCallScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useTestVideoCall } from '../../../hooks/useTestVideoCall';

export default function TestVideoCallScreen() {
  const { localStream, remoteStream } = useTestVideoCall();

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
