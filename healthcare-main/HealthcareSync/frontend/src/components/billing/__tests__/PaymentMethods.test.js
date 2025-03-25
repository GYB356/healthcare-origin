import { render, screen, waitFor } from '@testing-library/react';
import PaymentMethods from '../PaymentMethods';

const mockPaymentMethods = [
  {
    id: '1',
    cardType: 'Visa',
    last4: '1234',
    expiry: '12/23',
    cardholderName: 'John Doe',
    isDefault: true,
  },
  {
    id: '2',
    cardType: 'MasterCard',
    last4: '5678',
    expiry: '11/24',
    cardholderName: 'Jane Smith',
    isDefault: false,
  },
];

// Test for rendering payment methods
it('renders payment methods list correctly', async () => {
  render(<PaymentMethods paymentMethods={mockPaymentMethods} />);

  await waitFor(() => {
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(mockPaymentMethods.length);

    expect(screen.getByText('Visa •••• 1234')).toBeInTheDocument();
    expect(screen.getByText('MasterCard •••• 5678')).toBeInTheDocument();
  });
});

// Test for no payment methods
it('displays message when no payment methods are present', async () => {
  render(<PaymentMethods paymentMethods={[]} />);

  await waitFor(() => {
    expect(screen.getByText('No payment methods available.')).toBeInTheDocument();
  });
});

// Test for setting default payment method
it('handles setting a default payment method', async () => {
  render(<PaymentMethods paymentMethods={mockPaymentMethods} />);

  await waitFor(() => {
    const defaultBadge = screen.getByText('Default');
    expect(defaultBadge).toBeInTheDocument();
  });
}); 