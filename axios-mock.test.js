// Import the mock directly
const axios = require(".//__mocks__/axios");

describe("Axios Mock Test", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("mocks axios get request", async () => {
    const mockData = { name: "John", age: 30 };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const response = await axios.get("/api/user");

    expect(axios.get).toHaveBeenCalledWith("/api/user");
    expect(response.data).toEqual(mockData);
  });

  it("mocks axios post request", async () => {
    const requestData = { name: "Jane", age: 25 };
    const mockResponse = { id: 1, ...requestData };
    axios.post.mockResolvedValueOnce({ data: mockResponse });

    const response = await axios.post("/api/user", requestData);

    expect(axios.post).toHaveBeenCalledWith("/api/user", requestData);
    expect(response.data).toEqual(mockResponse);
  });

  it("handles axios error", async () => {
    const errorMessage = "Network Error";
    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    await expect(axios.get("/api/user")).rejects.toThrow(errorMessage);
  });
});
