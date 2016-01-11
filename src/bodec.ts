// Declare non-standard, browser and node globals.
declare function escape(input: string): string;
declare function unescape(input: string): string;

export interface ByteArray {
  [index: number]: number,
  length: number,
}

export function fromRaw(raw: string): ByteArray {
  var length = raw.length;
  var buf = new Uint8Array(length);
  for (var i = 0; i < length; i++) {
    buf[i] = raw.charCodeAt(i);
  }
  return buf;
}

export function toRaw(buf: ByteArray): string {
  var length = buf.length;
  var raw = "";
  for (var i = 0; i < length; i++) {
    raw += String.fromCharCode(buf[i]);
  }
  return raw;
}

export function encodeUtf8(unicode: string): string {
  return unescape(encodeURIComponent(unicode));
}

export function decodeUtf8(raw: string): string {
  return decodeURIComponent(escape(raw));
}
