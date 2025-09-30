import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from '../../Contexts/ThemeProvider';
import Login from '../login';

jest.mock('../../database/superbase');

describe('Login', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Login />
        </ThemeProvider>
      </MemoryRouter>
    );
  });
});
