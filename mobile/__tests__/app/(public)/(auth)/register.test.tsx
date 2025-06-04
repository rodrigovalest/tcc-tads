import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Register from '@/app/(public)/(auth)/register';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@/components/RegisterForm', () => () => {
  return <></>;
});

describe('Register screen', () => {
  it('renders logo, texts and buttons', () => {
    const { getByText, getByTestId } = render(<Register />);

    expect(getByTestId('register-screen-safe-area-view')).toBeTruthy();
    expect(getByText('Calle')).toBeTruthy();
    expect(getByText('Create an account')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('navigates to login screen when pressing "Login"', () => {
    const { getByText } = render(<Register />);
    const loginButton = getByText('Login');

    fireEvent.press(loginButton);

    expect(router.replace).toHaveBeenCalledWith('/(public)/(auth)/login');
  });
});