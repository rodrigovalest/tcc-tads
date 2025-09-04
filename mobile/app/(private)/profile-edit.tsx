import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import useI18n from '../../hooks/useI18n';
import PersonalDescription from '../../components/PersonalDescription';
import LanguageFluencySelector from '../../components/LanguageFluencySelector';
import InterestTopicsSelector from '../../components/InterestTopicsSelector';
import ProfilePhotoUpload from '../../components/ProfilePhotoUpload';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/auth-store';
import userService from '../../services/user-service';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';

type LanguageFluency = { languageCode: string; fluencyLevel: number };

export default function ProfileEdit() {
  const { t } = useI18n();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);

  const { data: fullUser } = useQuery({
    queryKey: ['user', authUser?.sub],
    queryFn: () => userService.findById(authUser!.sub),
    enabled: !!authUser?.sub,
  });

  const [photoUri, setPhotoUri] = useState<string | undefined | null>(undefined);
  const [username, setUsername] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [languages, setLanguages] = useState<LanguageFluency[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [originalPhotoUri, setOriginalPhotoUri] = useState<string | undefined | null>(undefined);

  // Initialize local state when fullUser loads
  React.useEffect(() => {
    if (fullUser) {
      setPhotoUri(fullUser.photoUri);
      setOriginalPhotoUri(fullUser.photoUri);
      setUsername(fullUser.username || '');
      setDescription(fullUser.personalDescription || '');
      setLanguages(fullUser.languages?.map(l => ({ languageCode: l.languageCode, fluencyLevel: l.fluencyLevel })) || []);
      setTopics(fullUser.interestTopics?.map(t => t.topic) || []);
    }
  }, [fullUser]);

  const qc = useQueryClient();
  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async () => {
      let photoFile: { uri: string; name: string; type: string } | null = null;
      if (photoUri && photoUri !== originalPhotoUri) {
        const filename = photoUri.split('/').pop() || `photo.jpg`;
        const ext = filename.split('.').pop()?.toLowerCase();
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        photoFile = { uri: photoUri, name: filename, type: mime };
      }

      return userService.update(authUser!.sub, {
        username,
        personalDescription: description,
        languages,
        interestTopics: topics,
        removePhoto: !photoUri,
        photoFile,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', authUser?.sub] });
      router.back();
    },
  });

  const handleSave = () => saveProfile();
  const handleCancel = () => router.back();

  return (
    <SafeAreaView className='flex-1 bg-appBgWhite'>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className='text-2xl font-nunito-bold mb-4'>{t('common.edit')} {t('navigation.profile')}</Text>

        <View className='mb-6'>
          <Input label={t('auth.username')} value={username} onChangeText={setUsername} placeholder={t('auth.enterUsername')} />
        </View>

        <View className='mb-6'>
          <ProfilePhotoUpload 
            photoUri={photoUri || undefined} 
            onPhotoChange={setPhotoUri as any} 
            showOptionalMessage={false}
          />
        </View>

        <View className='mb-6'>
          <PersonalDescription 
            description={description} 
            onDescriptionChange={setDescription} 
            showOptionalMessage={false}
          />
        </View>

        <View className='mb-6'>
          <LanguageFluencySelector selectedLanguages={languages} onLanguagesChange={setLanguages} />
        </View>

        <View className='mb-6'>
          <InterestTopicsSelector selectedTopics={topics} onTopicsChange={setTopics} />
        </View>

        <View className='flex-row gap-4 mt-2'>
          <TouchableOpacity 
            className='flex-1 bg-gray-300 rounded-xl py-4 items-center' 
            onPress={handleCancel} 
            disabled={isPending}
          >
            <Text className='text-gray-700 font-nunito-semibold'>{t('common.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className='flex-1 bg-appDarkGrey rounded-xl py-4 items-center' 
            onPress={handleSave} 
            disabled={isPending}
          >
            <Text className='text-white font-nunito-semibold'>{isPending ? t('common.loading') : t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


