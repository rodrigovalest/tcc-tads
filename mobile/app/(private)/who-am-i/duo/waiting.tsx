import Spinner from '../../../../components/Spinner';
import React from 'react';
import { Text, Image, SafeAreaView } from 'react-native';
import useMatchmaking from '../../../../hooks/useMatchmaking';

export default function WhoAmIWaiting() {
  useMatchmaking();

  return (
    <SafeAreaView className='flex-1 bg-appBgWhite items-center justify-center px-6'>
      <Image
        source={require("../../../../assets/images/calle-dog-icon.png")}
        className="w-24 h-24 mb-4"
      />

      <Text className="text-2xl text-center pl-4 font-nunito-semibold mb-4">
        Almost there... finding the best match for you!
      </Text>

      <Spinner />
    </SafeAreaView>
  );
}