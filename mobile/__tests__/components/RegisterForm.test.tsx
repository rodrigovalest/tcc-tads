import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterForm from '@/components/RegisterForm';
import { useRegister } from '@/hooks/useRegister';

jest.mock('@/hooks/useRegister');
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));
jest.mock('@/store/auth-store', () => ({
  __esModule: true,
  default: () => ({
    login: jest.fn(),
  }),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(),
  multiGet: jest.fn(() => Promise.resolve([['user', null], ['token', null]])),
  multiRemove: jest.fn(),
}));
jest.mock('react-native-dropdown-picker', () => {
  return ({ placeholder, setValue, value, items, open, setOpen }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return (
      <View testID="nationality-dropdown">
        <TouchableOpacity 
          testID="nationality-dropdown-trigger"
          onPress={() => setOpen(!open)}
        >
          <Text>{value ? items?.find((item: any) => item.value === value)?.label : placeholder}</Text>
        </TouchableOpacity>
        
        {open && (
          <View testID="nationality-dropdown-options">
            {items?.slice(0, 3).map((item: any) => (
              <TouchableOpacity
                key={item.value}
                testID={`nationality-option-${item.value}`}
                onPress={() => {
                  setValue(item.value);
                  setOpen(false);
                }}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };
});

describe('RegisterForm', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRegister as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });
  });

  it('renders inputs and button', () => {
    const { getByPlaceholderText, getByTestId } = render(<RegisterForm />);

    expect(getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByTestId('nationality-dropdown')).toBeTruthy();
    expect(getByTestId('register-button')).toBeTruthy();
  });

  it('calls mutate with correct values on valid form submission', async () => {
    const { getByPlaceholderText, getByTestId } = render(<RegisterForm />);

    fireEvent.changeText(getByPlaceholderText('Enter your username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), '123456');
    
    // Open dropdown and select first option
    fireEvent.press(getByTestId('nationality-dropdown-trigger'));
    fireEvent.press(getByTestId('nationality-option-AD'));

    fireEvent.press(getByTestId('register-button'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'user@example.com',
        password: '123456',
        nationality: 'AD',
      });
    });
  });

  it('shows loading state when isPending is true', () => {
    (useRegister as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    });

    const { getByText } = render(<RegisterForm />);

    expect(getByText('Loading...')).toBeTruthy();
  });
});