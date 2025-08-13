import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import useI18n from '../../../hooks/useI18n';

export default function Profile() {
  const { t } = useI18n();

  return (
    <SafeAreaView
      className='w-full h-full bg-appBgWhite'
    >
      <Text>{t('navigation.profile')}</Text>
    </SafeAreaView>
  );
}
