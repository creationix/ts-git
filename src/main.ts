
import sha1 from "./sha1"
import {fromRaw, ByteArray} from "./bodec"
import * as Git from "./git"

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

var encoded = Git.encodeCommit(commit);


console.log(encoded);

function frame(type: string, raw: string): string {
  return type + " " + raw.length + "\0" + raw;
}

var buf = frame("commit", encoded);

var hash = sha1(buf);

function assert(condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message || "assertion failed");
  }
}

console.log("commit hash", hash);
assert(hash === "e834d5aa95f9758c59cf127097d7ce2a0799e0b5", "hash mismatch for sample commit");

var tree: Array<Git.TreeNode> = [
  { name: "main.ts", mode: Git.Mode.blob,
    hash: "4054c0e5faccb9c0368aa685345e05e469cb0bd3"},
  { name: ".gitignore", mode: Git.Mode.blob,
    hash: "a6c7c2852d068ff1fef480ac369459598a62f82e"},
];
encoded = Git.encodeTree(tree);
console.log(encoded);

buf = frame("tree", encoded);
hash = sha1(buf)
console.log("tree hash", hash);
assert(hash === "419ccfe916484efb8a5d039d7e4624d1662fd256", "hash mismatch for sample tree");

encoded = "*.js\n";
buf = frame("blob", encoded);
hash = sha1(buf)
console.log("blob hash", hash);
assert(hash === "a6c7c2852d068ff1fef480ac369459598a62f82e", "hash mismatch for sample blob");
