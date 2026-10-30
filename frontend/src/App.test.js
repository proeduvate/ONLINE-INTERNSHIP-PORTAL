import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './components/ui/Button';

test('renders Button component with children', () => {
  render(<Button>Click Me</Button>);
  const buttonElement = screen.getByText(/Click Me/i);
  expect(buttonElement).toBeInTheDocument();
});

test('disables Button when isLoading is true', () => {
  render(<Button isLoading={true}>Submit</Button>);
  const buttonElement = screen.getByRole('button');
  expect(buttonElement).toBeDisabled();
});
