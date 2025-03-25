import "@testing-library/jest-dom";
import { vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { getServerSession } from "next-auth";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
}));

// Mock bcrypt
vi.mock("bcrypt", () => ({
  hash: vi.fn().mockResolvedValue("hashed_password"),
  compare: vi.fn().mockResolvedValue(true),
}));

// Mock nodemailer
vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({ messageId: "test_message_id" }),
  })),
}));

// Mock Redis
vi.mock("ioredis", () => {
  const RedisMock = vi.fn(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue("OK"),
  }));
  return {
    default: RedisMock,
    Redis: RedisMock,
  };
});

// Mock next/server
vi.mock("next/server", () => {
  class NextResponse {
    static json(data: any, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          "content-type": "application/json",
          ...init?.headers,
        },
      });
    }
  }

  class NextRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(input, init);
    }

    json() {
      return this.json();
    }

    nextUrl = new URL(this.url);
  }

  return {
    NextResponse,
    NextRequest,
  };
});

// Mock Prisma
const prismaMock = mockDeep<PrismaClient>();
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => prismaMock),
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  mockReset(prismaMock);
});

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Suppress console.error in tests
const consoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = consoleError;
});

export { prismaMock };
