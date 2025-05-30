import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Login from '@/app/(public)/(auth)/login';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@/components/LoginForm', () => () => {
  return <></>;
});

describe('Login screen', () => {
  it('renders logo, texts and buttons', () => {
    const { getByText, getByTestId } = render(<Login />);

    expect(getByTestId('login-screen-safe-area-view')).toBeTruthy();
    expect(getByText('Calle')).toBeTruthy();
    expect(getByText('Log in or sign up')).toBeTruthy();
    expect(getByText('Login with Google')).toBeTruthy();
    expect(getByText('Create an account')).toBeTruthy();
  });

  it('navigates to register screen when pressing "Create an account"', () => {
    const { getByText } = render(<Login />);
    const createAccountButton = getByText('Create an account');

    fireEvent.press(createAccountButton);

    expect(router.replace).toHaveBeenCalledWith('/(public)/(auth)/register');
  });
});
