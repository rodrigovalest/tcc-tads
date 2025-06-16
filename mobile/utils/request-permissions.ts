import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    try {
      console.log('Requesting camera and microphone permissions...');

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
            'Permissões necessárias',
            'Você negou permanentemente o acesso à câmera e/ou microfone. Vá até as configurações para habilitar.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
            ],
          );
        }
      }

      return permissionsGranted;
    } catch (err) {
      console.warn('Permission request error', err);
      return false;
    }
  }

  return true;
}
