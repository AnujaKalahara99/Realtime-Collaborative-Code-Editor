import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateCodespaceCard from '../CreateCodespaceCard';

jest.mock('../../../Contexts/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      surface: 'bg-white',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-200',
      textMuted: 'text-gray-500',
      textSecondary: 'text-gray-400',
    },
  }),
}));

describe('CreateCodespaceCard', () => {
  test('renders with grid view', () => {
    const onClick = jest.fn();
    render(<CreateCodespaceCard viewMode="grid" onClick={onClick} />);
  expect(screen.getByText(/Create New Codespace/i)).toBeInTheDocument();
  });

  test('renders with list view', () => {
    const onClick = jest.fn();
    render(<CreateCodespaceCard viewMode="list" onClick={onClick} />);
    expect(screen.getByText(/Create New Codespace/i)).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<CreateCodespaceCard viewMode="grid" onClick={onClick} />);
    fireEvent.click(screen.getByText(/Create New Codespace/i));
    expect(onClick).toHaveBeenCalled();
  });
});
