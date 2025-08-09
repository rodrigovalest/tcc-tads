import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Register from '@/app/(public)/(auth)/register';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@/components/RegisterForm', () => () => <></>);

describe('Register screen', () => {
  it('renders logo, texts and buttons', () => {
    const { getByText, getByTestId } = render(<Register />);

    expect(getByTestId('register-screen-safe-area-view')).toBeTruthy();
    expect(getByText('Calle')).toBeTruthy();
    expect(getByText('Create account')).toBeTruthy();
    expect(getByText('Register with Google')).toBeTruthy();
  });

  it('navigates to login screen when pressing back button', () => {
    const { getByTestId } = render(<Register />);
    const backButton = getByTestId('go-to-login-button');

    fireEvent.press(backButton);

    expect(router.replace).toHaveBeenCalledWith('/(public)/(auth)/login');
  });
});
