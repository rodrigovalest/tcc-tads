import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterForm from '@/components/RegisterForm';
import { useRegisterForm } from '@/hooks/useRegisterForm';

jest.mock('@/hooks/useRegisterForm');

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

// Mock do react-hook-form Controller
jest.mock('react-hook-form', () => ({
  Controller: ({ render, name }: any) => {
    const fieldProps = {
      field: {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        name,
      },
      fieldState: {
        error: undefined,
      },
      formState: {
        errors: {},
      },
    };
    return render(fieldProps);
  },
}));

describe('RegisterForm', () => {
  const mockOnSubmit = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockUseRegisterForm = {
    control: {},
    handleSubmit: mockHandleSubmit,
    formState: { errors: {} },
    onSubmit: mockOnSubmit,
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleSubmit.mockImplementation((fn) => () => {
      fn({
        username: 'testuser',
        email: 'user@example.com',
        password: '123456',
        confirmPassword: '123456',
        nationality: 'AD',
      });
    });

    (useRegisterForm as jest.Mock).mockReturnValue(mockUseRegisterForm);
  });

  it('renders inputs and button', () => {
    const { getByPlaceholderText, getByTestId } = render(<RegisterForm />);

    expect(getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm your password')).toBeTruthy();
    expect(getByTestId('nationality-dropdown')).toBeTruthy();
    expect(getByTestId('register-button')).toBeTruthy();
  });

  it('calls onSubmit with correct values on valid form submission', async () => {
    const { getByTestId } = render(<RegisterForm />);

    fireEvent.press(getByTestId('register-button'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'user@example.com',
        password: '123456',
        confirmPassword: '123456',
        nationality: 'AD',
      });
    });
  });

  it('shows loading state when isSubmitting is true', () => {
    (useRegisterForm as jest.Mock).mockReturnValue({
      ...mockUseRegisterForm,
      isSubmitting: true,
    });

    const { getByText } = render(<RegisterForm />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('displays register text when not submitting', () => {
    const { getByText } = render(<RegisterForm />);
    expect(getByText('Register')).toBeTruthy();
  });

  it('opens dropdown when trigger is pressed', () => {
    const { getByTestId, queryByTestId } = render(<RegisterForm />);

    expect(queryByTestId('nationality-dropdown-options')).toBeFalsy();

    fireEvent.press(getByTestId('nationality-dropdown-trigger'));
    expect(getByTestId('nationality-dropdown-options')).toBeTruthy();
  });

  it('handles form submission correctly', () => {
    const { getByTestId } = render(<RegisterForm />);
    const button = getByTestId('register-button');

    fireEvent.press(button);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});