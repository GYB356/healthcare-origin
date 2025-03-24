import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    conversation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  },
}));

describe("Messages API", () => {
  const mockSession = {
    user: {
      id: "user-id",
      role: "DOCTOR",
    },
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/messages", () => {
    it("should create a new message", async () => {
      const mockConversation = {
        id: "conversation-id",
        doctor: { id: "doctor-id" },
        patient: { id: "patient-id" },
      };

      const mockMessage = {
        id: "message-id",
        content: "Test message",
        senderId: "user-id",
        conversationId: "conversation-id",
      };

      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const { req, res } = createMocks({
        method: "POST",
        body: {
          content: "Test message",
          conversationId: "conversation-id",
        },
      });

      const handler = require("@/pages/api/messages").default;
      await handler(req, res);

      // Assertions
      expect(res._getStatusCode()).toBe(201);
      expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: "conversation-id" },
        include: { doctor: true, patient: true },
      });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          content: "Test message",
          senderId: "user-id",
          conversationId: "conversation-id",
        },
      });
      expect(JSON.parse(res._getData())).toEqual(mockMessage);
    });

    it("should return 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: "POST",
        body: {
          content: "Test message",
          conversationId: "conversation-id",
        },
      });

      const handler = require("@/pages/api/messages").default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it("should return 404 if conversation not found", async () => {
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: "POST",
        body: {
          content: "Test message",
          conversationId: "conversation-id",
        },
      });

      const handler = require("@/pages/api/messages").default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe("Other HTTP Methods", () => {
    it("should return 405 for methods other than POST", async () => {
      // Create mocked request and response
      const { req, res } = createMocks({
        method: "GET",
      });

      // Call the API handler
      await messageHandler(req, res);

      // Assertions
      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({ error: "Method not allowed" });
    });
  });
});
