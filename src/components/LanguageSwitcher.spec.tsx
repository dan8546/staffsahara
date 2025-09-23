/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

// Mock i18n before tests
i18n.use(initReactI18next).init({
  lng: 'en-US',
  fallbackLng: 'en',
  resources: {
    en: { translation: {} },
    fr: { translation: {} },
    ar: { translation: {} },
  },
});

describe('LanguageSwitcher', () => {
  it('should display the correct flag and language code for a regional language', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    expect(screen.getByText('🇺🇸 EN')).toBeInTheDocument();
  });
});
