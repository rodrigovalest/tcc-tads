import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import ProfileEdit from '@/app/(private)/profile-edit';
import useAuthStore from '@/store/auth-store';
import useI18n from '@/hooks/useI18n';
import userService from '@/services/user-service';

// Mock dependencies
jest.mock('@/store/auth-store');
jest.mock('@/hooks/useI18n');
jest.mock('@/services/user-service');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/Input', () => {
  const { TextInput, Text } = require('react-native');
  return function MockInput({ label, value, onChangeText, placeholder, ...props }: any) {
    return (
      <>
        <Text>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          testID={`input-${label}`}
          {...props}
        />
      </>
    );
  };
});

jest.mock('@/components/PersonalDescription', () => {
  const { TextInput, Text } = require('react-native');
  return function MockPersonalDescription({ description, onDescriptionChange }: any) {
    return (
      <>
        <Text>Personal Description</Text>
        <TextInput
          value={description}
          onChangeText={onDescriptionChange}
          testID="personal-description-input"
        />
      </>
    );
  };
});

jest.mock('@/components/LanguageFluencySelector', () => {
  const { View, Text } = require('react-native');
  return function MockLanguageFluencySelector({ selectedLanguages, onLanguagesChange }: any) {
    return (
      <View testID="language-fluency-selector">
        <Text>Language Fluency Selector</Text>
        <Text testID="selected-languages">{JSON.stringify(selectedLanguages)}</Text>
      </View>
    );
  };
});

jest.mock('@/components/InterestTopicsSelector', () => {
  const { View, Text } = require('react-native');
  return function MockInterestTopicsSelector({ selectedTopics, onTopicsChange }: any) {
    return (
      <View testID="interest-topics-selector">
        <Text>Interest Topics Selector</Text>
        <Text testID="selected-topics">{JSON.stringify(selectedTopics)}</Text>
      </View>
    );
  };
});

jest.mock('@/components/ProfilePhotoUpload', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockProfilePhotoUpload({ photoUri, onPhotoChange }: any) {
    return (
      <View testID="profile-photo-upload">
        <Text>Profile Photo Upload</Text>
        <Text testID="current-photo">{photoUri || 'No photo'}</Text>
        <TouchableOpacity
          testID="change-photo-button"
          onPress={() => onPhotoChange('new-photo-uri')}
        >
          <Text>Change Photo</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

const mockT = jest.fn((key: string) => {
  const translations: { [key: string]: string } = {
    'common.edit': 'Edit',
    'navigation.profile': 'Profile',
    'auth.username': 'Username',
    'auth.enterUsername': 'Enter username',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
  };
  return translations[key] || key;
});

const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUserService = userService as jest.Mocked<typeof userService>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockUser = {
  sub: 1,
  username: 'testuser',
  email: 'test@example.com',
};

const mockFullUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  nationality: 'BR',
  personalDescription: 'This is a test description',
  photoUri: 'http://example.com/photo.jpg',
  isActive: true,
  lastLoginAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  languages: [
    {
      id: 1,
      languageCode: 'en',
      fluencyLevel: 4,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
  interestTopics: [
    {
      id: 1,
      topic: 'Technology',
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
};

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(true),
  navigate: jest.fn(),
  dismiss: jest.fn(),
  dismissTo: jest.fn(),
  dismissAll: jest.fn(),
  canDismiss: jest.fn().mockReturnValue(true),
  setParams: jest.fn(),
};

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ProfileEdit Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseI18n.mockReturnValue({
      t: mockT as any,
      currentLanguage: 'en' as any,
      changeLanguage: jest.fn(),
      isLoading: false,
      isInitialized: true,
      isRTL: false,
      resetLanguage: jest.fn(),
      availableLanguages: [],
    });
    mockUseAuthStore.mockReturnValue(mockUser);
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUserService.findById.mockResolvedValue(mockFullUser);
    mockUserService.update.mockResolvedValue(mockFullUser);
  });

  it('should render edit profile form', async () => {
    const { getByText, getByTestId } = renderWithProviders(<ProfileEdit />);

    expect(getByText('Edit Profile')).toBeTruthy();
    expect(getByText('Username')).toBeTruthy();
    expect(getByTestId('profile-photo-upload')).toBeTruthy();
    expect(getByText('Personal Description')).toBeTruthy();
    expect(getByTestId('language-fluency-selector')).toBeTruthy();
    expect(getByTestId('interest-topics-selector')).toBeTruthy();
  });

  it('should populate form with existing user data', async () => {
    const { getByDisplayValue, getByTestId } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      expect(getByDisplayValue('testuser')).toBeTruthy();
      expect(getByDisplayValue('This is a test description')).toBeTruthy();
    });

    expect(getByTestId('current-photo')).toHaveTextContent('http://example.com/photo.jpg');
  });

  it('should update username when input changes', async () => {
    const { getByTestId } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      const usernameInput = getByTestId('input-Username');
      fireEvent.changeText(usernameInput, 'newusername');
      expect(usernameInput.props.value).toBe('newusername');
    });
  });

  it('should update personal description when changed', async () => {
    const { getByTestId } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      const descriptionInput = getByTestId('personal-description-input');
      fireEvent.changeText(descriptionInput, 'New description');
      expect(descriptionInput.props.value).toBe('New description');
    });
  });

  it('should handle photo change', async () => {
    const { getByTestId } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      const changePhotoButton = getByTestId('change-photo-button');
      fireEvent.press(changePhotoButton);
    });

    expect(getByTestId('current-photo')).toHaveTextContent('new-photo-uri');
  });

  it('should navigate back when cancel button is pressed', async () => {
    const { getByText } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);
    });

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should save profile when save button is pressed', async () => {
    const { getByText, getByTestId } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      // Change username
      const usernameInput = getByTestId('input-Username');
      fireEvent.changeText(usernameInput, 'updateduser');
    });

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUserService.update).toHaveBeenCalledWith(1, expect.objectContaining({
        username: 'updateduser',
      }));
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  it('should show loading state when saving', async () => {
    // Mock a delayed response
    mockUserService.update.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { getByText } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);
    });

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should handle save with photo file', async () => {
    const { getByText, getByTestId } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      // Change photo
      const changePhotoButton = getByTestId('change-photo-button');
      fireEvent.press(changePhotoButton);
    });

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUserService.update).toHaveBeenCalledWith(1, expect.objectContaining({
        photoFile: expect.objectContaining({
          uri: 'new-photo-uri',
          name: expect.any(String),
          type: expect.any(String),
        }),
      }));
    });
  });

  it('should handle removing photo', async () => {
    const { getByText, getByTestId } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      // Mock removing photo by setting it to null
      const changePhotoButton = getByTestId('change-photo-button');
      // Simulate removing photo
      fireEvent.press(changePhotoButton);
      // Then simulate clearing it
      const photoUpload = getByTestId('profile-photo-upload');
      fireEvent(photoUpload, 'onPhotoChange', null);
    });

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUserService.update).toHaveBeenCalledWith(1, expect.objectContaining({
        removePhoto: true,
      }));
    });
  });

  it('should initialize form fields correctly', async () => {
    const { getByTestId } = renderWithProviders(<ProfileEdit />);

    await waitFor(() => {
      expect(getByTestId('selected-languages')).toHaveTextContent(
        JSON.stringify([{ languageCode: 'en', fluencyLevel: 4 }])
      );
      expect(getByTestId('selected-topics')).toHaveTextContent(
        JSON.stringify(['Technology'])
      );
    });
  });
});
