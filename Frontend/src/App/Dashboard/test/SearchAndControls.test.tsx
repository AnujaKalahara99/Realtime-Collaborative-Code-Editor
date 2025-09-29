import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchAndControls from '../SearchAndControls';

jest.mock('../../../Contexts/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      text: 'text-black',
      textSecondary: 'text-gray-400',
      hover: 'hover:bg-gray-200',
      active: 'bg-blue-100',
    },
  }),
}));

describe('SearchAndControls', () => {
  test('renders search input and buttons', () => {
    render(
      <SearchAndControls
        searchQuery="foo"
        setSearchQuery={() => {}}
        viewMode="grid"
        setViewMode={() => {}}
      />
    );
    expect(screen.getByPlaceholderText(/Search Codespaces/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  test('calls setSearchQuery on input', () => {
    const setSearchQuery = jest.fn();
    render(
      <SearchAndControls
        searchQuery=""
        setSearchQuery={setSearchQuery}
        viewMode="grid"
        setViewMode={() => {}}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Search Codespaces/i), { target: { value: 'bar' } });
    expect(setSearchQuery).toHaveBeenCalledWith('bar');
  });

  test('calls setViewMode on button click', () => {
    const setViewMode = jest.fn();
    render(
      <SearchAndControls
        searchQuery=""
        setSearchQuery={() => {}}
        viewMode="grid"
        setViewMode={setViewMode}
      />
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // list view
    expect(setViewMode).toHaveBeenCalledWith('list');
    fireEvent.click(buttons[0]); // grid view
    expect(setViewMode).toHaveBeenCalledWith('grid');
  });
});
