const EventEmitter = require("events");

class WebSocket extends EventEmitter {
  constructor(url, options = {}) {
    super();
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.bufferedAmount = 0;
  }

  static get CONNECTING() {
    return 0;
  }
  static get OPEN() {
    return 1;
  }
  static get CLOSING() {
    return 2;
  }
  static get CLOSED() {
    return 3;
  }

  send(data, callback) {
    this.emit("send", data);
    if (callback) callback();
  }

  close(code, reason) {
    this.readyState = WebSocket.CLOSING;
    this.emit("close", code, reason);
  }

  // Test helpers
  connect() {
    this.readyState = WebSocket.OPEN;
    this.emit("open");
  }

  disconnect() {
    this.readyState = WebSocket.CLOSED;
    this.emit("close");
  }

  simulateMessage(data) {
    this.emit("message", data);
  }
}

module.exports = WebSocket;
