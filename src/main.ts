
import sha1 from "./sha1"
import run from "./run"
import * as Git from "./git"

function assert(condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message || "assertion failed");
  }
}

var commit: Git.Commit = {
  tree: "419ccfe916484efb8a5d039d7e4624d1662fd256",
  author: {
    name: "Tim Caswell",
    email: "tim@creationix.com",
    date: {
      seconds: 1452402719,
      offset: -6*60,
    },
  },
  message: "Initial interface commit\n"
};

var encoded = Git.frame("commit", commit);
var hash = sha1(encoded);
console.log({
  hash: hash,
  encoded: encoded,
});
assert(hash === "e834d5aa95f9758c59cf127097d7ce2a0799e0b5", "hash mismatch for sample commit");

var tree: Array<Git.TreeNode> = [
  { name: "main.ts", mode: Git.Mode.blob,
    hash: "4054c0e5faccb9c0368aa685345e05e469cb0bd3"},
  { name: ".gitignore", mode: Git.Mode.blob,
    hash: "a6c7c2852d068ff1fef480ac369459598a62f82e"},
];
encoded = Git.frame("tree", tree);
hash = sha1(encoded);
console.log({
  hash: hash,
  encoded: encoded,
});
assert(hash === "419ccfe916484efb8a5d039d7e4624d1662fd256", "hash mismatch for sample tree");

var blob = "*.js\n";
encoded = Git.frame("blob", blob);
hash = sha1(encoded)
console.log({
  hash: hash,
  encoded: encoded,
});
assert(hash === "a6c7c2852d068ff1fef480ac369459598a62f82e", "hash mismatch for sample blob");

var socket = new WebSocket("ws://localhost:8080/net/tls/github.com/443", ["ws-proxy"]);
socket.binaryType = "arraybuffer";
socket.onopen = function(evt: Event) {
  console.log("open");
};
socket.onmessage = function(evt: MessageEvent) {
  console.log(evt.data);
  if (evt.data === "connected") {
    startClone();
  }
};
socket.onclose = function(evt: CloseEvent) {
  console.log("close", evt.code);
};

function startClone() {
  socket.onmessage = function(evt: MessageEvent) {
    console.log("received", evt.data);
  }
  socket.send("GET /")
}


// See http(s) section in https://git-scm.com/book/en/v2/Git-Internals-Transfer-Protocols
run(function* () {
  console.log("Connecting to git repo through proxy...");
  var socket = yield* connect("tls", "github.com", "443");
  console.log("Connected to remote. Sending HTTP request...");
  var path = "/creationix/conquest.git/info/refs?service=git-upload-pack";
  var request = "GET " + path + " HTTP/1.1\r\nHost: github.com\r\n\r\n";
  yield* socket.write(request);

//  yield* sleep(200);
  do {
    var chunk = yield* socket.read();
    console.log(chunk);
    console.log(toString(chunk));
  } while (chunk);
}, function(err, result) {
  console.log({ err, result });
});

function* sleep(ms) {
  yield function (cb) {
    setTimeout(cb, ms);
  };
}


function* connect(protocol, host, port) {
  var socket = new WebSocket("wss://tedit.creationix.com/proxy/" + protocol + "/" + host + "/" + port);
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

  return {
    read: read,
    write: write,
  };

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

function toString(buffer) {
  var str = "";
  for (var i = 0, l = buffer.length; i < l; i++) {
    str += String.fromCharCode(buffer[i]);
  }
  // Decode UTF8
  return decodeURIComponent(escape(str));
}


////////////////////////////// gen run //////////////////////

