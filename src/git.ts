export enum Mode {
  tree = 0o40000,
  blob = 0o100644,
  exec = 0o100755,
  sym = 0o120000,
  commit = 0o160000,
}

export interface GitDate {
  seconds: number,
  offset: number,
}

export interface Person {
  name: string,
  email: string,
  date: GitDate,
}

export interface Commit {
  parents?: Array<string>,
  tree: string,
  author: Person,
  committer?: Person,
  message: string,
}

export interface Tag {
  object: string,
  type: string,
  tag: string,
  tagger: Person,
  message: string,
}

export interface TreeNode {
  name: string,
  mode: Mode,
  hash: string,
}

export * from "./git-encoders"