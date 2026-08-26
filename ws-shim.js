// WebSocket shim for React Native
// This module provides a minimal WebSocket implementation for use in React Native

const EventEmitter = require('events');

class WebSocket extends EventEmitter {
  constructor(url, protocols) {
    super();
    this.url = url;
    this.protocols = protocols || [];
    this.readyState = 0; // CONNECTING
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.bufferedAmount = 0;
    this.extensions = '';
  }

  send(data) {
    if (this.readyState !== 1) {
      throw new Error('WebSocket is not open');
    }
    // No-op in React Native environment - messages are not actually sent
  }

  close(code, reason) {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose({ code, reason });
    }
    this.emit('close', { code, reason });
  }

  addEventListener(event, handler) {
    this.on(event, handler);
  }

  removeEventListener(event, handler) {
    this.off(event, handler);
  }

  // Constants
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
}

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

module.exports = WebSocket;
module.exports.default = WebSocket;
