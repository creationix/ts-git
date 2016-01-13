
import sha1 from "./sha1"
import run from "./run"
import connect, {Stream} from "./connect"
import * as Git from "./git"
import {toRaw} from "./bodec"

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

window.onload = function() {
  // See http(s) section in https://git-scm.com/book/en/v2/Git-Internals-Transfer-Protocols
  run(function* () {
    console.log("Connecting to git repo through proxy...");
    var socket: Stream = yield* connect("tls", "github.com", 443);
    console.log("Connected to remote. Sending HTTP request...");
    var path = "/creationix/conquest.git/info/refs?service=git-upload-pack";
    var request = "GET " + path + " HTTP/1.1\r\nHost: github.com\r\n\r\n";
    yield* socket.write(request);
    do {
      var chunk = yield* socket.read();
      console.log(toRaw(chunk));
    } while (chunk);
  } ());
};