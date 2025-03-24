import axios from "axios";

// Mock axios
jest.mock("axios");

describe("API Service", () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  it("should make GET request with correct parameters", async () => {
    const mockResponse = { data: { test: "data" }, status: 200 };
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

    const { api } = require("../../services/api");
    const response = await api.get("/test");

    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/test");
    expect(response).toEqual(mockResponse);
  });

  it("should make POST request with correct parameters", async () => {
    const mockData = { test: "data" };
    const mockResponse = { data: mockData, status: 200 };
    mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

    const { api } = require("../../services/api");
    const response = await api.post("/test", mockData);

    expect(mockAxiosInstance.post).toHaveBeenCalledWith("/test", mockData);
    expect(response).toEqual(mockResponse);
  });

  it("should make PUT request with correct parameters", async () => {
    const mockData = { test: "data" };
    const mockResponse = { data: mockData, status: 200 };
    mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

    const { api } = require("../../services/api");
    const response = await api.put("/test", mockData);

    expect(mockAxiosInstance.put).toHaveBeenCalledWith("/test", mockData);
    expect(response).toEqual(mockResponse);
  });

  it("should make DELETE request with correct parameters", async () => {
    const mockResponse = { data: null, status: 200 };
    mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse);

    const { api } = require("../../services/api");
    const response = await api.delete("/test");

    expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/test");
    expect(response).toEqual(mockResponse);
  });

  it("should handle errors correctly", async () => {
    const mockError = new Error("Network error");
    mockAxiosInstance.get.mockRejectedValueOnce(mockError);

    const { api } = require("../../services/api");
    await expect(api.get("/test")).rejects.toThrow("Network error");
  });
});
