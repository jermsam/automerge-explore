declare module 'hypercore-crypto' {
  import { Buffer } from 'buffer';

  const sodium: any;
  const c: any;
  const b4a: any;

  const LEAF_TYPE: Buffer;
  const PARENT_TYPE: Buffer;
  const ROOT_TYPE: Buffer;
  const HYPERCORE: Buffer;

  export function keyPair(seed?: Buffer): { publicKey: Buffer, secretKey: Buffer };

  export function validateKeyPair(keyPair: { publicKey: Buffer, secretKey: Buffer }): boolean;

  export function sign(message: Buffer, secretKey: Buffer): Buffer;

  export function verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean;

  export function data(data: Buffer): Buffer;

  export function parent(a: { index: number, size: number, hash: Buffer }, b: { index: number, size: number, hash: Buffer }): Buffer;

  export function tree(roots: Array<{ hash: Buffer, index: number, size: number }>, out?: Buffer): Buffer;

  export function hash(data: Buffer | Buffer[], out?: Buffer): Buffer;

  export function randomBytes(n: number): Buffer;

  export function discoveryKey(publicKey: Buffer): Buffer;

  export function free(secureBuf: { secure: boolean }): void;

  export function namespace(name: string | Buffer, count: number | Array<number>): Buffer[];

  export = {
    keyPair,
    validateKeyPair,
    sign,
    verify,
    data,
    parent,
    tree,
    hash,
    randomBytes,
    discoveryKey,
    free,
    namespace
  };
}
