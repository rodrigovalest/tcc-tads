import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    const audio = result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
    const camera = result[PermissionsAndroid.PERMISSIONS.CAMERA];
    const permissionsGranted = audio === 'granted' && camera === 'granted';

    if (!permissionsGranted) {
      if (audio === 'never_ask_again' || camera === 'never_ask_again') {
        Alert.alert(
          'Permissions required',
          'You have permanently denied access to the camera and/or microphone. Please open settings to enable them.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
    }

    return permissionsGranted;
  }

  return true;
}
