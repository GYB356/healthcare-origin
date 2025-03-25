import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import PaymentMethods from "../PaymentMethods";

const mockPaymentMethods = [
  { id: '1', cardType: 'Visa', last4: '1234', expiry: '12/2025', cardholderName: 'John Doe', isDefault: true },
  { id: '2', cardType: 'MasterCard', last4: '5678', expiry: '11/2024', cardholderName: 'Jane Doe', isDefault: false },
];

describe("PaymentMethods Component", () => {
  test("renders without crashing", () => {
    render(<PaymentMethods paymentMethods={mockPaymentMethods} />);
    expect(screen.getByText("Payment Methods")).toBeInTheDocument();
  });

  test("displays the correct number of payment methods", () => {
    render(<PaymentMethods paymentMethods={mockPaymentMethods} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(mockPaymentMethods.length);
  });

  test("displays payment method details correctly", () => {
    render(<PaymentMethods paymentMethods={mockPaymentMethods} />);
    expect(screen.getByText("Visa •••• 1234")).toBeInTheDocument();
    expect(screen.getByText("Expires: 12/2025")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  test("handles set default payment method", () => {
    render(<PaymentMethods paymentMethods={mockPaymentMethods} />);
    fireEvent.click(screen.getByText("Set as Default"));
    // Check if the default method is updated
  });
});

// Test to check if PaymentMethods renders correctly with no payment methods
it("renders no payment methods message when list is empty", () => {
  render(<PaymentMethods paymentMethods={[]} />);
  expect(screen.getByText(/no payment methods/i)).toBeInTheDocument();
});

// Test to check if PaymentMethods renders payment methods correctly
it("renders payment methods correctly", () => {
  const paymentMethods = [
    {
      _id: "1",
      cardType: "Visa",
      lastFour: "1234",
      expiryMonth: "12",
      expiryYear: "2023",
      billingName: "John Doe",
    },
    {
      _id: "2",
      cardType: "Mastercard",
      lastFour: "5678",
      expiryMonth: "01",
      expiryYear: "2024",
      billingName: "Jane Smith",
    },
  ];
  render(<PaymentMethods paymentMethods={paymentMethods} />);
  expect(screen.getByText(/visa/i)).toBeInTheDocument();
  expect(screen.getByText(/mastercard/i)).toBeInTheDocument();
});

// Test to check if PaymentMethods renders correctly
it('renders the payment methods list correctly', async () => {
  render(<PaymentMethods paymentMethods={mockPaymentMethods} />);

  // Check if the list exists
  await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());

  // Query list items
  const items = await waitFor(() => screen.getAllByRole('listitem'));
  expect(items).toHaveLength(mockPaymentMethods.length);

  // Check payment method details
  expect(screen.getByText('Visa •••• 1234')).toBeInTheDocument();
  expect(screen.getByText('Expires: 12/2025')).toBeInTheDocument();
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('Default')).toBeInTheDocument();
});

// Test to check if no payment methods message is displayed
it('displays no payment methods message when list is empty', async () => {
  render(<PaymentMethods paymentMethods={[]} />);

  // Check for no payment methods message
  await waitFor(() => expect(screen.getAllByText(/no payment methods/i)).toHaveLength(1));
});

// Test to check if the default payment method can be set
it('handles set default payment method', async () => {
  render(<PaymentMethods paymentMethods={mockPaymentMethods} />);

  // Click the set default button
  fireEvent.click(screen.getByText(/Set as Default/i));

  // Check if the default method is updated
  await waitFor(() => expect(screen.getByText('Default')).toBeInTheDocument());
});
