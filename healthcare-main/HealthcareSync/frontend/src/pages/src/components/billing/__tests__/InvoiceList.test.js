import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import InvoiceList from "../InvoiceList";

const mockInvoices = [
  { id: '1', number: 'INV-001', patient: 'John Doe', amount: 100, status: 'Paid' },
  { id: '2', number: 'INV-002', patient: 'Jane Smith', amount: 200, status: 'Pending' },
];

describe("InvoiceList Component", () => {
  test("renders without crashing", () => {
    render(<InvoiceList invoices={mockInvoices} />);
    expect(screen.getByText("Invoices")).toBeInTheDocument();
  });

  test("displays the correct number of invoices", () => {
    render(<InvoiceList invoices={mockInvoices} />);
    expect(screen.getAllByRole("row")).toHaveLength(mockInvoices.length + 1); // +1 for the header row
  });

  test("renders invoice list correctly", async () => {
    render(<InvoiceList invoices={mockInvoices} />);
    
    // Check if the table exists
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

    // Query table rows
    const rows = await waitFor(() => screen.getAllByRole('row'));
    expect(rows).toHaveLength(mockInvoices.length + 1); // +1 for the header row

    // Check invoice details
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });
});

// Test to check if InvoiceList renders correctly with no invoices
it("renders no invoices message when invoice list is empty", async () => {
  render(<InvoiceList invoices={[]} />);
  expect(screen.getByText('No invoices found')).toBeInTheDocument();
});

// Test to check if InvoiceList renders invoices correctly
it("renders invoices correctly", () => {
  const invoices = [
    { _id: "1", number: "INV-001", amount: 100, dueDate: "2023-12-31" },
    { _id: "2", number: "INV-002", amount: 200, dueDate: "2024-01-15" },
  ];
  render(<InvoiceList invoices={invoices} />);
  expect(screen.getByText(/inv-001/i)).toBeInTheDocument();
  expect(screen.getByText(/inv-002/i)).toBeInTheDocument();
});
