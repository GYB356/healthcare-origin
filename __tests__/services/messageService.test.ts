import {
  sendMessage,
  getMessages,
  markAsRead,
  subscribeToNewMessages,
  unsubscribeFromNewMessages,
} from "@/services/messageService";
import { Message } from "@/types/Message";
import { setupTestDB, clearTestDB, closeTestDB, seedTestDB } from "@/utils/testDbHelper";
import axios from "axios";
import { io, Socket } from "socket.io-client";

// Mock axios for API calls
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock socket.io-client
jest.mock("socket.io-client");
const mockedIO = io as jest.MockedFunction<typeof io>;
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
} as unknown as jest.Mocked<Socket>;

// Mock event handler
const mockMessageHandler = jest.fn();

describe("Message Service", () => {
  // Sample message data
  const mockMessage: Partial<Message> = {
    senderId: "test-doctor-1",
    recipientId: "test-patient-1",
    content: "Hello, how are you feeling today?",
    timestamp: new Date("2025-04-15T10:30:00"),
  };

  const mockMessageResponse = {
    ...mockMessage,
    id: "msg-123",
    read: false,
    timestamp: new Date("2025-04-15T10:30:00").toISOString(),
  };

  // Setup and teardown for MongoDB-dependent tests
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    mockedIO.mockReturnValue(mockSocket);

    // Seed the test database with data
    await seedTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  // Tests for sendMessage
  describe("sendMessage", () => {
    it("should send a message via API and return the response", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockMessageResponse });

      const result = await sendMessage(mockMessage);

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/messages", mockMessage);
      expect(result).toEqual({
        success: true,
        message: mockMessageResponse,
      });
    });

    it("should validate the required fields before sending", async () => {
      // Missing required fields
      const invalidMessage = {
        senderId: "test-doctor-1",
        // Missing recipientId and content
      };

      const result = await sendMessage(invalidMessage as any);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("required"),
      });
    });

    it("should handle API errors when sending a message", async () => {
      const errorResponse = {
        response: {
          data: {
            message: "User not authorized to send messages",
          },
          status: 403,
        },
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      const result = await sendMessage(mockMessage);

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/messages", mockMessage);
      expect(result).toEqual({
        success: false,
        error: "User not authorized to send messages",
      });
    });
  });

  // Tests for getMessages
  describe("getMessages", () => {
    it("should fetch messages between users", async () => {
      const mockMessages = [mockMessageResponse];
      mockedAxios.get.mockResolvedValueOnce({ data: mockMessages });

      const result = await getMessages({
        senderId: "test-doctor-1",
        recipientId: "test-patient-1",
      });

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/messages", {
        params: {
          senderId: "test-doctor-1",
          recipientId: "test-patient-1",
        },
      });
      expect(result).toEqual({
        success: true,
        messages: mockMessages,
      });
    });

    it("should fetch all messages for a user when only userId is provided", async () => {
      const mockMessages = [mockMessageResponse];
      mockedAxios.get.mockResolvedValueOnce({ data: mockMessages });

      const result = await getMessages({ userId: "test-doctor-1" });

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/messages", {
        params: {
          userId: "test-doctor-1",
        },
      });
      expect(result).toEqual({
        success: true,
        messages: mockMessages,
      });
    });

    it("should handle pagination when fetching messages", async () => {
      const mockMessages = [mockMessageResponse];
      mockedAxios.get.mockResolvedValueOnce({ data: mockMessages });

      const result = await getMessages({
        userId: "test-doctor-1",
        page: 2,
        limit: 10,
      });

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/messages", {
        params: {
          userId: "test-doctor-1",
          page: 2,
          limit: 10,
        },
      });
      expect(result).toEqual({
        success: true,
        messages: mockMessages,
      });
    });

    it("should handle API errors when fetching messages", async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: "Failed to fetch messages" },
          status: 500,
        },
      });

      const result = await getMessages({ userId: "test-doctor-1" });

      expect(result).toEqual({
        success: false,
        error: "Failed to fetch messages",
        messages: [],
      });
    });
  });

  // Tests for markAsRead
  describe("markAsRead", () => {
    it("should mark a message as read", async () => {
      const updatedMessage = {
        ...mockMessageResponse,
        read: true,
        readTimestamp: new Date("2025-04-15T10:35:00").toISOString(),
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: updatedMessage });

      const result = await markAsRead("msg-123");

      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/messages/msg-123/read");
      expect(result).toEqual({
        success: true,
        message: updatedMessage,
      });
    });

    it("should handle errors when marking a message as read", async () => {
      mockedAxios.patch.mockRejectedValueOnce({
        response: {
          data: { message: "Message not found" },
          status: 404,
        },
      });

      const result = await markAsRead("non-existent-id");

      expect(result).toEqual({
        success: false,
        error: "Message not found",
      });
    });
  });

  // Tests for WebSocket subscriptions
  describe("WebSocket message subscriptions", () => {
    it("should subscribe to new messages", () => {
      // Call the subscription function
      subscribeToNewMessages("test-patient-1", mockMessageHandler);

      // Check that socket.io client was initialized correctly
      expect(mockedIO).toHaveBeenCalledWith(expect.any(String), expect.any(Object));

      // Check that event handlers were registered
      expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("new_message", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("error", expect.any(Function));
    });

    it("should handle incoming messages through WebSocket", () => {
      // Setup subscription
      subscribeToNewMessages("test-patient-1", mockMessageHandler);

      // Get the event handler registered with the mock socket
      const newMessageHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "new_message",
      )?.[1];

      // Make sure we found the handler
      expect(newMessageHandler).toBeDefined();

      if (newMessageHandler) {
        // Simulate an incoming message event
        newMessageHandler(mockMessageResponse);

        // Verify the message handler was called with the message
        expect(mockMessageHandler).toHaveBeenCalledWith(mockMessageResponse);
      }
    });

    it("should unsubscribe from messages and disconnect", () => {
      // First subscribe
      subscribeToNewMessages("test-patient-1", mockMessageHandler);

      // Then unsubscribe
      unsubscribeFromNewMessages();

      // Check that the socket was properly cleaned up
      expect(mockSocket.off).toHaveBeenCalledWith("new_message");
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it("should attempt reconnection on socket errors", () => {
      // Setup subscription
      subscribeToNewMessages("test-patient-1", mockMessageHandler);

      // Find the error handler
      const errorHandler = mockSocket.on.mock.calls.find((call) => call[0] === "error")?.[1];

      // Make sure we found the handler
      expect(errorHandler).toBeDefined();

      if (errorHandler) {
        // Simulate an error event
        errorHandler(new Error("Socket error"));

        // Check that a reconnection attempt was made
        // This depends on your implementation, but typically would re-initialize the socket
        expect(mockSocket.disconnect).toHaveBeenCalled();

        // Check that IO was called again for reconnection
        // This assumes your implementation attempts to reconnect on error
        expect(mockedIO.mock.calls.length).toBeGreaterThan(1);
      }
    });
  });
});
