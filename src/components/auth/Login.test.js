import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login.jsx';
import { AuthContext } from '../../contexts/AuthContext';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  const renderLogin = () => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    renderLogin();
    const email = 'test@example.com';
    const password = 'password123';

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(email, password);
    });
  });

  it('shows error message on invalid submission', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('navigates to dashboard on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
}); 