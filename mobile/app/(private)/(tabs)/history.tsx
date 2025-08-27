import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import useI18n from '../../../hooks/useI18n';
import { useMatchHistory } from '../../../hooks/useMatchHistory';
import Spinner from '../../../components/Spinner';
import Toast from 'react-native-toast-message';
import MatchHistoryItem from '../../../components/MatchHistoryItem';

export default function History() {
  const { t } = useI18n();
  const {
    data: matchHistoryItems,
    isLoading,
    isError,
    error,
  } = useMatchHistory();

  if (isLoading) {
    return <Spinner />
  }

  if (isError && error) {
    Toast.show({
      type: "error",
      text1: "Error loading match history",
      position: "top",
    });
  }

  return (
    <SafeAreaView
      className='w-full h-full bg-appBgWhite pt-5'
    >
      <Text className="text-4xl font-nunito-bold my-8 px-10">
        {t('navigation.history')}
      </Text>

      {matchHistoryItems && matchHistoryItems.length === 0 && (
        <Text className="text-lg font-nunito-regular">
          no match history available
        </Text>
      )}

      {matchHistoryItems && matchHistoryItems.map((item) => (
        <MatchHistoryItem
          key={item.id}
          startTime={item.startTime}
          endTime={item.endTime}
          mode={item.mode}
          language={item.language}
          users={item.users}
        />
      ))}
    </SafeAreaView>
  );
}
