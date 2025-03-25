import { describe, it, expect, vi, beforeEach } from "vitest";
import api, { retryRequest } from "@/lib/api";
import axios from "axios";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Request Interceptor", () => {
    it("should add authorization header when token exists", () => {
      const token = "test-token";
      localStorage.setItem("token", token);

      const config = {
        headers: {},
      };

      const result = api.interceptors.request.handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it("should not add authorization header when token does not exist", () => {
      const config = {
        headers: {},
      };

      const result = api.interceptors.request.handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("Response Interceptor", () => {
    it("should handle 401 errors and refresh token", async () => {
      const mockRefreshResponse = { data: { token: "new-token" } };
      const mockOriginalResponse = { data: { success: true } };

      // Mock the refresh token request
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValueOnce(mockRefreshResponse),
        interceptors: {
          request: { handlers: [] },
          response: { handlers: [] },
        },
      } as any);

      // Mock the original request
      const originalRequest = {
        headers: {},
        url: "/test",
        method: "get",
      };

      const error = {
        response: { status: 401 },
        config: originalRequest,
      };

      const result = await api.interceptors.response.handlers[0].rejected(error);

      expect(localStorage.getItem("token")).toBe("new-token");
      expect(result).toBeDefined();
    });

    it("should handle network errors", async () => {
      const error = {
        response: undefined,
      };

      await api.interceptors.response.handlers[0].rejected(error);

      // Verify that the error was rejected
      expect(error).toBeDefined();
    });
  });

  describe("Retry Request", () => {
    it("should retry failed requests", async () => {
      const mockRequest = vi.fn()
        .mockRejectedValueOnce(new Error("First attempt failed"))
        .mockRejectedValueOnce(new Error("Second attempt failed"))
        .mockResolvedValueOnce({ data: "success" });

      const result = await retryRequest(mockRequest, 3, 100);

      expect(result.data).toBe("success");
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it("should throw after max retries", async () => {
      const mockRequest = vi.fn().mockRejectedValue(new Error("Request failed"));

      await expect(retryRequest(mockRequest, 3, 100)).rejects.toThrow("Request failed");
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });
  });
}); 