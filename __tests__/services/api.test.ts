import { fetchApi } from "@/lib/api";

// Mock fetch globally
global.fetch = jest.fn();

describe("API Service", () => {
  beforeEach(() => {
    // Clear mock before each test
    jest.clearAllMocks();
  });

  it("makes GET requests correctly", async () => {
    const mockResponse = { data: "test" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchApi("/test");

    expect(global.fetch).toHaveBeenCalledWith("/api/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it("makes POST requests with correct body", async () => {
    const mockData = { name: "Test" };
    const mockResponse = { id: 1, ...mockData };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchApi("/test", {
      method: "POST",
      body: mockData,
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockData),
    });
    expect(result).toEqual(mockResponse);
  });

  it("throws error for failed requests", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(fetchApi("/test")).rejects.toThrow("404 Not Found");
  });

  it("handles network errors correctly", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchApi("/test")).rejects.toThrow("Network error");
  });

  it("handles JSON parsing errors correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error("Invalid JSON")),
    });

    await expect(fetchApi("/test")).rejects.toThrow("Invalid JSON");
  });
});
