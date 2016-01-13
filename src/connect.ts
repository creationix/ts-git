import { ByteArray } from "./bodec";
import { Continuable } from "./run";

export interface Stream {
  read (),
  write (chunk: string),
  write (chunk: ByteArray),
}

export default function* connect(protocol: string, host: string, port: number): IterableIterator<Continuable> {
  var url = ("" + document.location).replace(/^http/, "ws") + "net/";
  var socket = new WebSocket(url + protocol + "/" + host + "/" + port, "ws-proxy");
  socket.binaryType = "arraybuffer";
  var pending;
  var buffer = [];
  yield function (cb) {
    socket.onmessage = function (evt) {
      if (evt.data === "connect") {
        return cb();
      }
      if (typeof evt.data === "string") {
        console.log(evt.data);
      }
      else {
        buffer.push(evt.data);
        if (pending) flush();
      }
    };
  };
  var stream: Stream = {
    read: read,
    write: write,
  };
  return stream;

  function flush() {
    var cb = pending;
    pending = null;
    var data;
    if (buffer.length === 1) {
      data = new Uint8Array(buffer[0]);
    }
    else {
      var count = 0;
      var i, l;
      for (i = 0, l = buffer.length; i < l; i++) {
        count += buffer[i].byteLength;
      }
      data = new ArrayBuffer(count);
      count = 0;
      for (i = 0, l = buffer.length; i < l; i++) {
        var src = new Uint8Array(buffer[i]);
        var dst = new Uint8Array(data, count, src.length);
        dst.set(src);
        count += src.length;
      }
      data = new Uint8Array(data);
    }
    buffer.length = 0;
    cb(null, data);
  }

  function* write(data) {
    return socket.send(data);
  }
  function* read() {
    return yield function (cb) {
      pending = cb;
      if (buffer.length) { flush(); }
    };
  }
}