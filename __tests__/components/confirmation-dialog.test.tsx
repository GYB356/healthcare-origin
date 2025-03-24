import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

describe("ConfirmationDialog", () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Delete Item",
    description: "Are you sure you want to delete this item?",
    confirmText: "Delete",
    cancelText: "Cancel",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog with correct content when open", () => {
    render(<ConfirmationDialog {...mockProps} />);

    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this item?")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<ConfirmationDialog {...mockProps} isOpen={false} />);

    expect(screen.queryByText("Delete Item")).not.toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    render(<ConfirmationDialog {...mockProps} />);

    fireEvent.click(screen.getByText("Delete"));
    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<ConfirmationDialog {...mockProps} />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("uses default button text when not provided", () => {
    const { onConfirm, onClose, title, description } = mockProps;
    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        description={description}
      />,
    );

    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
