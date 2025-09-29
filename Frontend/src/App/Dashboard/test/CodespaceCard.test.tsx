// CodespaceCard.test.tsx

// 👇 mock react-router at the very top, before imports
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  // keep all real exports
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

// Mock window.matchMedia for react-hot-toast etc.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import CodespaceCard from '../CodespaceCard';

// Mock ThemeProvider and CodespaceContext defaults
jest.mock('../../../Contexts/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      background: 'bg-white',
      surface: 'bg-gray-100',
      border: 'border-gray-200',
      text: 'text-black',
      textMuted: 'text-gray-500',
      surfaceSecondary: 'bg-gray-200',
      hover: 'hover:bg-gray-200',
      statusBar: 'bg-blue-500',
      statusText: 'text-white',
    },
  }),
}));
jest.mock('../../../Contexts/CodespaceContext', () => ({
  useCodespaceContext: () => ({
    deleteCodespace: jest.fn(),
    shareCodespaceByEmail: jest.fn(),
    editCodespace: jest.fn(),
  }),
}));

describe('CodespaceCard', () => {
  const codespace = {
    id: '1',
    name: 'My Codespace',
    description: 'A test codespace',
    createdAt: '2025-09-29',
    updatedAt: '2025-09-29',
    lastModified: '2025-09-29',
    created_at: '2025-09-29',
    owner: 'user1',
    collaborators: [],
    isPublic: false,
    role: 'Developer',
  };
  const viewMode = 'grid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders codespace name and role', () => {
    render(
      <MemoryRouter>
        <CodespaceCard codespace={codespace} viewMode={viewMode} />
      </MemoryRouter>
    );
    expect(screen.getByText('My Codespace')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText(/Created at/)).toBeInTheDocument();
  });

  test('shows and hides menu, triggers Edit modal', async () => {
    render(
      <MemoryRouter>
        <CodespaceCard codespace={codespace} viewMode={viewMode} />
      </MemoryRouter>
    );
    const menuBtn = screen.getAllByRole('button')[0];
    fireEvent.click(menuBtn);
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Edit/i));
    expect(screen.getByText(/Edit Codespace Name/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Cancel/i));
    await waitFor(() =>
      expect(
        screen.queryByText(/Edit Codespace Name/i)
      ).not.toBeInTheDocument()
    );
  });

  test('shows and hides Share modal', async () => {
    render(
      <MemoryRouter>
        <CodespaceCard codespace={codespace} viewMode={viewMode} />
      </MemoryRouter>
    );
    const menuBtn = screen.getAllByRole('button')[0];
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText(/Share/i));
    expect(screen.getByText(/Share Codespace/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Cancel/i));
    await waitFor(() =>
      expect(
        screen.queryByText(/Share Codespace/i)
      ).not.toBeInTheDocument()
    );
  });

  test('shows and hides Delete menu', () => {
    render(
      <MemoryRouter>
        <CodespaceCard codespace={codespace} viewMode={viewMode} />
      </MemoryRouter>
    );
    const menuBtn = screen.getAllByRole('button')[0];
    fireEvent.click(menuBtn);
    expect(screen.getByText(/Delete/i)).toBeInTheDocument();
  });

  test('edit codespace name (success and error)', async () => {
    const editCodespace = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    jest
      .spyOn(
        require('../../../Contexts/CodespaceContext'),
        'useCodespaceContext'
      )
      .mockReturnValue({
        deleteCodespace: jest.fn(),
        shareCodespaceByEmail: jest.fn(),
        editCodespace,
      });

    render(
      <MemoryRouter>
        <CodespaceCard codespace={codespace} viewMode={viewMode} />
      </MemoryRouter>
    );

    // success flow
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText(/Edit/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter new name/i), {
      target: { value: 'New Name' },
    });
    fireEvent.click(screen.getByText(/Save Changes/i));
    await screen.findByText('My Codespace');

    // error flow
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText(/Edit/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter new name/i), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByText(/Save Changes/i));
    expect(screen.getByText(/Edit Codespace Name/i)).toBeInTheDocument();
  });

  test('share codespace (success)', async () => {
    const shareCodespaceByEmail = jest.fn().mockResolvedValue(true);
    jest
      .spyOn(
        require('../../../Contexts/CodespaceContext'),
        'useCodespaceContext'
      )
      .mockReturnValue({
        deleteCodespace: jest.fn(),
        shareCodespaceByEmail,
        editCodespace: jest.fn(),
      });

    render(
      <MemoryRouter>
        <CodespaceCard codespace={codespace} viewMode={viewMode} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText(/Share/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByDisplayValue('Developer'), {
      target: { value: 'Admin' },
    });
    fireEvent.click(screen.getByText(/Send Invitation/i));
    await screen.findByText('My Codespace');
    expect(shareCodespaceByEmail).toHaveBeenCalledWith(
      '1',
      'test@example.com',
      'Admin'
    );
  });

  test('delete codespace', async () => {
    const deleteCodespace = jest.fn().mockResolvedValue(true);
    jest
      .spyOn(
        require('../../../Contexts/CodespaceContext'),
        'useCodespaceContext'
      )
      .mockReturnValue({
        deleteCodespace,
        shareCodespaceByEmail: jest.fn(),
        editCodespace: jest.fn(),
      });

    render(
      <MemoryRouter>
        <CodespaceCard codespace={codespace} viewMode={viewMode} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText(/Delete/i));
    await waitFor(() =>
      expect(deleteCodespace).toHaveBeenCalledWith('1')
    );
  });

  test('navigates to codeeditor on card click', () => {
    render(
      <MemoryRouter>
        <CodespaceCard codespace={codespace} viewMode={viewMode} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('My Codespace'));
    expect(mockNavigate).toHaveBeenCalledWith('/codeeditor/1');
  });

  test('renders in list view', () => {
    render(
      <MemoryRouter>
        <CodespaceCard codespace={codespace} viewMode="list" />
      </MemoryRouter>
    );
    expect(screen.getByText('My Codespace')).toBeInTheDocument();
  });
});
