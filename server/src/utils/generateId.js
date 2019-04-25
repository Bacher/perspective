import crypto from 'crypto';
import bs58 from 'bs58';

const seed = crypto.randomBytes(32).toString('base64');

let lastIndex = 0;

export default function generateId() {
  const index = ++lastIndex;

  const hash = crypto.createHash('sha256');
  hash.update(`${index}${seed}`);
  return bs58.encode(hash.digest()).substr(0, 16);
}
