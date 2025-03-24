import { render, screen } from "@testing-library/react";
import { MedicalRecordSkeleton } from "@/components/skeletons/medical-record-skeleton";

describe("MedicalRecordSkeleton", () => {
  it("renders the skeleton loader", () => {
    render(<MedicalRecordSkeleton />);

    // Check for skeleton elements
    expect(screen.getByTestId("medical-record-skeleton")).toBeInTheDocument();
    expect(screen.getAllByTestId("skeleton-line")).toHaveLength(3);
  });
});
