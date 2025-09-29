import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TitleBar from '../TitleBar';

jest.mock('react-router', () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock('../../../Contexts/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      surface: 'bg-white',
      border: 'border-gray-200',
      text: 'text-black',
      textSecondary: 'text-gray-400',
      hover: 'hover:bg-gray-200',
    },
  }),
}));
jest.mock('../../../database/superbase', () => ({
  supabase: { auth: { signOut: jest.fn() } },
}));
jest.mock('../../../components/ThemeToggleBtn', () => () => <div data-testid="theme-toggle">ThemeToggle</div>);

describe('TitleBar', () => {
  const session = {
    user: {
      user_metadata: { avatar_url: 'http://avatar.com/img.png' },
    },
  };

  test('renders title, avatar, sign out, and theme toggle', () => {
    render(<TitleBar Session={session} />);
    expect(screen.getByText('Codespaces')).toBeInTheDocument();
    expect(screen.getByAltText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('calls signOut on button click', async () => {
    const { supabase } = require('../../../database/superbase');
    render(<TitleBar Session={session} />);
    fireEvent.click(screen.getByText('Sign Out'));
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  test('calls goToProfile on avatar click', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router'), 'useNavigate').mockReturnValue(mockNavigate);
    render(<TitleBar Session={session} />);
    fireEvent.click(screen.getByAltText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
