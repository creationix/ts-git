
import {Mode, GitDate, Person, Commit, Tag, TreeNode} from "./git"
import {encodeUtf8} from "./bodec"

function codeToNibble(code: number): number {
  code |= 0;
  return (code - ((code & 0x40) ? 0x57 : 0x30)) | 0;
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

function two(num: number): string {
  return (num < 10 ? "0" : "") + num;
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

export function encodeCommit(commit: Commit): string {
  if (!commit.parents) { commit.parents = []; }
  if (!commit.committer) { commit.committer = commit.author; }
  var raw = "";
  for (var i = 0, l = commit.parents.length; i < l; i++) {
    raw += "parent " + commit.parents[i] + "\n";
  }
  raw += "tree " + commit.tree +
    "\nauthor " + encodePerson(commit.author) +
    "\ncommitter " + encodePerson(commit.committer) +
    "\n\n" + encodeUtf8(commit.message);
  return raw;
}

export function encodeTag(tag: Tag): string {
  return "object " + tag.object +
    "\ntype " + tag.type +
    "\ntag " + tag.tag +
    "\ntagger " + encodePerson(tag.tagger) +
    "\n\n" + encodeUtf8(tag.message);
}

function treeSort(a: TreeNode, b: TreeNode): number {
  var aa = (a.mode === Mode.tree) ? a.name + "/" : a.name;
  var bb = (b.mode === Mode.tree) ? b.name + "/" : b.name;
  return aa > bb ? 1 : aa < bb ? -1 : 0;
}

export function encodeTree(tree: Array<TreeNode>): string {
  var raw = "";
  tree.sort(treeSort);
  for (var i = 0, l = tree.length; i < l; i++) {
    var node = tree[i];
    raw += node.mode.toString(8) +
      " " + encodeUtf8(node.name) +
      "\0" + decodeHex(node.hash);
  }
  return raw;
}
