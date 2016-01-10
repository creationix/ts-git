/// <reference path="node.d.ts" />

enum Mode {
  tree = 0o40000,
  blob = 0o100644,
  exec = 0o100755,
  sym = 0o120000,
  commit = 0o160000,
}

interface GitDate {
  seconds: number,
  offset: number,
}

interface Person {
  name: string,
  email: string,
  date: GitDate,
}

interface Commit {
  parents?: Array<string>,
  tree: string,
  author: Person,
  committer?: Person,
  message: string,
}

interface Tag {
  object: string,
  type: string,
  tag: string,
  tagger: Person,
  message: string,
}

interface TreeNode {
  name: string,
  mode: Mode,
  hash: string,
}

interface ByteArray {
  [index: number]: number,
  length: number,
}

function fromRaw(raw: string): ByteArray {
  var length = raw.length;
  var buf = new Uint8Array(length);
  for (var i = 0; i < length; i++) {
    buf[i] = raw.charCodeAt(i);
  }
  return buf;
}

function toRaw(buf: ByteArray): string {
  var length = buf.length;
  var raw = "";
  for (var i = 0; i < length; i++) {
    raw += String.fromCharCode(buf[i]);
  }
  return raw;
}

function encodeUtf8(unicode: string): string {
  return unescape(encodeURIComponent(unicode));
}

function two(num: number): string {
  return (num < 10 ? "0" : "") + num;
}

function codeToNibble(code: number): number { 
  code |= 0; 
  return (code - ((code & 0x40) ? 0x57 : 0x30))|0; 
}

function decodeHex(hex: string): string { 
  var j = 0, l = hex.length; 
  var raw = ""; 
  while (j < l) { 
    raw += String.fromCharCode( 
      (codeToNibble(hex.charCodeAt(j++)) << 4) 
      | codeToNibble(hex.charCodeAt(j++)) 
    ); 
  } 
  return raw; 
} 


function encodeDate(date: GitDate): string {
  var neg = "+";
  var offset = date.offset;
  if (offset < 0) {
    offset = -offset;
    neg = "-";
  }
  return date.seconds + " " + neg + two((offset / 60) | 0) + two(offset % 60);
}

function safe(string: string): string { 
 return string.replace(/(?:^[\.,:;<>"']+|[\0\n<>]+|[\.,:;<>"']+$)/gm, ""); 
} 

function encodePerson(person: Person): string {
  return safe(person.name) + " <" + safe(person.email) + "> " +
         encodeDate(person.date);
}

function encodeCommit(commit: Commit): string {
  var raw = "";
  if (commit.parents) {
    for (var i = 0, l = commit.parents.length; i < l; i++) {
      raw += "parent " + commit.parents[i] + "\n";
    }
  }
  raw += "tree " + commit.tree +
    "\nauthor " + encodePerson(commit.author) +
    "\ncommitter " + encodePerson(commit.committer || commit.author) +
    "\n\n" + encodeUtf8(commit.message);
  return raw;
}

function encodeTree(tree: Array<TreeNode>): string {
  var raw = "";
  for (var i = 0, l = tree.length; i < l; i++) {
    var node = tree[i];
    raw += node.mode.toString(8) + 
           " " + encodeUtf8(node.name) +
           "\0" + decodeHex(node.hash);
  }
  return raw;
}

var commit: Commit = {
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

var encoded = encodeCommit(commit);


console.log(encoded);

function frame(type: string, raw: string): string {
  return type + " " + raw.length + "\0" + raw;
}

var buf = fromRaw(frame("commit", encoded));

import { createHash } from "crypto";

var hash = createHash("sha1").update(buf).digest("hex");

function assert(condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message || "assertion failed");
  }
}

console.log("commit hash", hash);
assert(hash === "e834d5aa95f9758c59cf127097d7ce2a0799e0b5", "hash mismatch for sample commit");

var tree: Array<TreeNode> = [
  { name: ".gitignore", mode: Mode.blob,
    hash: "a6c7c2852d068ff1fef480ac369459598a62f82e"},
  { name: "main.ts", mode: Mode.blob,
    hash: "4054c0e5faccb9c0368aa685345e05e469cb0bd3"},
];
encoded = encodeTree(tree);
console.log(encoded);

buf = fromRaw(frame("tree", encoded));
hash = createHash("sha1").update(buf).digest("hex")
console.log("tree hash", hash);
assert(hash === "419ccfe916484efb8a5d039d7e4624d1662fd256", "hash mismatch for sample tree");

encoded = "*.js\n";
buf = fromRaw(frame("blob", encoded));
hash = createHash("sha1").update(buf).digest("hex")
console.log("blob hash", hash);
assert(hash === "a6c7c2852d068ff1fef480ac369459598a62f82e", "hash mismatch for sample blob");
