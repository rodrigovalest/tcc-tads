import React from 'react';
import { render } from '@testing-library/react-native';
import Index from '@/app/index';

describe('<Index />', () => {
  it('should render the correct text', () => {
    const { getByText } = render(<Index />);
    expect(getByText('Edit app/index.tsx to edit this screen')).toBeTruthy();
  });
});
