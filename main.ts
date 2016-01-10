enum Mode {
  tree = 040000,
  blob = 0100644,
  exec = 0100755,
  sym = 0120000,
  commit = 0160000,
}

interface Date {
  seconds: number,
  offset: number,
}

interface Person {
  name: string,
  email: string,
  date: Date,
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

function two(num: number): string {
  return (num < 10 ? "0" + num : "") + num;
}

function encodeDate(date: Date): string {
  var neg = "+";
  var offset = date.offset;
  if (offset < 0) {
    offset = -offset;
    neg = "-";
  }
  return date.seconds + " " + neg + two((offset / 60) | 0) + two(offset % 60);
}

function encodePerson(person: Person): string {
  return person.name + " <" + person.email + "> " + encodeDate(person.date);
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
    "\n\n" + commit.message;
  return raw;
}

