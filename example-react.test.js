import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component
const TestComponent = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>This is a test component</p>
    </div>
  );
};

describe('React Component Test', () => {
  it('renders the component with title', () => {
    render(<TestComponent title="Hello World" />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('This is a test component')).toBeInTheDocument();
  });
}); 