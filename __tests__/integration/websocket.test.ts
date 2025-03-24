import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { createServer } from "http";
import type { AddressInfo } from "net";

describe("WebSocket Functionality", () => {
  let io: Server;
  let clientSocket: ReturnType<typeof Client>;
  let httpServer: ReturnType<typeof createServer>;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = Client(`http://localhost:${port}`, {
        transports: ["websocket"],
        forceNew: true,
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll((done) => {
    io.close(() => {
      clientSocket.close();
      httpServer.close(() => {
        done();
      });
    });
  });

  describe("Real-time Messaging", () => {
    it("should send and receive messages", (done) => {
      const message = { text: "Hello World" };

      clientSocket.on("message", (data: any) => {
        expect(data).toEqual(message);
        done();
      });

      io.emit("message", message);
    });

    it("should notify when message is delivered", (done) => {
      const message = { text: "Test message" };

      clientSocket.on("messageDelivered", (data: any) => {
        expect(data).toEqual({
          status: "delivered",
          messageId: expect.any(String),
        });
        done();
      });

      clientSocket.emit("message", message);
    });
  });

  describe("Schedule Updates", () => {
    it("should notify when appointment is created", (done) => {
      const appointment = {
        id: "1",
        date: "2024-03-20",
        time: "10:00",
        patientId: "pat1",
        doctorId: "doc1",
      };

      clientSocket.on("appointmentCreated", (data: any) => {
        expect(data).toEqual(appointment);
        done();
      });

      io.emit("appointmentCreated", appointment);
    });

    it("should notify when appointment is updated", (done) => {
      const update = {
        id: "1",
        status: "CONFIRMED",
      };

      clientSocket.on("appointmentUpdated", (data: any) => {
        expect(data).toEqual(update);
        done();
      });

      io.emit("appointmentUpdated", update);
    });
  });
});
