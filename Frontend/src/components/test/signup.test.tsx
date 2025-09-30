import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from '../../Contexts/ThemeProvider';
import Signup from '../signup';
jest.mock('../../database/superbase');
describe('Signup', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Signup />
        </ThemeProvider>
      </MemoryRouter>
    );
  });
});
