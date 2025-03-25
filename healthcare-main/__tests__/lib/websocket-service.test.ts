import { describe, it, expect, vi, beforeEach } from "vitest";
import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { websocketService } from "@/lib/websocket-service";
import { db } from "@/lib/db";

// Mock socket.io
vi.mock("socket.io", () => ({
  Server: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
    except: vi.fn().mockReturnThis(),
    close: vi.fn(),
  })),
}));

// Mock Prisma
vi.mock("@/lib/db", () => ({
  db: {
    message: {
      count: vi.fn().mockResolvedValue(0),
    },
  },
}));

describe("WebSocket Service", () => {
  let mockServer: HttpServer;
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {} as HttpServer;
    mockSocket = {
      id: "test-socket-id",
      emit: vi.fn(),
      on: vi.fn(),
    };
  });

  describe("Initialization", () => {
    it("should initialize WebSocket server", () => {
      websocketService.initialize(mockServer);
      expect(Server).toHaveBeenCalledWith(mockServer, expect.any(Object));
    });

    it("should handle user connection", () => {
      const mockIo = {
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === "connection") {
            callback(mockSocket);
          }
        }),
      };

      (Server as jest.Mock).mockImplementation(() => mockIo);
      websocketService.initialize(mockServer);

      expect(mockIo.on).toHaveBeenCalledWith("connection", expect.any(Function));
    });
  });

  describe("Authentication", () => {
    it("should handle user authentication", async () => {
      const userId = "test-user-id";
      const mockIo = {
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === "connection") {
            callback(mockSocket);
          }
        }),
      };

      (Server as jest.Mock).mockImplementation(() => mockIo);
      websocketService.initialize(mockServer);

      // Simulate authentication event
      const authCallback = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === "authenticate"
      )[1];
      await authCallback(userId);

      expect(mockSocket.emit).toHaveBeenCalledWith("unreadCount", 0);
    });
  });

  describe("Message Broadcasting", () => {
    it("should broadcast messages to all users", async () => {
      const mockIo = {
        emit: vi.fn(),
      };

      (Server as jest.Mock).mockImplementation(() => mockIo);
      websocketService.initialize(mockServer);

      const event = "test-event";
      const data = { message: "test" };
      await websocketService.broadcast(event, data);

      expect(mockIo.emit).toHaveBeenCalledWith(event, data);
    });

    it("should send message to specific user", async () => {
      const userId = "test-user-id";
      const mockIo = {
        to: vi.fn().mockReturnThis(),
        emit: vi.fn(),
      };

      (Server as jest.Mock).mockImplementation(() => mockIo);
      websocketService.initialize(mockServer);

      const event = "test-event";
      const data = { message: "test" };
      await websocketService.sendToUser(userId, event, data);

      expect(mockIo.to).toHaveBeenCalledWith(expect.any(String));
      expect(mockIo.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe("Cleanup", () => {
    it("should cleanup resources on cleanup", () => {
      const mockIo = {
        close: vi.fn(),
      };

      (Server as jest.Mock).mockImplementation(() => mockIo);
      websocketService.initialize(mockServer);

      websocketService.cleanup();
      expect(mockIo.close).toHaveBeenCalled();
    });
  });
}); 