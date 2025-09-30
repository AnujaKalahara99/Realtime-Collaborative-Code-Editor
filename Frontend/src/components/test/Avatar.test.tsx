import React from 'react';
import { render } from '@testing-library/react';
import Avatar from '../Avatar';

describe('Avatar', () => {
  it('renders without crashing', () => {
    render(<Avatar name="Test User" />);
  });
});
