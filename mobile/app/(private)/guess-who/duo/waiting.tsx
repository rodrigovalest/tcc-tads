import Spinner from '../../../../components/Spinner';
import React from 'react';
import { Text, Image, SafeAreaView } from 'react-native';
import useI18n from '../../../../hooks/useI18n';
import useGuessWhoMatchmaking from '../../../../hooks/useGuessWhoMatchmaking';

export default function GuessWhoWaiting() {
  useGuessWhoMatchmaking();
  const { t } = useI18n();

  return (
    <SafeAreaView className='flex-1 bg-appBgWhite items-center justify-center px-6'>
      <Image
        source={require("../../../../assets/images/calle-dog-icon.png")}
        className="w-24 h-24 mb-4"
      />

      <Text className="text-2xl text-center pl-4 font-nunito-semibold mb-4 text-appBlack">
        {t("common.matchmakingWaiting")}
      </Text>

      <Spinner />
    </SafeAreaView>
  );
}
