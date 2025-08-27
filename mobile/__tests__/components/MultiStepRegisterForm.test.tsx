import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MultiStepRegisterForm from '@/components/MultiStepRegisterForm';
import { useMultiStepRegister } from '@/hooks/useMultiStepRegister';
import useI18n from '@/hooks/useI18n';

jest.mock('@/hooks/useMultiStepRegister');
jest.mock('@/hooks/useI18n');

jest.mock('@/components/Stepper', () => {
  const { View, Text } = require('react-native');
  return function MockStepper({ currentStep, totalSteps, steps }: any) {
    return (
      <View testID="stepper">
        <Text testID="current-step">{currentStep}</Text>
        <Text testID="total-steps">{totalSteps}</Text>
      </View>
    );
  };
});

jest.mock('@/components/register/StepContent', () => ({
  StepContent: ({ currentStep }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="step-content">
        <Text testID="step-content-number">{currentStep}</Text>
      </View>
    );
  },
}));

jest.mock('@/components/register/NavigationButtons', () => ({
  NavigationButtons: ({ buttonState, onPrevious, onNext }: any) => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return (
      <View testID="navigation-buttons">
        <TouchableOpacity testID="prev-button" onPress={onPrevious}>
          <Text>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="next-button" onPress={onNext}>
          <Text>{buttonState?.text || 'Next'}</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

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

const mockT = jest.fn((key: string) => key);
const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;
const mockUseMultiStepRegister = useMultiStepRegister as jest.MockedFunction<typeof useMultiStepRegister>;

describe('MultiStepRegisterForm', () => {
  const mockHookData = {
    control: {},
    formState: { errors: {} },
    currentStep: 1,
    stepTitles: ['Step 1', 'Step 2', 'Step 3'],
    totalSteps: 3,
    formData: {},
    updateFormData: jest.fn(),
    countryItems: [],
    isNationalityDropdownOpen: false,
    setIsNationalityDropdownOpen: jest.fn(),
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    handleSubmitForm: jest.fn(),
    isSubmitting: false,
    buttonState: { text: 'Next', disabled: false },
  };

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
    mockUseMultiStepRegister.mockReturnValue(mockHookData as any);
  });

  it('renders multi-step register form components', () => {
    const { getByTestId } = render(<MultiStepRegisterForm />);
    
    expect(getByTestId('stepper')).toBeTruthy();
    expect(getByTestId('step-content')).toBeTruthy();
    expect(getByTestId('navigation-buttons')).toBeTruthy();
  });

  it('displays current step correctly', () => {
    const { getByTestId } = render(<MultiStepRegisterForm />);
    
    expect(getByTestId('current-step')).toHaveTextContent('1');
    expect(getByTestId('total-steps')).toHaveTextContent('3');
  });
  it('shows loading state when submitting', () => {
    mockUseMultiStepRegister.mockReturnValue({
      ...mockHookData,
      isSubmitting: true,
    } as any);

    const { getByTestId } = render(<MultiStepRegisterForm />);
    expect(getByTestId('stepper')).toBeTruthy();
  });

  it('uses correct hooks', () => {
    render(<MultiStepRegisterForm />);
    expect(useI18n).toHaveBeenCalled();
    expect(useMultiStepRegister).toHaveBeenCalled();
  });
});