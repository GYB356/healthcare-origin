import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/error-boundary";

const ThrowError = () => {
  throw new Error("Test error");
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render children when there is no error", () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    expect(container).toHaveTextContent("Test content");
  });

  it("should render error UI when an error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it("should call onReset when try again button is clicked", () => {
    const onReset = jest.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByText(/Try again/i));
    expect(onReset).toHaveBeenCalled();
  });
});
