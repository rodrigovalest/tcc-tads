import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Image, View, Button } from 'react-native';
import { COLORS } from '@/constants/colors';
import LanguagesDropdown from '@/components/languages-dropdown';

export default function Matches() {
  return (
    <SafeAreaView
      className='w-full h-full bg-appBgWhite pt-6 px-10'
    >
      <View 
        className='mb-8'
      >
        <Image
          source={require('../../../assets/images/calle-dog-icon.png')}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>

      <Text
        className='font-nunito-bold text-3xl text-appBlack mb-8'
      >
        Find people who speak the selected language
      </Text>

      <Button
        title='Find a match'
      />

      <LanguagesDropdown />

      <Text
        className='font-nunito-bold text-3xl text-appBlack my-8'
      >
        Modes
      </Text>

      <View>
        <Image
          source={require('../../../assets/images/just-chilling-icon.png')}
          style={{ width: 160, height: 200, borderRadius: 25, borderColor: COLORS.appBlack, borderWidth: 1.5 }}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}
