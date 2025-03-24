import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Billing from "../Billing";
import { AuthContext } from "../../contexts/AuthContext";

describe("Billing Component", () => {
  const mockUser = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "PATIENT",
  };

  const mockBillingData = {
    invoices: [
      {
        id: 1,
        amount: 100,
        date: "2024-03-20",
        status: "PENDING",
      },
    ],
    insurance: {
      provider: "Test Insurance",
      policyNumber: "12345",
    },
  };

  it("renders billing information", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Billing data={mockBillingData} />
      </AuthContext.Provider>,
    );

    expect(screen.getByText("Billing Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Test Insurance")).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("handles payment submission", () => {
    const mockHandlePayment = jest.fn();

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Billing data={mockBillingData} onPayment={mockHandlePayment} />
      </AuthContext.Provider>,
    );

    fireEvent.click(screen.getByText("Pay Now"));
    expect(mockHandlePayment).toHaveBeenCalledWith(1);
  });
});
