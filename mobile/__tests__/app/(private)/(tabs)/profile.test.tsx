import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Profile from '@/app/(private)/(tabs)/profile';
import useAuthStore from '@/store/auth-store';
import useI18n from '@/hooks/useI18n';
import userService from '@/services/user-service';

// Mock dependencies
jest.mock('@/store/auth-store');
jest.mock('@/hooks/useI18n');
jest.mock('@/services/user-service');
jest.mock('expo-router', () => {
  const mockReact = require('react');
  return {
    Link: ({ children, href, asChild, ...props }: any) => {
      const { TouchableOpacity } = require('react-native');
      if (asChild) {
        return mockReact.cloneElement(children, { testID: `link-${href}`, ...props });
      }
      return (
        <TouchableOpacity testID={`link-${href}`} {...props}>
          {children}
        </TouchableOpacity>
      );
    },
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`} {...props}>{name}</Text>;
  },
  MaterialCommunityIcons: ({ name, size, color, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`} {...props}>{name}</Text>;
  },
}));

jest.mock('@/components/Spinner', () => {
  const { View, Text } = require('react-native');
  return function MockSpinner() {
    return (
      <View testID="spinner">
        <Text>Loading...</Text>
      </View>
    );
  };
});

jest.mock('@/utils/country-language-utils', () => ({
  getCountryData: jest.fn((code: string) => ({
    name: `Country ${code}`,
    flag: '🏳️',
    code,
  })),
  getLanguageData: jest.fn((code: string) => ({
    name: `Language ${code}`,
    flag: '🌐',
    code,
  })),
}));

const mockT = jest.fn((key: string) => {
  const translations: { [key: string]: string } = {
    'profile.loading': 'Loading profile...',
    'profile.errorLoading': 'Error loading profile',
    'common.tryAgain': 'Try again',
    'profile.aboutMe': 'About me',
    'profile.languages': 'Languages',
    'profile.interests': 'Interests',
    'profile.editProfile': 'Edit Profile',
    'profile.fluency.beginner': 'Beginner',
    'profile.fluency.intermediate': 'Intermediate',
    'profile.fluency.advanced': 'Advanced',
    'profile.fluency.fluent': 'Fluent',
    'profile.fluency.native': 'Native',
    'profile.fluency.unknown': 'Unknown',
  };
  return translations[key] || key;
});

const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUserService = userService as jest.Mocked<typeof userService>;

const mockUser = {
  sub: 1,
  username: 'testuser',
  email: 'test@example.com',
};

const mockFullUser = {
  id: 1,
  name: 'Test User',
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
    {
      id: 2,
      languageCode: 'pt',
      fluencyLevel: 5,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
  interestTopics: [
    {
      id: 1,
      topic: 'Technology',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      topic: 'Music',
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
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

describe('Profile Screen', () => {
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
    mockUserService.findById.mockResolvedValue(mockFullUser);
  });

  it('should render loading state initially', async () => {
    const { getByTestId, getByText } = renderWithProviders(<Profile />);

    expect(getByTestId('spinner')).toBeTruthy();
    expect(getByText('Loading profile...')).toBeTruthy();
  });

  it('should render user profile data after loading', async () => {
    const { getByText, queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('@testuser')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
    expect(getByText('This is a test description')).toBeTruthy();
    expect(getByText('Country BR')).toBeTruthy();
  });

  it('should render languages section', async () => {
    const { getByText, queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    expect(getByText('Languages')).toBeTruthy();
    expect(getByText('Language en')).toBeTruthy();
    expect(getByText('Language pt')).toBeTruthy();
    expect(getByText('Fluent')).toBeTruthy();
    expect(getByText('Native')).toBeTruthy();
  });

  it('should render interests section', async () => {
    const { getByText, queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    expect(getByText('Interests')).toBeTruthy();
    expect(getByText('Technology')).toBeTruthy();
    expect(getByText('Music')).toBeTruthy();
  });

  it('should render edit profile button', async () => {
    const { getByText, queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    expect(getByText('Edit Profile')).toBeTruthy();
  });

  it('should handle error state', async () => {
    mockUserService.findById.mockRejectedValue(new Error('Network error'));

    const { getByText, queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    expect(getByText('Error loading profile')).toBeTruthy();
    expect(getByText('Try again')).toBeTruthy();
  });

  it('should handle user without photo', async () => {
    const userWithoutPhoto = { ...mockFullUser, photoUri: undefined };
    mockUserService.findById.mockResolvedValue(userWithoutPhoto);

    const { getByTestId, getByText, queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    expect(getByTestId('icon-account')).toBeTruthy();
    expect(getByText('Test User')).toBeTruthy();
  });

  it('should display user status indicator', async () => {
    const { queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    // Check for active status (green indicator)
    // The exact implementation would depend on how the status indicator is styled
  });

  it('should handle user without description', async () => {
    const userWithoutDescription = { ...mockFullUser, personalDescription: undefined };
    mockUserService.findById.mockResolvedValue(userWithoutDescription);

    const { queryByText, queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    expect(queryByText('About me')).toBeFalsy();
  });

  it('should handle user without languages', async () => {
    const userWithoutLanguages = { ...mockFullUser, languages: [] };
    mockUserService.findById.mockResolvedValue(userWithoutLanguages);

    const { queryByText, queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    expect(queryByText('Languages')).toBeFalsy();
  });

  it('should handle user without interests', async () => {
    const userWithoutInterests = { ...mockFullUser, interestTopics: [] };
    mockUserService.findById.mockResolvedValue(userWithoutInterests);

    const { queryByText, queryByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(queryByTestId('spinner')).toBeNull();
    });

    expect(queryByText('Interests')).toBeFalsy();
  });
});
